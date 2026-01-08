import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';


const Map = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const busMarker = useRef<maplibregl.Marker | null>(null);
    const [debugInfo, setDebugInfo] = useState({ status: 'Desconectado ⚪', lastData: 'Esperando datos...' });

    // Effect 1: Initialize Map (Runs once)
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
                        tiles: [
                            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        ],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap Contributors'
                    }
                },
                layers: [
                    {
                        id: 'osm-tiles',
                        type: 'raster',
                        source: 'osm-tiles',
                        minzoom: 0,
                        maxzoom: 19
                    }
                ]
            },
            center: [-72.7502, -38.7639], // Labranza
            zoom: 15
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        map.current.addControl(new maplibregl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true
        }), 'top-right');
    }, []);

    // Effect 2: Polling Data (Runs independently)
    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const response = await fetch('/location/NB-2026');
                const data = await response.json();

                if (data.lat && data.lng) {
                    setDebugInfo({ status: 'Conectado (HTTP) 🟢', lastData: JSON.stringify(data) });

                    if (!map.current) return;

                    if (!busMarker.current) {
                        const el = document.createElement('div');
                        el.className = 'bus-marker';
                        el.style.backgroundColor = '#FFD700';
                        el.style.width = '20px';
                        el.style.height = '20px';
                        el.style.borderRadius = '50%';
                        el.style.border = '2px solid white';
                        el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
                        el.style.cursor = 'pointer';

                        busMarker.current = new maplibregl.Marker({ element: el })
                            .setLngLat([data.lng, data.lat])
                            .addTo(map.current);
                    } else {
                        busMarker.current.setLngLat([data.lng, data.lat]);
                    }
                } else {
                    setDebugInfo(prev => ({ ...prev, status: 'Esperando datos de simulación... 🟡' }));
                }
            } catch (error) {
                console.error('Polling error:', error);
                setDebugInfo(prev => ({ ...prev, status: 'Error de Conexión (HTTP) 🔴' }));
            }
        };

        const intervalId = setInterval(fetchLocation, 2000);
        fetchLocation(); // Initial call

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="map-wrap" style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div ref={mapContainer} className="map" style={{ width: '100%', height: '100%' }} />

            {/* Debug Overlay */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '12px',
                maxWidth: '300px',
                pointerEvents: 'none',
                zIndex: 1000
            }}>
                <p><strong>Socket:</strong> {debugInfo.status}</p>
                <p><strong>Último Dato:</strong> {debugInfo.lastData}</p>
            </div>
        </div>
    );
};

export default Map;
