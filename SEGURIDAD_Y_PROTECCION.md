# 🛡️ Protocolo de Seguridad Futura

Este documento detalla las medidas de seguridad que **DEBEN** implementarse antes de o durante la **Fase 3 (Subida a la Nube)**. Actualmente, al estar en red local, somos flexibles, pero en internet es una selva.

---

## 1. Seguridad de Acceso (Authentication)
**Riesgo actual:** Cualquiera puede entrar al link y pulsar "Soy Conductor", enviando coordenadas falsas.

**Solución a implementar:**
*   **JWT (JSON Web Tokens):** El conductor debe loguearse una vez. El servidor le da un "carnet digital" (Token).
*   **Validación de Token:** El backend rechazará cualquier dato de GPS que no venga acompañado de ese carnet válido.
*   **Roles Estrictos:** El rol de "Apoderado" será de **solo lectura** estricta a nivel de base de datos.

## 2. Seguridad de Datos (Database Security)
**Riesgo actual:** Si hackean el backend, podrían leer todos los datos.

**Solución a implementar:**
*   **RLS (Row Level Security):** Es una regla mágica de PostgreSQL/Supabase.
    *   *Regla:* "Un conductor solo puede editar SU propia fila de ubicación".
    *   Aunque hackeen la API, la base de datos rechazará el intento de un conductor de modificar a otro.

## 3. Protección contra Ataques (Rate Limiting)
**Riesgo actual:** Alguien podría enviar 1 millón de ubicaciones por segundo para tumbar el servidor.

**Solución a implementar:**
*   **Rate Limit:** Configurar el servidor (Fastify) para aceptar máximo 1 actualización por segundo por vehículo. Si envían más, se bloquea la IP temporalmente.

## 4. HTTPS y Cifrado
**Riesgo actual:** El túnel es temporal y usamos certificados autofirmados (la pantalla roja).

**Solución a implementar:**
*   Al usar **Vercel** y **Render**, el HTTPS viene con **certificados SSL profesionales** por defecto.
*   Todo el tráfico irá encriptado de extremo a extremo (nadie en la red pública podrá interceptar "dónde está el niño").

## 5. Validación de Datos (Input Sanitization)
**Riesgo actual:** El servidor confía ciegamente en que le enviamos números de latitud/longitud.

**Solución a implementar:**
*   **Esquemas Zod/Joi:** El backend revisará matemáticamente que lo que llega sean coordenadas geográficas válidas (ej: Latitud entre -90 y 90) antes de procesarlas. Si alguien envía texto o código malicioso, se descarta instantáneamente.

---
**Resumen:**
Por ahora, en fase de prototipo, estamos bien. Pero en el momento que esto toque internet público, **el punto 1 (Autenticación) es obligatorio e innegociable**.
