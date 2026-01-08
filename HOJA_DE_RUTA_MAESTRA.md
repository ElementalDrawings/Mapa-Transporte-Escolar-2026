# 🗺️ Hoja de Ruta Maestra: Transporte Escolar 2026

Este documento sirve como "caja negra" y guía de navegación para el proyecto. Si cambias de desarrollador o de asistente IA, entrégales este archivo para que sepan exactamente dónde estamos y hacia dónde vamos.

---

## 🟢 Estado Actual (Fase 1: Prototipo Funcional Completo)
**Logro Principal:** Hemos creado un sistema de rastreo GPS en tiempo real que funciona en red local.

### ✅ Lo que ya funciona:
1.  **Backend (Cerebro):** Servidor Node.js + Fastify.
    *   Recibe coordenadas GPS vía HTTP POST.
    *   Mantiene la última ubicación en memoria RAM.
    *   Expone datos vía API JSON para el mapa.
2.  **Frontend (Cara):** React + Vite + MapLibre.
    *   **Modo Apoderado:** Mapa interactivo con auto-actualización (Polling) cada 2 segundos.
    *   **Modo Conductor:** Interfaz táctil que captura GPS real, muestra velocidad/coordenadas y evita que el celular se apague (Wake Lock).
3.  **Conectividad:**
    *   Soporte para **Wi-Fi Local** (rápido y seguro en casa).
    *   Soporte para **HTTPS** (necesario para permisos de GPS).
    *   Estrategia de **Polling** robusta contra firewalls.

---

## 🔜 Fase 2: Persistencia y Seguridad (Próxima Sesión)
*El objetivo es que los datos no se borren al reiniciar y que nadie pueda hacerse pasar por un conductor.*

- [x] **Base de Datos Real:** Conectar el backend a PostgreSQL (ya instalado) para guardar historial de rutas.
- [x] **Autenticación Básica:** Reemplazar la pantalla de "Selección de Rol" por un Login simple.
    - *Conductor:* Requiere contraseña para iniciar ruta.
    - *Apoderado:* Acceso libre (o con código de colegio).
- [ ] **Multi-Bus:** Permitir que varios conductores transmitan a la vez (el código ya está casi listo para esto).

---

## ☁️ Fase 3: La Nube "Free Tier" (Despliegue)
*El objetivo es salir de la red local y operar en internet real (4G/5G en toda la ciudad).*

1.  **Base de Datos:** Migrar de PostgreSQL Local a **Supabase** (Gratis). ✅ **COMPLETADO**
2.  **Backend:** Subir el código a **Render** o **Railway** (Gratis).
3.  **Frontend:** Subir el mapa a **Vercel** (Gratis, red global).
4.  **Dominio:** Configurar un subdominio (ej: `transporte2026.vercel.app`).

**Resultado:** El conductor podrá irse a la otra punta de la ciudad con 4G y tú lo verás en tu PC sin cables ni túneles.

---

## 🚀 Fase 4: Profesionalización (Largo Plazo)
*Características avanzadas para competir con apps comerciales.*

- [ ] **Optimización de Rutas:** Algoritmo para ordenar la recogida de niños automáticamente.
- [ ] **Notificaciones WhatsApp:** Mensaje automático al apoderado: *"El furgón está a 5 minutos"*.
- [ ] **App Nativa:** Empaquetar la web en una APK de Android real (usando Capacitor) para estar en la Play Store.

---

## 🛠️ Comandos Vitales
Para retomar el trabajo, siempre se necesitan estas dos terminales:

1.  **Backend:**
    ```bash
    cd backend
    node src/server.js
    ```
2.  **Frontend:**
    ```bash
    cd frontend
    npm run dev -- --host
    ```
    *(El `--host` es crucial para que funcione el Wi-Fi)*.

---
*Última actualización: 03 de Enero, 2026 - Proyecto "Zero Budget" en marcha.*
