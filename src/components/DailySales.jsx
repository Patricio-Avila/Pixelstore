import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, DollarSign, Clock, Receipt, RefreshCw } from 'lucide-react';

export default function DailySales() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, count: 0 });

    useEffect(() => {
        fetchSales();
    }, []);

    async function fetchSales() {
        setLoading(true);
        try {
            // Get today's date range in local time (simplified approximation for now)
            // For a robust solution, we might want to handle TZs better, but this works for single-region
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

            const { data, error } = await supabase
                .from('v_sales_history')
                .select('*')
                .gte('sale_date', startOfDay)
                .lt('sale_date', endOfDay)
                .order('sale_date', { ascending: false });

            if (error) throw error;

            setSales(data || []);

            // Calculate totals locally
            const totalAmount = (data || []).reduce((sum, sale) => sum + parseFloat(sale.total), 0);
            setStats({
                total: totalAmount,
                count: (data || []).length
            });

        } catch (err) {
            console.error('Error fetching sales:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading && sales.length === 0) return <div className="loading-state">Cargando ventas...</div>;

    return (
        <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar color="var(--accent)" />
                    Ventas de Hoy
                </h2>
                <button className="btn" onClick={fetchSales} style={{ padding: '0.5rem', borderRadius: '50%' }}>
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ color: '#6ee7b7', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Total Vendido</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#34d399' }}>
                        ${stats.total.toFixed(2)}
                    </div>
                </div>
                <div className="card" style={{ background: 'rgba(56, 189, 248, 0.1)', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                    <div style={{ color: '#7dd3fc', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Transacciones</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#38bdf8' }}>
                        {stats.count}
                    </div>
                </div>
            </div>

            {/* Sales List */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', borderRadius: '12px 0 0 12px' }}>Hora</th>
                            <th style={{ padding: '1rem' }}>Ticket</th>
                            <th style={{ padding: '1rem' }}>Método</th>
                            <th style={{ padding: '1rem' }}>Items</th>
                            <th style={{ padding: '1rem', borderRadius: '0 12px 12px 0', textAlign: 'right' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales.map(sale => {
                            const time = new Date(sale.sale_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            return (
                                <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={14} /> {time}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                        {sale.external_number}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', textTransform: 'uppercase',
                                            background: 'rgba(255,255,255,0.1)'
                                        }}>
                                            {sale.payment_method}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{sale.items_count}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>
                                        ${sale.total.toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {sales.length === 0 && (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No se han registrado ventas hoy.
                </div>
            )}
        </div>
    );
}
