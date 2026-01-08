import { useState } from 'react';
import { Lock, User, ShieldAlert } from 'lucide-react';

interface LoginProps {
    onLoginSuccess: () => void;
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
                onLoginSuccess();
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
        <div className="selection-screen fade-in">
            <div className="bg-dots"></div>

            <div className="login-card glass-card fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div className="icon-wrapper" style={{ margin: '0 auto 20px auto' }}>
                        <Lock size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Acceso Conductor</h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Ingresa tus credenciales para continuar</p>
                </div>

                {error && (
                    <div className="status-badge" style={{ background: 'rgba(255, 77, 79, 0.1)', color: 'var(--danger)', borderColor: 'rgba(255, 77, 79, 0.3)', marginBottom: '20px', width: '100%', justifyContent: 'center' }}>
                        <ShieldAlert size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group">
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Nombre de usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 14px 14px 45px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                placeholder="Contraseña habitual"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 14px 14px 45px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    background: 'rgba(0,0,0,0.2)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-select primary"
                        style={{ marginTop: '10px' }}
                    >
                        {isLoading ? 'Verificando...' : 'Entrar al Sistema'}
                    </button>
                </form>

                <button
                    onClick={onCancel}
                    style={{ marginTop: '25px', width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
                >
                    Volver al inicio
                </button>
            </div>
        </div>
    );
};

export default Login;
