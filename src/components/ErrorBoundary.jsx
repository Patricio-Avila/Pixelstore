import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', background: '#1a1a1a', color: '#ff5555', height: '100vh', fontFamily: 'monospace' }}>
                    <h1>🛑 Algo salió mal</h1>
                    <h3 style={{ color: 'white' }}>{this.state.error && this.state.error.toString()}</h3>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#aaa' }}>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #444', borderRadius: '8px', background: '#222' }}>
                        <p style={{ color: 'white' }}>Posibles soluciones:</p>
                        <ul style={{ color: '#ccc', marginLeft: '1.5rem' }}>
                            <li>Reinicia el servidor (Ctrl+C y npm run dev)</li>
                            <li>Verifica tu archivo .env.local</li>
                            <li>Revisa la consola del navegador (F12)</li>
                        </ul>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
