import { useState } from 'react';
import ProductList from './components/ProductList';
import InventoryView from './components/InventoryView';
import DailySales from './components/DailySales';
import Seeder from './components/Seeder';
import { Gamepad2, Package, ShoppingCart } from 'lucide-react';
import { TransactionService } from './services/transactions';
import './App.css';

// Simple Modal for Change Calculation (Inline for simplicity in reset)
function ChangeModal({ total, onClose, onConfirm }) {
  const [payAmount, setPayAmount] = useState('');
  const change = Math.max(0, parseFloat(payAmount || 0) - total);
  const canPay = parseFloat(payAmount || 0) >= total;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card" style={{ padding: '2rem', width: '100%', maxWidth: '400px', background: 'var(--bg-card)' }}>
        <h2>💰 Finalizar Venta</h2>
        <div style={{ margin: '1.5rem 0' }}>
          <p style={{ color: 'var(--text-muted)' }}>Total a Pagar:</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>${total.toFixed(2)}</div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Efectivo Recibido:</label>
          <input
            type="number"
            autoFocus
            value={payAmount}
            onChange={e => setPayAmount(e.target.value)}
            style={{
              width: '100%', padding: '1rem', fontSize: '1.5rem',
              background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white'
            }}
          />
        </div>

        {canPay ? (
          <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <span style={{ display: 'block', fontSize: '0.9rem', color: '#86efac' }}>Cambio a entregar:</span>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4ade80' }}>${change.toFixed(2)}</span>
          </div>
        ) : (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <span style={{ color: '#fca5a5' }}>Falta cubrir monto completo</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn" onClick={onClose} style={{ flex: 1, background: '#334155' }}>Cancelar</button>
          <button
            className="btn btn-primary"
            disabled={!canPay}
            onClick={() => onConfirm(parseFloat(payAmount), change.toFixed(2))}
            style={{ flex: 1, opacity: canPay ? 1 : 0.5 }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState('pos'); // 'pos' | 'inventory' | 'sales'
  const [cart, setCart] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const total = cart.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

  // --- POS Logic ---
  const addToCart = (product) => {
    if (product.stock <= 0) return alert("¡Sin stock!");

    // Check local cart stock usage
    const inCartCount = cart.filter(item => item.id === product.id).length;
    if (inCartCount >= product.stock) return alert("¡No queda más stock disponible!");

    setCart([...cart, product]);
  };

  const clearCart = () => setCart([]);

  const handleSaleConfirm = async (paid, change) => {
    try {
      // Preparar items para la DB
      const saleItems = cart.map(item => ({
        product_id: item.id,
        quantity: 1, // Por ahora el carrito POS simplificado maneja 1 item por linea
        unit_price: item.price,
        unit_cost: item.cost || 0
      }));

      await TransactionService.createSale(
        total,
        'cash', // Hardcoded por ahora
        saleItems
      );

      alert(`✅ VENTA REGISTRADA EXITOSAMENTE\n\nCambio a entregar: $${change}`);
      clearCart();
      setIsModalOpen(false);

    } catch (error) {
      console.error("Error en venta:", error);
      alert("❌ Error al procesar la venta: " + error.message);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '120px' }}>
      {/* --- HEADER --- */}
      <header style={{
        padding: '2rem 0',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Gamepad2 size={48} color="var(--primary)" />
          <h1 style={{ fontSize: '3rem', margin: 0, textShadow: '0 0 20px var(--primary-glow)' }}>
            PixelStore
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          Videojuegos, Consolas y Accesorios
        </p>

        {view === 'pos' && (
          <div style={{ width: '100%', maxWidth: '600px', position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '1rem 1.5rem', fontSize: '1.25rem',
                borderRadius: '50px', border: '2px solid rgba(255,255,255,0.2)',
                background: 'rgba(0,0,0,0.3)', color: 'white', outline: 'none',
                backdropFilter: 'blur(5px)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            />
          </div>
        )}
      </header>

      {/* --- MENU --- */}
      <nav style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <button
          className={`btn ${view === 'pos' ? 'btn-primary' : ''}`}
          style={{
            background: view === 'pos' ? '' : 'rgba(255,255,255,0.05)',
            color: view === 'pos' ? '' : 'var(--text-muted)'
          }}
          onClick={() => setView('pos')}
        >
          <Gamepad2 size={20} style={{ marginRight: '0.5rem' }} /> Catálogo
        </button>
        <button
          className={`btn ${view === 'inventory' ? 'btn-primary' : ''}`}
          style={{
            background: view === 'inventory' ? '' : 'rgba(255,255,255,0.05)',
            color: view === 'inventory' ? '' : 'var(--text-muted)'
          }}
          onClick={() => setView('inventory')}
        >
          <Package size={20} style={{ marginRight: '0.5rem' }} /> Inventario
        </button>
        <button
          className={`btn ${view === 'sales' ? 'btn-primary' : ''}`}
          style={{
            background: view === 'sales' ? '' : 'rgba(255,255,255,0.05)',
            color: view === 'sales' ? '' : 'var(--text-muted)'
          }}
          onClick={() => setView('sales')}
        >
          <ShoppingCart size={20} style={{ marginRight: '0.5rem' }} /> Ventas
        </button>
      </nav>

      <main>
        {view === 'pos' ? (
          <ProductList addToCart={addToCart} cart={cart} searchTerm={searchTerm} />
        ) : view === 'inventory' ? (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <InventoryView />
            <div style={{ marginTop: '4rem', opacity: 0.5 }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#475569' }}>⚠️ Zona de Peligro</h3>
              <Seeder />
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <DailySales />
          </div>
        )}
      </main>

      {/* --- CART FLOATING BAR --- */}
      {view === 'pos' && cart.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          backgroundColor: 'var(--bg-card)',
          borderTop: '1px solid var(--primary)',
          boxShadow: '0 -5px 20px rgba(0,0,0,0.5)',
          padding: '1.5rem', zIndex: 100
        }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                background: 'var(--primary)', color: 'white', width: '60px', height: '60px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem',
                boxShadow: '0 0 15px var(--primary-glow)'
              }}>
                {cart.length}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total a Pagar</span>
                <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn" onClick={clearCart} style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                Cancelar
              </button>
              <button
                className="btn btn-primary btn-large"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}
                onClick={() => setIsModalOpen(true)}
              >
                COBRAR <ShoppingCart size={24} style={{ marginLeft: '10px' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && <ChangeModal total={total} onClose={() => setIsModalOpen(false)} onConfirm={handleSaleConfirm} />}
    </div>
  );
}

export default App;
