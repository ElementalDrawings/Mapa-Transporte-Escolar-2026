import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Signal, SignalLow, Map as MapIcon } from 'lucide-react';

const Map = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const busMarker = useRef<maplibregl.Marker | null>(null);
    const [status, setStatus] = useState<'online' | 'offline' | 'waiting'>('waiting');

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

    return (
        <div className="map-wrap" style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div ref={mapContainer} className="map" style={{ width: '100%', height: '100%' }} />

            <div className="map-overlay-bottom glass-card fade-in" style={{
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
                <div className="map-icon-circle" style={{ background: 'var(--primary)', color: 'black', padding: '10px', borderRadius: '12px' }}>
                    <MapIcon size={24} />
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Furgón NB-2026</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Labranza, Temuco</p>
                </div>
                <div className="signal-indicator">
                    {status === 'online' ? (
                        <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 700 }}>
                            <Signal size={16} /> EN VIVO
                        </div>
                    ) : (
                        <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                            <SignalLow size={16} /> {status === 'waiting' ? 'ESPERANDO' : 'SIN SEÑAL'}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .bus-marker-premium {
                    cursor: pointer;
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
            `}</style>
        </div>
    );
};

export default Map;
