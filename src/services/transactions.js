import { supabase } from '../lib/supabase';

export const TransactionService = {
  /**
   * Registra una venta completa (POS)
   * @param {number} total 
   * @param {string} paymentMethod 
   * @param {Array} items - [{ product_id, quantity, unit_price, unit_cost }]
   */
  async createSale(total, paymentMethod, items) {
    const { data, error } = await supabase.rpc('process_sale', {
      p_total: total,
      p_payment_method: paymentMethod,
      p_items: items
    });
    if (error) throw error;
    return data;
  },

  /**
   * Ajuste manual de stock (Entrada/Salida) o Envíos
   * @param {string} productId 
   * @param {number} quantityChange - Positivo (entrada) o Negativo (salida)
   * @param {string} reason - 'DAMAGED', 'GIFT', 'CORRECTION', 'SHIPMENT_OUT', 'RETURN_IN'
   * @param {string} notes 
   */
  async adjustStock(productId, quantityChange, reason, notes = '') {
    const { error } = await supabase.rpc('adjust_stock', {
      p_product_id: productId,
      p_quantity_change: parseInt(quantityChange),
      p_reason: reason,
      p_notes: notes
    });
    if (error) throw error;
  },

  /**
   * Recibir compra de proveedores
   * @param {string} supplierId 
   * @param {Array} items - [{ product_id, quantity, unit_cost }]
   */
  async receivePurchase(supplierId, items) {
    const { data, error } = await supabase.rpc('process_purchase_receipt', {
      p_supplier_id: supplierId,
      p_items: items
    });
    if (error) throw error;
    return data;
  },

  /**
   * Listar proveedores (Helper para UI de compras)
   */
  async getSuppliers() {
      const { data, error } = await supabase.from('suppliers').select('*').order('name');
      if (error) throw error;
      return data;
  }
};
