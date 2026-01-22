// Configuración global de la API
export const API_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === 'production'
        ? 'https://transporte-backend-fu9c.onrender.com'
        : '');
