-- ==========================================
-- 1. FUNCIÓN: REGISTRAR VENTA (POS)
-- ==========================================
-- Esta función realiza todo en una sola transacción:
-- 1. Crea la venta en 'sales'
-- 2. Crea los items en 'sale_items'
-- 3. Descuenta el stock en 'products'
-- 4. Registra el movimiento en 'stock_movements'

CREATE OR REPLACE FUNCTION process_sale(
  p_total numeric,
  p_payment_method text,
  p_items jsonb -- Array de objetos: [{product_id, quantity, unit_price, unit_cost}]
) RETURNS uuid AS $$
DECLARE
  v_sale_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_quantity int;
  v_unit_price numeric;
  v_unit_cost numeric;
BEGIN
  -- 1. Crear cabecera de venta
  INSERT INTO sales (external_number, total, payment_method, sale_date)
  VALUES (('SALE-' || to_char(now(), 'YYYYMMDD-HH24MISS') || '-' || substring(gen_random_uuid()::text from 1 for 4)), p_total, p_payment_method, now())
  RETURNING id INTO v_sale_id;

  -- 2. Procesar cada item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::int;
    v_unit_price := (v_item->>'unit_price')::numeric;
    v_unit_cost := (v_item->>'unit_cost')::numeric;

    -- A. Insertar sale_item
    INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, unit_cost, total_line)
    VALUES (
      v_sale_id, 
      v_product_id, 
      (SELECT name FROM products WHERE id = v_product_id), 
      v_quantity, 
      v_unit_price, 
      v_unit_cost, 
      (v_quantity * v_unit_price)
    );

    -- B. Descontar Stock
    UPDATE products 
    SET stock = stock - v_quantity, updated_at = now()
    WHERE id = v_product_id;

    -- C. Registrar Movimiento de Stock
    INSERT INTO stock_movements (product_id, change, reason, reference_id, performed_by)
    VALUES (v_product_id, -v_quantity, 'SALE', v_sale_id, 'SYSTEM');
    
  END LOOP;

  RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql;


-- ==========================================
-- 2. FUNCIÓN: AJUSTE DE STOCK (IN/OUT Manual)
-- ==========================================
CREATE OR REPLACE FUNCTION adjust_stock(
  p_product_id uuid,
  p_quantity_change int, -- Positivo para entrada, Negativo para salida
  p_reason text,
  p_notes text DEFAULT ''
) RETURNS void AS $$
BEGIN
  -- 1. Actualizar producto
  UPDATE products 
  SET stock = stock + p_quantity_change, updated_at = now()
  WHERE id = p_product_id;

  -- 2. Registrar movimiento
  INSERT INTO stock_movements (product_id, change, reason, reference_id, performed_by)
  VALUES (p_product_id, p_quantity_change, p_reason, NULL, 'MANUAL_ADJUSTMENT');
END;
$$ LANGUAGE plpgsql;


-- ==========================================
-- 3. FUNCIÓN: RECIBIR COMPRA (PURCHASE RECEIPT)
-- ==========================================
CREATE OR REPLACE FUNCTION process_purchase_receipt(
  p_supplier_id uuid,
  p_items jsonb -- [{product_id, quantity, unit_cost}]
) RETURNS uuid AS $$
DECLARE
  v_receipt_id uuid;
  v_item jsonb;
  v_product_id uuid;
  v_quantity int;
  v_unit_cost numeric;
BEGIN
  -- 1. Crear recibo
  INSERT INTO purchase_receipts (supplier_id, received_at)
  VALUES (p_supplier_id, now())
  RETURNING id INTO v_receipt_id;

  -- 2. Items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::int;
    v_unit_cost := (v_item->>'unit_cost')::numeric;

    -- A. Insertar item recibo
    INSERT INTO purchase_receipt_items (purchase_receipt_id, product_id, quantity, unit_cost)
    VALUES (v_receipt_id, v_product_id, v_quantity, v_unit_cost);

    -- B. Aumentar Stock
    UPDATE products 
    SET stock = stock + v_quantity, cost = v_unit_cost, updated_at = now()
    WHERE id = v_product_id;

    -- C. Movimiento
    INSERT INTO stock_movements (product_id, change, reason, reference_id)
    VALUES (v_product_id, v_quantity, 'PURCHASE_RECEIPT', v_receipt_id);
  END LOOP;

  RETURN v_receipt_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 4. VISTA: HISTORIAL DE VENTAS (Resumen)
-- ==========================================
-- Facilita la consulta de ventas en el frontend
CREATE OR REPLACE VIEW v_sales_history AS
SELECT 
    s.id,
    s.external_number,
    s.total,
    s.payment_method,
    s.sale_date,
    COUNT(si.id) as items_count
FROM sales s
LEFT JOIN sale_items si ON s.id = si.sale_id
GROUP BY s.id, s.external_number, s.total, s.payment_method, s.sale_date;
