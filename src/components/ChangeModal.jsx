import { useState, useEffect } from 'react';

export default function ChangeModal({ total, onClose, onConfirm }) {
    const [payment, setPayment] = useState('');
    const [change, setChange] = useState(null);

    useEffect(() => {
        if (!payment) {
            setChange(null);
            return;
        }
        const payAmount = parseFloat(payment);
        const diff = payAmount - total;
        setChange(diff);
    }, [payment, total]);

    const isSufficient = change !== null && change >= 0;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '24px',
                width: '90%',
                maxWidth: '500px',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
            }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#64748b' }}>Total a Cobrar</h2>
                <div style={{ fontSize: '3.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '2rem' }}>
                    ${total}
                </div>

                <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Dinero Recibido ($)
                    </label>
                    <input
                        type="number"
                        autoFocus
                        value={payment}
                        onChange={(e) => setPayment(e.target.value)}
                        style={{
                            width: '100%',
                            fontSize: '2rem',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '3px solid #cbd5e1',
                            textAlign: 'center'
                        }}
                        placeholder="0"
                    />
                </div>

                {/* CÁLCULO VISUAL */}
                <div style={{
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    backgroundColor: isSufficient ? '#dcfce7' : (payment ? '#fee2e2' : '#f1f5f9')
                }}>
                    <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                        {isSufficient ? 'CAMBIO A ENTREGAR:' : (payment ? 'FALTA DINERO' : 'Ingrese monto...')}
                    </p>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: isSufficient ? '#16a34a' : (payment ? '#dc2626' : '#94a3b8')
                    }}>
                        {isSufficient ? `$${change}` : (payment ? `Faltan $${Math.abs(change)}` : '---')}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button
                        className="btn"
                        style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '1.2rem' }}
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        className="btn btn-primary"
                        style={{ fontSize: '1.2rem', opacity: isSufficient ? 1 : 0.5 }}
                        disabled={!isSufficient}
                        onClick={() => onConfirm(parseFloat(payment), change)}
                    >
                        CONFIRMAR VENTA
                    </button>
                </div>
            </div>
        </div>
    );
}
