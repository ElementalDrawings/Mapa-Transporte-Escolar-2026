import { useState, useEffect } from 'react';
import { Send, StopCircle, Truck, MapPin, Gauge } from 'lucide-react';

const DriverDashboard = () => {
    const [isTracking, setIsTracking] = useState(false);
    const [status, setStatus] = useState('Listo para iniciar');
    const [coords, setCoords] = useState<{ lat: number, lng: number, speed: number } | null>(null);

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
                    setCoords({ lat: latitude, lng: longitude, speed: speed || 0 });
                    setStatus('Transmitiendo en vivo');

                    try {
                        await fetch('/location', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                busId: 'NB-2026',
                                lat: latitude,
                                lng: longitude,
                                speed: speed || 0
                            })
                        });
                    } catch (error) {
                        console.error('Error sending location:', error);
                        setStatus('Error de conexión 🔴');
                    }
                },
                (error) => {
                    setStatus(`Error GPS: ${error.message}`);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
            setStatus('Ruta finalizada');
        }

        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, [isTracking]);

    return (
        <div className="selection-screen fade-in" style={{ justifyContent: 'flex-start', paddingTop: '40px' }}>
            <div className="bg-dots"></div>

            <header style={{ textAlign: 'center', marginBottom: '30px', zIndex: 10 }}>
                <div className="icon-wrapper" style={{ margin: '0 auto 15px auto', background: 'var(--primary)', color: 'black' }}>
                    <Truck size={32} />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Panel de Control</h2>
                <p style={{ color: 'var(--text-muted)' }}>Móvil: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>NB-2026</span></p>
            </header>

            <div className="dashboard-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '15px',
                width: '100%',
                maxWidth: '500px',
                zIndex: 10,
                marginBottom: '30px'
            }}>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <MapPin size={24} style={{ color: 'var(--secondary)', marginBottom: '10px' }} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estado</div>
                    <div style={{ fontWeight: 600, color: isTracking ? 'var(--success)' : 'inherit' }}>{status}</div>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    <Gauge size={24} style={{ color: 'var(--primary)', marginBottom: '10px' }} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Velocidad</div>
                    <div style={{ fontWeight: 600, fontSize: '1.25rem' }}>{coords ? Math.round(coords.speed * 3.6) : 0} <span style={{ fontSize: '0.8rem' }}>km/h</span></div>
                </div>
            </div>

            <div style={{ zIndex: 10, width: '100%', maxWidth: '500px' }}>
                <button
                    onClick={() => setIsTracking(!isTracking)}
                    className="btn-select"
                    style={{
                        height: '100px',
                        fontSize: '1.5rem',
                        background: isTracking ? 'rgba(255, 77, 79, 0.2)' : 'rgba(82, 196, 26, 0.2)',
                        borderColor: isTracking ? 'var(--danger)' : 'var(--success)',
                        color: isTracking ? 'var(--danger)' : 'var(--success)',
                        borderWidth: '2px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}
                >
                    {isTracking ? (
                        <><StopCircle size={32} style={{ marginBottom: '5px' }} /> FINALIZAR RECORRIDO</>
                    ) : (
                        <><Send size={32} style={{ marginBottom: '5px' }} /> INICIAR TRANSMISIÓN</>
                    )}
                </button>
            </div>

            {coords && (
                <div className="fade-in" style={{ marginTop: '30px', color: 'var(--text-muted)', fontSize: '0.85rem', zIndex: 10 }}>
                    GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;
