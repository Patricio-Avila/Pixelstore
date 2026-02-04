import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, AlertTriangle, CheckCircle, XCircle, Search } from 'lucide-react';

export default function InventoryView() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInventory();
    }, []);

    async function fetchInventory() {
        try {
            // Fetch ALL products, regardless of status
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    product_types ( name )
                `)
                .order('name');

            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            console.error('Error fetching inventory:', err);
        } finally {
            setLoading(false);
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading-state">Cargando inventario...</div>;

    return (
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Package color="var(--accent)" />
                    Inventario Completo
                </h2>

                <div className="search-input-wrapper" style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar por SKU o Nombre..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                            background: 'rgba(0,0,0,0.3)', border: '1px solid #334155', borderRadius: '12px',
                            color: 'white'
                        }}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', borderRadius: '12px 0 0 12px' }}>SKU</th>
                            <th style={{ padding: '1rem' }}>Producto</th>
                            <th style={{ padding: '1rem' }}>Categoría</th>
                            <th style={{ padding: '1rem' }}>Precio</th>
                            <th style={{ padding: '1rem' }}>Stock</th>
                            <th style={{ padding: '1rem', borderRadius: '0 12px 12px 0' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{product.sku}</td>
                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{product.name}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem',
                                        background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent)'
                                    }}>
                                        {product.product_types?.name || 'N/A'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>${product.price}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        color: product.stock === 0 ? 'var(--danger)' : product.stock < 5 ? 'var(--secondary)' : 'var(--success)',
                                        fontWeight: 'bold'
                                    }}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {product.stock > 0 ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--success)', fontSize: '0.9rem' }}>
                                            <CheckCircle size={14} /> Disponible
                                        </span>
                                    ) : (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--danger)', fontSize: '0.9rem' }}>
                                            <XCircle size={14} /> Agotado
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredProducts.length === 0 && (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No se encontraron productos en el inventario.
                </div>
            )}
        </div>
    );
}
