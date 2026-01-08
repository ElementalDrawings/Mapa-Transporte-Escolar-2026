import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Signal, SignalLow, Map as MapIcon, Palette, RotateCw } from 'lucide-react';

type MapFilter = 'normal' | 'dark' | 'blue';

const Map = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const busMarker = useRef<maplibregl.Marker | null>(null);
    const hasCentered = useRef(false);
    const [status, setStatus] = useState<'online' | 'offline' | 'waiting'>('waiting');
    const [address, setAddress] = useState<string>('Buscando dirección...');

    // Filtro de mapa con persistencia
    const [filter, setFilter] = useState<MapFilter>(() => {
        return (localStorage.getItem('map-filter') as MapFilter) || 'normal';
    });

    useEffect(() => {
        if (map.current) return;
        if (!mapContainer.current) return;

        // Recuperar última vista guardada o usar defecto
        const savedCenter = localStorage.getItem('map-center');
        const savedZoom = localStorage.getItem('map-zoom');

        const initialCenter: [number, number] = savedCenter ? JSON.parse(savedCenter) : [-72.7502, -38.7639];
        const initialZoom: number = savedZoom ? parseFloat(savedZoom) : 15;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    'osm-tiles': {
                        type: 'raster',
                        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap'
                    }
                },
                layers: [{ id: 'osm-tiles', type: 'raster', source: 'osm-tiles' }]
            },
            center: initialCenter,
            zoom: initialZoom
        });

        // Guardar posición al moverse
        map.current.on('moveend', () => {
            if (map.current) {
                const center = map.current.getCenter();
                localStorage.setItem('map-center', JSON.stringify([center.lng, center.lat]));
                localStorage.setItem('map-zoom', map.current.getZoom().toString());
            }
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    }, []);

    // Función para obtener nombre de la calle (Reverse Geocoding)
    const getStreetName = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                headers: {
                    'User-Agent': 'TransporteEscolarApp/1.0'
                }
            });
            const data = await response.json();
            if (data.address) {
                // Priorizar nombre de calle -> ruta -> barrio
                const street = data.address.road || data.address.pedestrian || data.address.suburb || 'Ubicación en mapa';
                const city = data.address.city || data.address.town || data.address.village || '';

                // Formatear dirección
                let formattedAddress = street;
                if (city) formattedAddress += `, ${city}`;

                setAddress(formattedAddress);
            }
        } catch (error) {
            console.warn('Error obteniendo dirección:', error);
            // No cambiamos el estado para dejar el último conocido o el mensaje por defecto
        }
    };

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const response = await fetch('/location/NB-2026');
                const data = await response.json();

                if (data.lat && data.lng) {
                    setStatus('online');
                    if (!map.current) return;

                    // Actualizar dirección 
                    // Nota: En producción real deberíamos usar debounce para no saturar la API
                    // Aquí confiamos en el intervalo de 3s
                    getStreetName(data.lat, data.lng);

                    if (!busMarker.current) {
                        const el = document.createElement('div');
                        el.className = 'bus-marker-premium';
                        el.innerHTML = `
                            <div class="bus-icon-container">
                                <div class="bus-pulse"></div>
                                <div class="bus-body">🚐</div>
                            </div>
                        `;

                        busMarker.current = new maplibregl.Marker({ element: el })
                            .setLngLat([data.lng, data.lat])
                            .addTo(map.current);
                    } else {
                        busMarker.current.setLngLat([data.lng, data.lat]);
                    }

                    // Auto-centrado inicial (solo si NO hay una posición guardada explícita reciente, o podemos omitirlo si preferimos persistencia total)
                    // En este caso, priorizamos la persistencia del usuario si ya movió el mapa.
                    // Pero si es la primera carga absoluta, centramos.
                    if (!hasCentered.current && !localStorage.getItem('map-center')) {
                        map.current.flyTo({
                            center: [data.lng, data.lat],
                            zoom: 16,
                            speed: 1.2
                        });
                        hasCentered.current = true;
                    }
                } else {
                    setStatus('waiting');
                    setAddress('Esperando señal...');
                }
            } catch (error) {
                setStatus('offline');
            }
        };

        const intervalId = setInterval(fetchLocation, 3000);
        fetchLocation(); // Initial call
        return () => clearInterval(intervalId);
    }, []);

    const changeFilter = (newFilter: MapFilter) => {
        setFilter(newFilter);
        localStorage.setItem('map-filter', newFilter);
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="map-wrap" style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div
                ref={mapContainer}
                className={`map map-filter-${filter}`}
                style={{ width: '100%', height: '100%' }}
            />

            {/* Selector de Filtros */}
            <div className="map-filter-selector glass-card fade-in" style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                display: 'flex',
                padding: '5px',
                gap: '5px',
                borderRadius: '12px'
            }}>
                <button
                    onClick={() => changeFilter('normal')}
                    className={`filter-btn ${filter === 'normal' ? 'active' : ''}`}
                    title="Modo Normal"
                >
                    Claro
                </button>
                <button
                    onClick={() => changeFilter('dark')}
                    className={`filter-btn ${filter === 'dark' ? 'active' : ''}`}
                    title="Modo Oscuro"
                >
                    Oscuro
                </button>
                <button
                    onClick={() => changeFilter('blue')}
                    className={`filter-btn ${filter === 'blue' ? 'active' : ''}`}
                    title="Tono Azulado"
                >
                    Azul
                </button>
                <div style={{ width: '1px', background: 'var(--glass-border)', margin: '0 5px' }}></div>
                <button
                    onClick={handleRefresh}
                    className="filter-btn"
                    title="Refrescar Aplicación"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <RotateCw size={16} />
                </button>
            </div>

            {/* Tarjeta de Información Inferior */}
            <div className="map-overlay-bottom map-card-yellow fade-in" style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '400px',
                padding: '15px 25px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                zIndex: 1000
            }}>
                <div className="map-icon-circle" style={{ background: '#1a1a1a', color: 'white', padding: '10px', borderRadius: '12px' }}>
                    <MapIcon size={24} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Furgón NB-2026</h4>
                    <p style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {address}
                    </p>
                </div>
                <div className="signal-indicator">
                    {status === 'online' ? (
                        <div style={{ color: '#006400', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 800 }}>
                            <Signal size={16} /> EN VIVO
                        </div>
                    ) : (
                        <div style={{ color: '#555', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                            <SignalLow size={16} /> {status === 'waiting' ? '...' : 'OFFLINE'}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                /* Filtros CSS para el mapa */
                .map-filter-dark canvas,
                .map-filter-dark .maplibregl-canvas {
                    filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
                }
                .map-filter-blue canvas,
                .map-filter-blue .maplibregl-canvas {
                    filter: grayscale(100%) sepia(100%) hue-rotate(190deg) saturate(300%) brightness(80%) contrast(110%);
                }
                
                /* Estilos para el selector de filtros */
                .filter-btn {
                    background: transparent;
                    border: none;
                    color: white;
                    padding: 8px 15px;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .filter-btn.active {
                    background: var(--primary);
                    color: black;
                }
                .filter-btn:hover:not(.active) {
                    background: rgba(255, 255, 255, 0.1);
                }

                .bus-marker-premium {
                    cursor: pointer;
                    z-index: 2;
                }
                .bus-icon-container {
                    position: relative;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    background: white;
                    border-radius: 50%;
                    border: 3px solid var(--primary);
                    box-shadow: var(--shadow);
                }
                .bus-pulse {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background: var(--primary);
                    border-radius: 50%;
                    opacity: 0.6;
                    animation: markerPulse 2s infinite;
                }
                @keyframes markerPulse {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(2.5); opacity: 0; }
                }

                .maplibregl-ctrl {
                    filter: none !important;
                }
            `}</style>
        </div>
    );
};

export default Map;
