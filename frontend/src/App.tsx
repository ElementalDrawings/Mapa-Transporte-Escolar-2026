import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from './config';
import Map from './components/Map';
import DriverDashboard from './components/DriverDashboard';
import Login from './components/Login';
import PassengerGroups from './components/PassengerGroups';
import AddPassenger from './components/AddPassenger';
import PassengerList from './components/PassengerList';
import './App.css';

function App() {
  const [role, setRole] = useState<'selecting' | 'login_driver' | 'driver' | 'parent' | 'passenger_groups' | 'add_passenger' | 'passenger_list'>('selecting');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [progress, setProgress] = useState({ total: 0, onboard: 0 });

  // Persistent Tracking State
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState('En espera');
  const [coords, setCoords] = useState<{ lat: number, lng: number, speed: number } | null>(null);
  const [locationQueue, setLocationQueue] = useState<any[]>(() => {
    const saved = localStorage.getItem('location_queue');
    return saved ? JSON.parse(saved) : [];
  });
  const wakeLock = useRef<any>(null);

  const fetchProgress = async () => {
    try {
      const res = await fetch(`${API_URL}/progress/NB-2026`);
      if (res.ok) {
        const data = await res.json();
        setProgress(data);
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  // Tracking Logic
  useEffect(() => {
    localStorage.setItem('location_queue', JSON.stringify(locationQueue));
  }, [locationQueue]);

  useEffect(() => {
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

          const locEntry = {
            busId: 'NB-2026',
            ...newCoords,
            timestamp: new Date().toISOString()
          };

          setLocationQueue(prev => [...prev.slice(-100), locEntry]);

          if (navigator.onLine) {
            try {
              await fetch(`${API_URL}/location`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([locEntry])
              });
            } catch (err) {
              console.error('GPS Upload Error:', err);
            }
          }
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

  useEffect(() => {
    if (role === 'selecting') {
      fetchProgress();

      const socket = io(API_URL);
      socket.on('sync_passengers', () => {
        fetchProgress();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [role]);

  const handleLoginSuccess = () => {
    setRole('driver');
  };

  // Render Logic
  if (role === 'login_driver') {
    return <Login onLoginSuccess={handleLoginSuccess} onCancel={() => setRole('selecting')} />;
  }

  if (role === 'driver') {
    return (
      <DriverDashboard
        onNavigateToPassengers={() => setRole('passenger_groups')}
        onBack={() => setRole('selecting')}
        isTracking={isTracking}
        setIsTracking={setIsTracking}
        status={status}
        coords={coords}
        locationQueue={locationQueue}
      />
    );
  }

  if (role === 'passenger_groups') {
    return (
      <PassengerGroups
        onBack={() => setRole('driver')}
        onAddGroup={(id) => {
          setSelectedGroupId(id);
          setRole('add_passenger');
        }}
      />
    );
  }

  if (role === 'add_passenger') {
    return <AddPassenger groupId={selectedGroupId} onBack={() => setRole('passenger_groups')} />;
  }

  if (role === 'parent') {
    return <Map onViewPassengers={() => setRole('passenger_list')} onBack={() => setRole('selecting')} />;
  }

  if (role === 'passenger_list') {
    return <PassengerList onBack={() => setRole('parent')} />;
  }

  // Calculate dynamic progress values
  const percentage = progress.total === 0 ? 0 : Math.round((progress.onboard / progress.total) * 100);
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-slate-900 relative">
      <header className="w-full max-w-sm text-center mb-8 z-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
          Transporte <span className="font-light">Tía Paty</span>
        </h1>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-60">
          2026
        </p>
      </header>

      <main className="w-full max-w-sm flex flex-col items-center space-y-6 z-10">
        <div className="relative flex flex-col items-center justify-center mb-4 animate-pop [animation-delay:0ms]">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle className="text-white/40" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeLinecap="round" strokeWidth="8"></circle>
              <circle
                className="text-black transition-all duration-700 origin-center -rotate-90 ease-out"
                cx="50"
                cy="50"
                fill="transparent"
                r="42"
                stroke="currentColor"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="8"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-3xl mb-1">local_shipping</span>
              <span className="text-xs font-bold">{percentage}%</span>
            </div>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-900/70">Progreso Diario</p>
        </div>

        <div className="w-full bg-surface-glass hover:bg-surface-glass-hover glass-panel rounded-4xl p-6 animate-pop [animation-delay:100ms]">
          <div className="flex flex-row items-center space-x-4 mb-4">
            <div className="p-3 bg-white/60 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-2xl text-slate-900 animate-wiggle">groups</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900">Soy Apoderado</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visualiza la ubicación del furgón.
              </p>
            </div>
          </div>
          <button
            onClick={() => setRole('parent')}
            className="w-full py-4 px-6 rounded-full bg-black text-white font-semibold text-sm shadow-xl shadow-black/10 btn-game"
          >
            Ingresar Mapa
          </button>
        </div>

        <div className="w-full bg-surface-glass hover:bg-surface-glass-hover glass-panel rounded-4xl p-6 animate-pop [animation-delay:200ms]">
          <div className="flex flex-row items-center space-x-4 mb-4">
            <div className="p-3 bg-white/60 rounded-full shadow-sm">
              <span className="material-symbols-outlined text-2xl text-slate-900 animate-wiggle">id_card</span>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900">Soy Conductor</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comparte ruta y ubicación GPS.
              </p>
            </div>
          </div>
          <button
            onClick={() => setRole('login_driver')}
            className="w-full py-4 px-6 rounded-full bg-white text-slate-900 border border-slate-100 font-semibold text-sm shadow-lg shadow-black/5 btn-game"
          >
            Acceso Chofer
          </button>
        </div>
      </main>

      <footer className="mt-12 text-center z-10 pointer-events-none opacity-50 animate-slide-up [animation-delay:400ms]">
        <p className="text-[10px] font-bold tracking-widest text-black">
          © 2026 SCHOOL TRANSPORT - V.2.2
        </p>
        <button
          onClick={() => {
            if (confirm('¿Limpiar caché y actualizar aplicación?')) {
              navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
              caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
              window.location.reload();
            }
          }}
          className="mt-4 text-[10px] underline pointer-events-auto cursor-pointer"
        >
          Limpiar App
        </button>
      </footer>
    </div>
  );
}

export default App;

