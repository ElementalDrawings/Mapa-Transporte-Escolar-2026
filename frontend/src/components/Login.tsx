import { useState } from 'react';
import { API_URL } from '../config';

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
            const response = await fetch(`${API_URL}/login`, {
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
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
                setError('Error de Red: No se puede alcanzar el servidor.');
            } else {
                setError(`Error de conexión: ${err.message || 'Desconocido'}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-slate-900 relative">
            <main className="w-full max-w-sm flex flex-col items-center z-10">
                <div className="mb-8 animate-pop [animation-delay:0ms]">
                    <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center shadow-xl shadow-black/10">
                        <span className="material-symbols-outlined text-4xl text-[#FFB800]">lock</span>
                    </div>
                </div>

                <div className="text-center mb-10 animate-pop [animation-delay:100ms]">
                    <h1 className="text-3xl font-extrabold tracking-tight text-black mb-2">
                        Acceso Conductor
                    </h1>
                    <p className="text-sm font-medium text-black/60">
                        Ingresa tus credenciales
                    </p>
                    <p className="text-xs font-bold text-black/40 mt-1">v2.0 - LIVE</p>
                </div>

                {error && (
                    <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-6 text-sm font-bold text-center animate-wiggle">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="w-full space-y-4 mb-8 animate-slide-up [animation-delay:200ms]">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-500">person</span>
                        </div>
                        <input
                            className="w-full pl-12 pr-4 py-4 bg-white/40 border border-slate-800/20 rounded-2xl text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 focus:scale-[1.02]"
                            placeholder="Nombre de usuario"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-500">lock</span>
                        </div>
                        <input
                            className="w-full pl-12 pr-4 py-4 bg-white/40 border border-slate-800/20 rounded-2xl text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 focus:scale-[1.02]"
                            placeholder="Contraseña habitual"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 px-6 rounded-full bg-black text-white font-bold text-base shadow-xl shadow-black/20 disabled:opacity-70 btn-game"
                    >
                        {isLoading ? 'Verificando...' : 'Entrar al Sistema'}
                    </button>
                </form>

                <button
                    onClick={onCancel}
                    className="block text-center text-sm font-semibold text-black hover:text-black/70 transition-colors animate-slide-up [animation-delay:300ms]"
                >
                    Volver al inicio
                </button>
            </main>

            <footer className="absolute bottom-8 w-full text-center z-10 pointer-events-none opacity-40">
                <p className="text-[10px] font-bold tracking-widest text-black">
                    © 2026 SCHOOL TRANSPORT
                </p>
            </footer>
        </div>
    );
};

export default Login;
