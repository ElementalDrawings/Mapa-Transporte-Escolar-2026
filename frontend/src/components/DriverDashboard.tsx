import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';

interface DashboardProps {
    onNavigateToPassengers: () => void;
}

const DriverDashboard = ({ onNavigateToPassengers }: DashboardProps) => {
    const [isTracking, setIsTracking] = useState(false);
    const [status, setStatus] = useState('En espera');
    const [coords, setCoords] = useState<{ lat: number, lng: number, speed: number } | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isVisible, setIsVisible] = useState(true);
    const [isEnergySave, setIsEnergySave] = useState(false);

    // Cola de ubicaciones (RÁFAGA)
    const [locationQueue, setLocationQueue] = useState<any[]>(() => {
        const saved = localStorage.getItem('location_queue');
        return saved ? JSON.parse(saved) : [];
    });

    const wakeLock = useRef<any>(null);

    // Guardar cola en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('location_queue', JSON.stringify(locationQueue));
    }, [locationQueue]);

    // Connectivity Listeners
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            uploadQueue(); // Intentar subir apenas vuelva el internet
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [locationQueue]);

    // Función principal para subir la ráfaga
    const uploadQueue = async () => {
        if (locationQueue.length === 0 || !navigator.onLine) return;

        try {
            const response = await fetch(`${API_URL}/location`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(locationQueue)
            });

            if (response.ok) {
                console.log('Ráfaga subida con éxito');
                setLocationQueue([]); // Limpiar cola si se subió
            }
        } catch (error) {
            console.error('Error subiendo ráfaga:', error);
        }
    };

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

    const requestWakeLock = async () => {
        try {
            if ('wakeLock' in navigator) {
                wakeLock.current = await (navigator as any).wakeLock.request('screen');
            }
        } catch (err) {
            console.warn('WakeLock err:', err);
        }
    };

    const releaseWakeLock = async () => {
        if (wakeLock.current) {
            await wakeLock.current.release();
            wakeLock.current = null;
        }
    };

    useEffect(() => {
        let watchId: number | null = null;
        if (isTracking) {
            setStatus('Buscando señal...');
            requestWakeLock();
            if (!navigator.geolocation) {
                setStatus('Error GPS');
                return;
            }
            watchId = navigator.geolocation.watchPosition(
                async (position) => {
                    const { latitude, longitude, speed } = position.coords;
                    const newCoords = { lat: latitude, lng: longitude, speed: speed || 0 };
                    setCoords(newCoords);
                    setStatus('En Ruta');

                    // Añadir a la cola con BusID y Timestamp
                    const locEntry = {
                        busId: 'NB-2026',
                        ...newCoords,
                        timestamp: new Date().toISOString()
                    };

                    setLocationQueue(prev => [...prev.slice(-100), locEntry]); // Mantener máx 100 puntos (aprox 3 min)

                    // Intentar subir inmediatamente
                    uploadQueue();
                },
                (error) => setStatus(`Error: ${error.message}`),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
            return () => {
                if (watchId !== null) navigator.geolocation.clearWatch(watchId);
                releaseWakeLock();
            };
        } else {
            setStatus('En espera');
            releaseWakeLock();
        }
    }, [isTracking]);

    // UI de Modo Ahorro (Pantalla Negra)
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
            <div className="flex-none h-4"></div>

            <main className="w-full max-w-sm flex flex-col items-center space-y-6 z-10 my-auto">
                <header className="text-center w-full animate-pop [animation-delay:0ms]">
                    <div className="flex justify-between items-center mb-2 px-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-50">
                            Transporte Tía Paty
                        </p>
                        <button
                            onClick={toggleVisibility}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[9px] font-bold transition-all ${isVisible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                            <span className="material-symbols-outlined text-[12px]">{isVisible ? 'visibility' : 'visibility_off'}</span>
                            <span>{isVisible ? 'PÚBLICO' : 'OCULTO'}</span>
                        </button>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                        PANEL DE<br />CONTROL
                    </h1>
                </header>

                {/* Status Card */}
                <div className="w-full bg-white rounded-5xl p-8 shadow-xl shadow-orange-900/10 flex flex-col items-center justify-center relative overflow-hidden group animate-pop [animation-delay:100ms] transition-all duration-300 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 relative z-10">
                        Estado de Ruta
                    </h2>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 border-4 shadow-inner transition-colors duration-500 ${isTracking ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                            <span className={`material-symbols-outlined text-4xl ${isTracking ? 'text-green-500 animate-pulse' : 'text-slate-300'}`}>
                                {isTracking ? 'satellite_alt' : 'hourglass_empty'}
                            </span>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-slate-900 mb-1">{status}</h3>
                            <p className="text-xs font-medium text-slate-400">
                                {isTracking ? `Velocidad: ${coords ? Math.round(coords.speed * 3.6) : 0} km/h` : 'Sin pasajeros a bordo'}
                            </p>

                            {/* Connectivity Status (Subtle) */}
                            {!isOnline && (
                                <p className="text-[10px] font-bold text-red-500 mt-2 bg-red-50 px-2 py-1 rounded-full animate-pulse border border-red-100 inline-block">
                                    SIN INTERNET ⚠️
                                </p>
                            )}
                            {isOnline && status === 'En Ruta' && (
                                <p className="text-[10px] font-bold text-green-600 mt-2 opacity-50">
                                    {locationQueue.length > 0 ? `Subiendo ráfaga (${locationQueue.length})...` : 'SEÑAL ESTABLE'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="w-full space-y-4">
                    <button
                        onClick={() => setIsTracking(!isTracking)}
                        className="w-full group relative btn-game"
                    >
                        <div className={`absolute inset-0 rounded-full translate-y-2 blur-sm opacity-20 transition-colors ${isTracking ? 'bg-red-800' : 'bg-slate-800'}`}></div>
                        <div className={`relative w-full py-5 px-8 rounded-full text-white font-bold text-lg tracking-wide active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-3 shadow-2xl shadow-slate-900/20 ${isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-black'}`}>
                            <span>{isTracking ? 'DETENER RUTA' : 'INICIAR RUTA'}</span>
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                                {isTracking ? 'stop_circle' : 'arrow_forward'}
                            </span>
                        </div>
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onNavigateToPassengers}
                            className="group relative btn-game"
                        >
                            <div className="relative w-full py-4 px-4 rounded-3xl bg-white border-2 border-slate-900 text-slate-900 font-bold text-xs tracking-tight hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm">
                                <span className="material-symbols-outlined">person_add</span>
                                <span>PASAJEROS</span>
                            </div>
                        </button>

                        <button
                            onClick={() => setIsEnergySave(true)}
                            className="group relative btn-game"
                        >
                            <div className="relative w-full py-4 px-4 rounded-3xl bg-slate-100 border-2 border-slate-200 text-slate-600 font-bold text-xs tracking-tight hover:bg-slate-200 active:scale-[0.98] transition-all duration-200 flex flex-col items-center justify-center space-y-2 shadow-sm">
                                <span className="material-symbols-outlined">battery_saver</span>
                                <span>MODO AHORRO</span>
                            </div>
                        </button>
                    </div>
                </div>
            </main>

            <footer className="mt-4 text-center z-10 pointer-events-none opacity-40">
                <p className="text-[10px] font-bold tracking-widest text-black">
                    © 2026 SCHOOL TRANSPORT
                </p>
            </footer>
        </div>
    );
};

export default DriverDashboard;
