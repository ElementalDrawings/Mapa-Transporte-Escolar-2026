import { useState } from 'react';
import Map from './components/Map';
import DriverDashboard from './components/DriverDashboard';
import Login from './components/Login';
import PassengerGroups from './components/PassengerGroups';
import AddPassenger from './components/AddPassenger';
import PassengerList from './components/PassengerList';
import './App.css'; // Maintaining for legacy styles if needed, but mostly overriding

function App() {
  const [role, setRole] = useState<'selecting' | 'login_driver' | 'driver' | 'parent' | 'passenger_groups' | 'add_passenger' | 'passenger_list'>('selecting');

  const handleLoginSuccess = () => {
    setRole('driver');
  };

  /* const _handleDriverNavigation = (target: string) => {
    if (target === 'passenger_groups') setRole('passenger_groups');
  }; */

  // Render Logic
  if (role === 'login_driver') {
    return <Login onLoginSuccess={handleLoginSuccess} onCancel={() => setRole('selecting')} />;
  }

  if (role === 'driver') {
    return <DriverDashboard onNavigateToPassengers={() => setRole('passenger_groups')} />;
  }

  if (role === 'passenger_groups') {
    return (
      <PassengerGroups
        onBack={() => setRole('driver')}
        onAddGroup={() => setRole('add_passenger')}
      />
    );
  }

  if (role === 'add_passenger') {
    return <AddPassenger groupId="default" onBack={() => setRole('passenger_groups')} />;
  }

  if (role === 'parent') {
    return <Map onViewPassengers={() => setRole('passenger_list')} onBack={() => setRole('selecting')} />;
  }

  if (role === 'passenger_list') {
    return <PassengerList onBack={() => setRole('parent')} />;
  }

  // Default: Selecting Screen (New UI)
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
        {/* Circular Progress */}
        <div className="relative flex flex-col items-center justify-center mb-4 animate-pop [animation-delay:0ms]">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle className="text-white/40" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeLinecap="round" strokeWidth="8"></circle>
              <circle className="text-black transition-all duration-300 origin-center -rotate-90" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeDasharray="264" strokeDashoffset="66" strokeLinecap="round" strokeWidth="8"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-3xl mb-1">local_shipping</span>
              <span className="text-xs font-bold">75%</span>
            </div>
          </div>
          <p className="mt-3 text-sm font-medium text-slate-900/70">Progreso Diario</p>
        </div>

        {/* Parent Card */}
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

        {/* Driver Card */}
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
          © 2026 SCHOOL TRANSPORT
        </p>
        {/* Anti-Cache Button preserved but styled minimally */}
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
