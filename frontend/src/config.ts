// Configuración global de la API
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_URL = import.meta.env.VITE_API_URL ||
    (!isLocal ? 'https://transporte-backend-fu9c.onrender.com' : 'http://localhost:3001');
