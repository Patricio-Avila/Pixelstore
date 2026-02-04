export default function InventoryList({ books, onUpdateStock }) {
    return (
        <div className="container">
            <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>📦 Gestión de Inventario</h2>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#f1f5f9' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Portada</th>
                            <th style={{ padding: '1rem' }}>Título</th>
                            <th style={{ padding: '1rem' }}>Precio</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Stock</th>
                            <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map(book => (
                            <tr key={book.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '0.5rem' }}>
                                    <img src={book.image_url} alt="" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                </td>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>{book.title}</td>
                                <td style={{ padding: '1rem' }}>${book.price}</td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: book.stock < 3 ? 'var(--danger)' : 'inherit',
                                        fontSize: '1.2rem'
                                    }}>
                                        {book.stock}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                        <button
                                            className="btn"
                                            style={{ background: '#fee2e2', color: '#dc2626', padding: '0.5rem 1rem' }}
                                            onClick={() => onUpdateStock(book.id, book.stock - 1)}
                                            disabled={book.stock <= 0}
                                        >
                                            -1
                                        </button>
                                        <button
                                            className="btn"
                                            style={{ background: '#dcfce7', color: '#16a34a', padding: '0.5rem 1rem' }}
                                            onClick={() => onUpdateStock(book.id, book.stock + 1)}
                                        >
                                            +1
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
