import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Transporte Escolar 2026',
        short_name: 'Transporte',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/socket.io': {
        target: 'https://transporte-backend-fu9c.onrender.com',
        ws: true,
        changeOrigin: true
      },
      '/location': {
        target: 'https://transporte-backend-fu9c.onrender.com',
        changeOrigin: true
      },
      '/simulate': {
        target: 'https://transporte-backend-fu9c.onrender.com',
        changeOrigin: true
      },
      '/login': {
        target: 'https://transporte-backend-fu9c.onrender.com',
        changeOrigin: true
      }
    }
  }
})
