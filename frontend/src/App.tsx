import { useState } from 'react';
import Map from './components/Map';
import DriverDashboard from './components/DriverDashboard';
import Login from './components/Login';
import { Users, Truck, ArrowLeft } from 'lucide-react';
import './App.css';

function App() {
  const [role, setRole] = useState<'selecting' | 'login_driver' | 'driver' | 'parent'>('selecting');

  const handleLoginSuccess = () => {
    setRole('driver');
  };

  if (role === 'selecting') {
    return (
      <div className="selection-screen fade-in">
        <div className="bg-dots"></div>
        <header className="selection-header">
          <h1>Transporte <span>2026</span></h1>
          <p>Gestión y seguimiento en tiempo real</p>
        </header>

        <div className="selection-cards">
          <div className="role-card glass-card parent" onClick={() => setRole('parent')}>
            <div className="icon-wrapper">
              <Users size={40} />
            </div>
            <h3>Soy Apoderado</h3>
            <p>Visualiza el recorrido y ubicación del furgón.</p>
            <button className="btn-select">Ingresar Mapa</button>
          </div>

          <div className="role-card glass-card driver" onClick={() => setRole('login_driver')}>
            <div className="icon-wrapper">
              <Truck size={40} />
            </div>
            <h3>Soy Conductor</h3>
            <p>Inicia ruta y comparte tu ubicación GPS.</p>
            <button className="btn-select primary">Acceso Chofer</button>
          </div>
        </div>

        <footer className="selection-footer">
          <p>Cloud Edition v1.5 • © 2026</p>
        </footer>
      </div>
    );
  }

  if (role === 'login_driver') {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onCancel={() => setRole('selecting')}
      />
    );
  }

  return (
    <div className="app-container">
      {role === 'parent' ? (
        <>
          <Map />
          <div className="overlay-ui glass-card fade-in">
            <div className="overlay-header">
              <h3>Transporte Escolar</h3>
              <div className="status-badge">
                <span className="dot"></span> En Vivo
              </div>
            </div>
            <button className="btn-back" onClick={() => setRole('selecting')}>
              <ArrowLeft size={16} /> Salir
            </button>
          </div>
        </>
      ) : (
        <DriverDashboard />
      )}
    </div>
  );
}

export default App;
