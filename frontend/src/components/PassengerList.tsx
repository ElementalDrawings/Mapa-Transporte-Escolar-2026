import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../config';

interface ComponentProps {
    onBack: () => void;
}

const PassengerList = ({ onBack }: ComponentProps) => {
    const [activePassengers, setActivePassengers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const busId = 'NB-2026';

    const fetchActivePassengers = async () => {
        try {
            const res = await fetch(`${API_URL}/active-passengers/${busId}`);
            if (res.ok) {
                const data = await res.json();
                setActivePassengers(data);
            }
        } catch (err) {
            console.error('Error fetching active passengers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivePassengers();

        // Connect to Socket.io for real-time updates
        const socket = io(API_URL);
        socket.on('sync_passengers', () => {
            console.log('🔄 Sincronizando pasajeros por evento real-time');
            fetchActivePassengers();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-between p-6 text-slate-900 relative">
            <header className="w-full max-w-sm text-center mb-4 z-10 pt-8 relative">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
                    Pasajeros a bordo
                </h1>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
                    2026
                </p>
                <button
                    onClick={fetchActivePassengers}
                    className="absolute top-8 right-0 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <span className="material-symbols-outlined">refresh</span>
                </button>
            </header>

            <main className="w-full max-w-sm flex-1 z-10 space-y-4 overflow-y-auto pb-4 custom-scrollbar">
                {loading ? (
                    <div className="text-center py-10 opacity-50">Cargando lista...</div>
                ) : activePassengers.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <span className="material-symbols-outlined text-4xl mb-2">no_accounts</span>
                        <p>No hay pasajeros marcados en ruta.</p>
                    </div>
                ) : (
                    activePassengers.map((name, idx) => (
                        <div
                            key={idx}
                            className="w-full h-16 rounded-full bg-white shadow-xl shadow-black/5 flex items-center px-6 space-x-4"
                            style={{ animationDelay: `${idx * 0.1}s`, animationDuration: '3s' }}
                        >
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-bold">
                                {name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900 text-lg truncate">{name}</span>
                        </div>
                    ))
                )}
            </main>

            <footer className="w-full max-w-sm pb-4 pt-6 z-10">
                <button
                    onClick={onBack}
                    className="w-full bg-white/20 backdrop-blur-md border border-black/10 py-4 rounded-2xl text-slate-900 font-bold tracking-widest text-sm hover:bg-white/40 active:scale-[0.98] transition-all"
                >
                    VOLVER AL MAPA
                </button>
            </footer>
        </div>
    );
};

export default PassengerList;
