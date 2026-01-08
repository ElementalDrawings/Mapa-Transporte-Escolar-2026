import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Signal, SignalLow, Map as MapIcon, Palette } from 'lucide-react';

type MapFilter = 'normal' | 'dark' | 'blue';

const Map = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const busMarker = useRef<maplibregl.Marker | null>(null);
    const [status, setStatus] = useState<'online' | 'offline' | 'waiting'>('waiting');

    // Filtro de mapa con persistencia
    const [filter, setFilter] = useState<MapFilter>(() => {
        return (localStorage.getItem('map-filter') as MapFilter) || 'normal';
    });

    useEffect(() => {
        if (map.current) return;
        if (!mapContainer.current) return;

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
            center: [-72.7502, -38.7639],
            zoom: 15
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    }, []);

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const response = await fetch('/location/NB-2026');
                const data = await response.json();

                if (data.lat && data.lng) {
                    setStatus('online');
                    if (!map.current) return;

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
                } else {
                    setStatus('waiting');
                }
            } catch (error) {
                setStatus('offline');
            }
        };

        const intervalId = setInterval(fetchLocation, 3000);
        fetchLocation();
        return () => clearInterval(intervalId);
    }, []);

    const changeFilter = (newFilter: MapFilter) => {
        setFilter(newFilter);
        localStorage.setItem('map-filter', newFilter);
    };

    return (
        <div className="map-wrap" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Contenedor del mapa con clase dinámica para el filtro */}
            <div
                ref={mapContainer}
                className={`map map-filter-${filter}`}
                style={{ width: '100%', height: '100%' }}
            />

            {/* Selector de Filtros Estilo Pestaña */}
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
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', color: 'var(--text-muted)' }}>
                    <Palette size={16} />
                </div>
            </div>

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
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Furgón NB-2026</h4>
                    <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Labranza, Temuco</p>
                </div>
                <div className="signal-indicator">
                    {status === 'online' ? (
                        <div style={{ color: '#006400', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 800 }}>
                            <Signal size={16} /> EN VIVO
                        </div>
                    ) : (
                        <div style={{ color: '#555', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                            <SignalLow size={16} /> {status === 'waiting' ? 'ESPERANDO' : 'SIN SEÑAL'}
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
                    filter: hue-rotate(190deg) brightness(85%) saturate(140%) contrast(110%);
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

                /* Asegurar que los controles de MapLibre no se vean afectados por los filtros */
                .maplibregl-ctrl {
                    filter: none !important;
                }
            `}</style>
        </div>
    );
};

export default Map;
