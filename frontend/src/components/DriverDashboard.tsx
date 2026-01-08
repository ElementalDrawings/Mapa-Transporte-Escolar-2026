import { useState, useEffect } from 'react';
import { Send, StopCircle, User } from 'lucide-react';

const DriverDashboard = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [status, setStatus] = useState('Listo para iniciar');
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        let watchId: number | null = null;

        if (isTracking) {
            setStatus('Buscando señal GPS...');

            if (!navigator.geolocation) {
                setStatus('Error: GPS no soportado');
                return;
            }

            watchId = navigator.geolocation.watchPosition(
                async (position) => {
                    const { latitude, longitude, speed } = position.coords;
                    setCoords({ lat: latitude, lng: longitude });
                    setStatus(`Enviando... (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);

                    // Send to backend via HTTP POST (Polling Architecture)
                    try {
                        const response = await fetch('/location', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                busId: 'NB-2026', // Hardcoded for demo
                                lat: latitude,
                                lng: longitude,
                                speed: speed || 0
                            })
                        });
                        console.log('Envío:', response.status);
                    } catch (error) {
                        console.error('Error sending location:', error);
                        setStatus('Error de conexión con el servidor 🔴');
                    }
                },
                (error) => {
                    console.error('GPS Error:', error);
                    setStatus(`Error GPS: ${error.message}`);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                setStatus('Ruta finalizada');
            }
        }

        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, [isTracking]);

    return (
        <div style={{ padding: '20px', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
            <div style={{ marginBottom: '30px' }}>
                <User size={64} color="#333" />
                <h2>Panel Conductores</h2>
                <p>Patente: <strong>NB-2026</strong></p>
            </div>

            <div style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold', color: isTracking ? 'green' : '#666' }}>
                {status}
            </div>

            <button
                onClick={() => setIsTracking(!isTracking)}
                style={{
                    padding: '20px 40px',
                    fontSize: '1.5rem',
                    borderRadius: '50px',
                    border: 'none',
                    background: isTracking ? '#ff4d4f' : '#52c41a',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
            >
                {isTracking ? (
                    <><StopCircle /> TERMINAR RUTA</>
                ) : (
                    <><Send /> INICIAR RUTA</>
                )}
            </button>

            {coords && (
                <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#999' }}>
                    Lat: {coords.lat.toFixed(6)} <br />
                    Lng: {coords.lng.toFixed(6)}
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;
