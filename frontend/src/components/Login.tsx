import { useState } from 'react';

interface LoginProps {
    onLoginSuccess: (userData: any) => void;
    onCancel: () => void;
}

const Login = ({ onLoginSuccess, onCancel }: LoginProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                onLoginSuccess(data.user);
            } else {
                setError(data.message || 'Error de autenticación');
            }
        } catch (err) {
            setError('Error conectando con el servidor');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f2f5',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <h2 style={{ marginBottom: '20px', color: '#333' }}>Acceso Conductor</h2>

                {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="text"
                        placeholder="Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: isLoading ? '#ccc' : '#faad14',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? 'Verificando...' : 'Ingresar'}
                    </button>
                </form>

                <button
                    onClick={onCancel}
                    style={{ marginTop: '20px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    Volver al inicio
                </button>
            </div>
        </div>
    );
};

export default Login;
