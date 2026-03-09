import { useState, useEffect } from 'react';
import { API_URL } from '../config';

interface DashboardProps {
    onNavigateToPassengers: () => void;
    onBack: () => void;
    isTracking: boolean;
    setIsTracking: (val: boolean) => void;
    status: string;
    coords: { lat: number, lng: number, speed: number } | null;
    locationQueue: any[];
}

const DriverDashboard = ({
    onNavigateToPassengers,
    onBack,
    isTracking,
    setIsTracking,
    status,
    coords,
    locationQueue
}: DashboardProps) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isVisible, setIsVisible] = useState(true);
    const [isEnergySave, setIsEnergySave] = useState(false);
    const [debugInfo, setDebugInfo] = useState(false);

    // Connectivity Listeners
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Toggle de Visibilidad en DB
    const toggleVisibility = async () => {
        const nextValue = !isVisible;
        setIsVisible(nextValue);
        try {
            await fetch(`${API_URL}/bus-config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ busId: 'NB-2026', is_visible: nextValue })
            });
        } catch (err) {
            console.error('Sync visibility fail:', err);
        }
    };

    if (isEnergySave) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center cursor-pointer" onClick={() => setIsEnergySave(false)}>
                <div className="animate-pulse flex flex-col items-center">
                    <span className="material-symbols-outlined text-6xl mb-4 text-yellow-500">visibility_off</span>
                    <h2 className="text-xl font-bold opacity-30">MODO AHORRO ACTIVO</h2>
                    <p className="text-xs opacity-20 mt-2">La ruta sigue transmitiendo en segundo plano</p>
                    <p className="text-xs font-bold text-yellow-500/50 mt-10">Toca para salir</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-between p-6 text-slate-900 relative">
            <header className="w-full max-w-sm flex items-center justify-between z-20 pt-2">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shadow-sm ${isVisible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    onClick={toggleVisibility}
                >
                    <span className="material-symbols-outlined text-[14px]">{isVisible ? 'visibility' : 'visibility_off'}</span>
                    <span>{isVisible ? 'PÚBLICO' : 'OCULTO'}</span>
                </div>
            </header>

            <main className="w-full max-w-sm flex flex-1 flex-col items-center justify-center space-y-6 z-10 py-4">
                <header className="text-center w-full animate-pop [animation-delay:0ms]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50 mb-1">
                        Transporte Tía Paty
                    </p>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                        PANEL DE<br />CONTROL
                    </h1>

                    <button onClick={() => setDebugInfo(!debugInfo)} className="mt-4 text-[8px] opacity-20 uppercase tracking-widest font-bold">
                        {debugInfo ? 'Ocultar Debug' : 'Mostrar Debug'}
                    </button>

                    {debugInfo && (
                        <div className="mt-2 p-2 bg-black text-white text-[8px] font-mono rounded-lg text-left overflow-auto max-h-24 w-full">
                            <p>API: {API_URL}</p>
                            <p>Lat: {coords?.lat}</p>
                            <p>Lng: {coords?.lng}</p>
                            <p>Queue: {locationQueue.length}</p>
                        </div>
                    )}
                </header>

                {/* Status Card */}
                <div className="w-full bg-white rounded-5xl p-8 shadow-xl shadow-orange-900/10 flex flex-col items-center justify-center relative overflow-hidden group animate-pop [animation-delay:100ms] transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110 opacity-50"></div>
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 relative z-10">
                        Estado de Ruta
                    </h2>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 border-4 shadow-inner transition-colors duration-500 ${isTracking ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                            <span className={`material-symbols-outlined text-3xl ${isTracking ? 'text-green-500 animate-pulse' : 'text-slate-300'}`}>
                                {isTracking ? 'satellite_alt' : 'hourglass_empty'}
                            </span>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-slate-900 mb-1">{status}</h3>
                            <p className="text-xs font-medium text-slate-400">
                                {isTracking ? `Velocidad: ${coords ? Math.round(coords.speed * 3.6) : 0} km/h` : 'Motor apagado'}
                            </p>

                            {!isOnline && (
                                <p className="text-[10px] font-bold text-red-500 mt-3 bg-red-50 px-3 py-1 rounded-full animate-pulse border border-red-100 inline-block uppercase tracking-widest">
                                    Sin Internet
                                </p>
                            )}
                            {isOnline && isTracking && (
                                <p className="text-[10px] font-bold text-green-600 mt-3 opacity-40 uppercase tracking-widest">
                                    Señal Estable
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full space-y-4">
                    <button
                        onClick={() => setIsTracking(!isTracking)}
                        className="w-full group relative"
                    >
                        <div className={`absolute inset-0 rounded-full translate-y-1.5 blur-sm opacity-20 transition-colors ${isTracking ? 'bg-red-800' : 'bg-slate-800'}`}></div>
                        <div className={`relative w-full py-5 px-8 rounded-full text-white font-bold text-lg tracking-wide active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-3 shadow-xl ${isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-black'}`}>
                            <span>{isTracking ? 'DETENER RUTA' : 'INICIAR RUTA'}</span>
                            <span className="material-symbols-outlined">
                                {isTracking ? 'stop_circle' : 'play_circle'}
                            </span>
                        </div>
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onNavigateToPassengers}
                            className="bg-white border-2 border-slate-900 p-4 rounded-3xl flex flex-col items-center justify-center space-y-2 hover:bg-slate-50 transition-colors active:scale-95"
                        >
                            <span className="material-symbols-outlined text-slate-900">person_add</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Pasajeros</span>
                        </button>

                        <button
                            onClick={() => setIsEnergySave(true)}
                            className="bg-slate-100 p-4 rounded-3xl flex flex-col items-center justify-center space-y-2 hover:bg-slate-200 transition-colors active:scale-95"
                        >
                            <span className="material-symbols-outlined text-slate-600">battery_saver</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Ahorro</span>
                        </button>
                    </div>
                </div>
            </main>

            <footer className="w-full max-w-sm py-4 text-center opacity-30">
                <p className="text-[9px] font-black tracking-[0.4em] text-black">
                    CONTROL PANEL V2
                </p>
            </footer>
        </div>
    );
};

export default DriverDashboard;

