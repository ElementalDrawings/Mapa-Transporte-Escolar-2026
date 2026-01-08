import { useState } from 'react';
import Map from './components/Map';
import DriverDashboard from './components/DriverDashboard';
import Login from './components/Login';
import './App.css';

function App() {
  const [role, setRole] = useState<'selecting' | 'login_driver' | 'driver' | 'parent'>('selecting');

  const handleLoginSuccess = () => {
    setRole('driver');
  };

  if (role === 'selecting') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', background: '#333', color: 'white' }}>
        <h1>Transporte 2026</h1>
        <p>Selecciona tu perfil:</p>

        <button
          onClick={() => setRole('parent')}
          style={{ padding: '15px 30px', fontSize: '1.2rem', borderRadius: '10px', border: 'none', background: '#1890ff', color: 'white', width: '250px', cursor: 'pointer' }}>
          👨‍👩‍👧‍👦 Soy Apoderado
        </button>

        <button
          onClick={() => setRole('login_driver')}
          style={{ padding: '15px 30px', fontSize: '1.2rem', borderRadius: '10px', border: 'none', background: '#faad14', color: 'white', width: '250px', cursor: 'pointer' }}>
          🚐 Soy Conductor (Usuario)
        </button>

        <div style={{ marginTop: '20px', fontSize: '0.8rem', opacity: 0.7 }}>
          v1.2 - Autenticación Local
        </div>
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
          <div className="overlay-ui" style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: 1000,
            background: 'rgba(255,255,255,0.9)',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}>
            <h3>Transporte Escolar 2026</h3>
            <p>Estado: 🟢 En Línea</p>
            <button onClick={() => setRole('selecting')} style={{ marginTop: '5px', padding: '5px 10px', fontSize: '0.8rem', cursor: 'pointer' }}>⬅ Cambiar Rol</button>
          </div>
        </>
      ) : (
        <DriverDashboard />
      )}
    </div>
  );
}

export default App;
