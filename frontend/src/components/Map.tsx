import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { API_URL } from '../config';

interface MapProps {
    onViewPassengers: () => void;
    onBack: () => void;
}

const Map = ({ onViewPassengers, onBack }: MapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const marker = useRef<maplibregl.Marker | null>(null);
    const [_busLocation, setBusLocation] = useState<{ lat: number; lng: number, speed?: number } | null>(null);
    const [address, setAddress] = useState<string>('Buscando ubicación...');
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [mapStyle, setMapStyle] = useState('https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json');
    const [isAutoCentering, setIsAutoCentering] = useState(true);

    // Initialize Map
    useEffect(() => {
        if (map.current) return;
        if (!mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: mapStyle,
            center: [-72.5904, -38.7362], // Temuco
            zoom: 13,
            attributionControl: false
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Desactivar centrado si el usuario mueve el mapa manualmente
        map.current.on('dragstart', () => {
            setIsAutoCentering(false);
        });
    }, []);

    // Update Map Style
    useEffect(() => {
        if (map.current) {
            map.current.setStyle(mapStyle);
        }
    }, [mapStyle]);

    // Fetch Location
    const fetchLocation = async () => {
        try {
            const response = await fetch(`${API_URL}/location/NB-2026`);
            const data = await response.json();

            // Si el conductor tiene oculta la ubicación
            if (data.status === 'hidden') {
                setAddress('Ubicación oculta por el conductor');
                return;
            }

            if (data.lat && data.lng) {
                const newLocation = { lat: parseFloat(data.lat), lng: parseFloat(data.lng), speed: data.speed };
                setBusLocation(newLocation);
                setLastUpdate(new Date());

                // Reverse Geocoding (Nominatim) - CALLE + NÚMERO
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLocation.lat}&lon=${newLocation.lng}`)
                    .then(res => res.json())
                    .then(geo => {
                        const addr = geo.address;
                        const street = addr.road || addr.pedestrian || addr.suburb || 'Calle desconocida';
                        const number = addr.house_number ? `, ${addr.house_number}` : '';
                        setAddress(`${street}${number}`);
                    })
                    .catch(() => setAddress('Dirección no disponible'));

                // Update Marker
                if (map.current) {
                    if (!marker.current) {
                        const el = document.createElement('div');
                        el.className = 'bus-marker';
                        el.style.width = '40px';
                        el.style.height = '40px';
                        el.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/512/3063/3063823.png)'; // Bus Icon
                        el.style.backgroundSize = 'cover';

                        marker.current = new maplibregl.Marker({ element: el })
                            .setLngLat([newLocation.lng, newLocation.lat])
                            .addTo(map.current);
                    } else {
                        marker.current.setLngLat([newLocation.lng, newLocation.lat]);
                    }

                    if (isAutoCentering) {
                        map.current.easeTo({
                            center: [newLocation.lng, newLocation.lat],
                            duration: 2000,
                            easing: (t) => t // Linear
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching location:', error);
        }
    };

    // Polling
    useEffect(() => {
        fetchLocation(); // Initial fetch
        const interval = setInterval(fetchLocation, 2000);
        return () => clearInterval(interval);
    }, [isAutoCentering]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-between p-6 text-slate-900 relative">
            <header className="w-full max-w-sm text-center mb-2 z-10 pt-4">
                <h1 className="text-xs font-extrabold uppercase tracking-[0.2em] opacity-60">
                    Transporte Tía Paty
                </h1>
            </header>

            <main className="w-full max-w-sm flex-1 flex flex-col gap-6 z-10">
                {/* Map Container */}
                <div className="w-full aspect-square rounded-4xl shadow-2xl overflow-hidden relative border-4 border-black/5 group bg-slate-100">
                    <div ref={mapContainer} className="w-full h-full" />

                    {/* Centering Indicator */}
                    <button
                        onClick={() => {
                            setIsAutoCentering(true);
                            fetchLocation(); // Forzar centrado inmediato
                        }}
                        className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${isAutoCentering ? 'bg-yellow-400 text-black border-2 border-black' : 'bg-white text-slate-400 border border-slate-200'}`}
                    >
                        <span className="material-symbols-outlined text-lg">
                            {isAutoCentering ? 'gps_fixed' : 'gps_not_fixed'}
                        </span>
                    </button>

                    {/* Overlay Status */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                        <div className="bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1 border border-white/10 shadow-lg">
                            <span className="block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            EN RUTA
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setAddress('Actualizando...');
                            fetchLocation();
                        }}
                        className="h-14 w-14 flex-shrink-0 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all border border-slate-100 text-slate-900"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                    </button>
                    <div className="flex-1 h-14 bg-white/30 backdrop-blur-md rounded-full p-1.5 flex justify-between items-center shadow-sm border border-white/20 relative">
                        {/* Animated Background Pill */}
                        <div
                            className={`absolute top-1.5 bottom-1.5 w-[31%] bg-white rounded-full shadow-sm transition-all duration-300 ease-out ${mapStyle.includes('positron') ? 'left-1.5' :
                                mapStyle.includes('dark-matter') ? 'left-1/2 -translate-x-1/2' :
                                    'right-1.5'
                                }`}
                        />

                        <button
                            onClick={() => setMapStyle('https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json')}
                            className={`flex-1 h-full rounded-full text-xs font-bold transition-all relative z-10 ${mapStyle.includes('positron') ? 'text-slate-900' : 'text-slate-900/60 hover:text-slate-900'
                                }`}
                        >
                            Claro
                        </button>
                        <button
                            onClick={() => setMapStyle('https://tiles.basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json')}
                            className={`flex-1 h-full rounded-full text-xs font-bold transition-all relative z-10 ${mapStyle.includes('dark-matter') ? 'text-slate-900' : 'text-slate-900/60 hover:text-slate-900'
                                }`}
                        >
                            Oscuro
                        </button>
                        <button
                            onClick={() => setMapStyle('https://tiles.basemaps.cartocdn.com/gl/voyager-gl-style/style.json')}
                            className={`flex-1 h-full rounded-full text-xs font-bold transition-all relative z-10 ${mapStyle.includes('voyager') ? 'text-slate-900' : 'text-slate-900/60 hover:text-slate-900'
                                }`}
                        >
                            Azul
                        </button>
                    </div>
                </div>

                {/* Info Card */}
                <div className="w-full bg-black text-white rounded-4xl p-7 shadow-2xl relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute -bottom-4 -right-4 opacity-10 transform rotate-12 pointer-events-none">
                        <span className="material-symbols-outlined text-[140px]">airport_shuttle</span>
                    </div>
                    <div className="relative z-10 space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight text-white">Furgón NB-2026</h2>
                            <div className="bg-yellow-500 text-black rounded-lg p-1.5 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                                <span className="material-symbols-outlined">directions_bus</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                                <span className="material-symbols-outlined text-sm text-gray-400">location_on</span>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-300 truncate max-w-[200px]">{address}</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-green-400">
                                    {lastUpdate ? `Actualizado: ${lastUpdate.toLocaleTimeString()}` : 'Conectando...'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* View Passengers Button (New) */}
                <button
                    onClick={onViewPassengers}
                    className="w-full bg-yellow-400 border-2 border-yellow-500 py-4 rounded-2xl text-black font-black tracking-[0.05em] text-sm hover:bg-yellow-300 active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">groups</span>
                    VER PASAJEROS A BORDO
                </button>
            </main>

            <footer className="w-full max-w-sm pb-4 pt-2 z-10">
                <button
                    onClick={onBack}
                    className="w-full bg-white border-2 border-black py-4 rounded-2xl text-black font-black tracking-[0.2em] text-sm hover:bg-gray-50 active:scale-[0.98] transition-all shadow-xl"
                >
                    SALIR
                </button>
            </footer>
        </div>
    );
};

export default Map;
