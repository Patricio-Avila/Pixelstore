import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import Fuse from 'fuse.js';
import { ShoppingCart, Filter, ArrowUpDown, Search, Grid, List } from 'lucide-react';

export default function ProductList({ addToCart, cart, searchTerm = '' }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtros y Ordenamiento locales
    const [sortBy, setSortBy] = useState('name'); // 'name', 'priceAsc', 'priceDesc', 'stock'
    const [filterType, setFilterType] = useState('all'); // 'all', 'Consolas', 'Videojuegos', 'Accesorios'
    const [productTypes, setProductTypes] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        try {
            // Fetch Products
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    product_types ( name ),
                    product_images ( url, alt )
                `)
                .eq('status', 'available');

            if (error) throw error;
            setProducts(data || []);

            // Extract unique types for filter
            const types = [...new Set(data.map(p => p.product_types?.name).filter(Boolean))];
            setProductTypes(types);

        } catch (err) {
            console.error('Error:', err);
            setError('Error de conexión.');
        } finally {
            setLoading(false);
        }
    }

    // --- LOGICA DE BUSQUEDA Y FILTRADO ---
    const processedProducts = useMemo(() => {
        let result = products;

        // 1. Fuzzy Search (Fuse.js)
        if (searchTerm.trim()) {
            const fuse = new Fuse(result, {
                keys: ['name', 'sku', 'brand', 'product_types.name'],
                threshold: 0.3, // 0.0 = exact match, 1.0 = match anything
                distance: 100
            });
            result = fuse.search(searchTerm).map(r => r.item);
        }

        // 2. Filtro por Tipo
        if (filterType !== 'all') {
            result = result.filter(p => p.product_types?.name === filterType);
        }

        // 3. Ordenamiento
        result.sort((a, b) => {
            switch (sortBy) {
                case 'priceAsc': return a.price - b.price;
                case 'priceDesc': return b.price - a.price;
                case 'stock': return a.stock - b.stock; // Menor stock primero? O mayor? Usemos Mayor
                case 'name': default: return a.name.localeCompare(b.name);
            }
        });

        return result;
    }, [products, searchTerm, filterType, sortBy]);


    if (loading) return <div className="loading-state">Cargando catálogo...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <div style={{ padding: '0 1rem' }}>
            {/* --- CONTROLES DE FILTRO --- */}
            <div style={{
                marginBottom: '2rem',
                display: 'flex', flexWrap: 'wrap', gap: '1rem',
                alignItems: 'center', justifyContent: 'space-between',
                padding: '1.5rem', borderRadius: '24px',
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Filter size={20} color="var(--accent)" />
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '12px',
                            background: '#0f172a', color: 'white', border: '1px solid #334155'
                        }}
                    >
                        <option value="all">Todas las Categorías</option>
                        {productTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <ArrowUpDown size={20} color="var(--primary)" />
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        style={{
                            padding: '0.5rem 1rem', borderRadius: '12px',
                            background: '#0f172a', color: 'white', border: '1px solid #334155'
                        }}
                    >
                        <option value="name">Nombre (A-Z)</option>
                        <option value="priceAsc">Precio: Menor a Mayor</option>
                        <option value="priceDesc">Precio: Mayor a Menor</option>
                        <option value="stock">Stock Disponible</option>
                    </select>
                </div>
            </div>

            {/* --- GRID DE PRODUCTOS --- */}
            <div className="grid-books">
                {processedProducts.map(product => {
                    const inCartCount = cart.filter(item => item.id === product.id).length;
                    const realStock = product.stock - inCartCount;
                    const imageUrl = product.product_images?.[0]?.url || 'https://via.placeholder.com/300x400';

                    return (
                        <div key={product.id} className="card-product glass-panel">
                            {/* IMAGEN + BADGES */}
                            <div className="product-image-container">
                                <img
                                    src={imageUrl}
                                    alt={product.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/600x400?text=Sin+Imagen';
                                    }}
                                />
                                <div className="overlay" />

                                {/* PRICE TAG */}
                                <div className="price-tag">${product.price}</div>

                                {/* STOCK BADGE */}
                                {realStock < 5 && realStock > 0 && (
                                    <div className="badge-warning">¡Últimos {realStock}!</div>
                                )}
                                {realStock === 0 && (
                                    <div className="badge-critical">AGOTADO</div>
                                )}
                            </div>

                            {/* INFO */}
                            <div className="product-info">
                                <span className="brand">{product.brand}</span>
                                <h3>{product.name}</h3>

                                <div className="actions">
                                    <button
                                        className="btn-add"
                                        onClick={() => addToCart(product)}
                                        disabled={realStock === 0}
                                    >
                                        <ShoppingCart size={18} />
                                        {realStock === 0 ? 'Sin Stock' : 'Agregar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}


                {processedProducts.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        <Search size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>No encontramos nada...</h3>
                        <p>Intenta con otra búsqueda o filtro.</p>
                    </div>
                )}
            </div>

            <style>{`
                .card-product {
                    position: relative;
                    border-radius: var(--radius);
                    overflow: hidden;
                    transition: all 0.3s ease;
                    display: flex; flex-direction: column;
                }
                .card-product:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: var(--shadow-neon);
                    z-index: 10;
                }
                
                .product-image-container {
                    height: 220px;
                    position: relative;
                    overflow: hidden;
                }
                .product-image-container img {
                    width: 100%; height: 100%; object-fit: cover;
                    transition: transform 0.5s ease;
                }
                .card-product:hover .product-image-container img {
                    transform: scale(1.1);
                }

                .price-tag {
                    position: absolute; top: 12px; right: 12px;
                    background: rgba(0,0,0,0.8);
                    color: var(--accent);
                    font-weight: 800; font-size: 1.1rem;
                    padding: 4px 12px; border-radius: 99px;
                    border: 1px solid var(--accent);
                    box-shadow: 0 0 10px var(--accent-glow);
                }

                .badge-warning {
                    position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
                    background: var(--secondary); color: black;
                    font-weight: bold; font-size: 0.75rem;
                    padding: 2px 8px; border-radius: 4px;
                }
                .badge-critical {
                    position: absolute; inset: 0;
                    background: rgba(0,0,0,0.8);
                    display: flex; align-items: center; justify-content: center;
                    color: var(--danger); font-weight: 900; letter-spacing: 2px;
                }

                .product-info {
                    padding: 1.25rem;
                    flex: 1; display: flex; flex-direction: column; gap: 0.5rem;
                    background: linear-gradient(to bottom, rgba(30,41,59,0), rgba(15,23,42,1));
                }

                .brand {
                    font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em;
                    color: var(--text-muted);
                }
                .product-info h3 {
                    font-size: 1.1rem; line-height: 1.3;
                    margin: 0; flex: 1;
                }

                .btn-add {
                    width: 100%;
                    padding: 0.75rem;
                    border: none; border-radius: 12px;
                    background: var(--primary); color: white;
                    font-weight: 600; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    transition: all 0.2s;
                }
                .btn-add:hover:not(:disabled) {
                    background: white; color: var(--primary);
                    box-shadow: 0 0 15px white;
                }
                .btn-add:disabled {
                    background: #334155; color: #64748b; cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}
