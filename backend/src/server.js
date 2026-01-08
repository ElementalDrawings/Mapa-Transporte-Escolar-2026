const fastify = require('fastify')({ logger: true });
require('dotenv').config();
const socketio = require('fastify-socket.io');

fastify.register(require('@fastify/postgres'), {
  connectionString: process.env.DATABASE_URL
});

fastify.register(require('@fastify/cors'), {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST"],
  credentials: true
});

// Register Socket.io
fastify.register(socketio, {
  cors: {
    origin: "*", // Permissive for testing
    methods: ["GET", "POST"]
  }
});

fastify.get('/test-db', async (request, reply) => {
  const client = await fastify.pg.connect();
  try {
    const { rows } = await client.query('SELECT version()');
    return { status: 'success', version: rows[0].version };
  } finally {
    client.release();
  }
});

fastify.post('/login', async (request, reply) => {
  const { username, password } = request.body;

  // Validar contra DB
  const query = 'SELECT id, username, role, bus_id FROM users WHERE username = $1 AND password = $2';

  const client = await fastify.pg.connect();
  try {
    const { rows } = await client.query(query, [username, password]);
    if (rows.length > 0) {
      return { success: true, user: rows[0] };
    } else {
      reply.code(401);
      return { success: false, message: 'Credenciales incorrectas' };
    }
  } catch (err) {
    console.error(err);
    reply.code(500);
    return { success: false, error: 'Error interno' };
  } finally {
    client.release();
  }
});

fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

fastify.get('/location/:busId', async (request, reply) => {
  const { busId } = request.params;

  // Buscar la última ubicación conocida en DB
  const query = `
    SELECT lat, lng, speed, timestamp 
    FROM bus_locations 
    WHERE bus_id = $1 
    ORDER BY timestamp DESC 
    LIMIT 1
  `;

  const client = await fastify.pg.connect();
  try {
    const { rows } = await client.query(query, [busId]);
    if (rows.length > 0) {
      return rows[0];
    } else {
      return { status: 'waiting', lat: null, lng: null };
    }
  } finally {
    client.release();
  }
});

fastify.post('/location', async (request, reply) => {
  const { busId, lat, lng, speed } = request.body;

  // Guardar en DB (Historial)
  const query = `
        INSERT INTO bus_locations (bus_id, lat, lng, speed)
        VALUES ($1, $2, $3, $4)
    `;

  const client = await fastify.pg.connect();
  try {
    await client.query(query, [busId, lat, lng, speed || 0]);
    console.log(`Saved DB update from ${busId}: ${lat}, ${lng}`);
    return { status: 'received' };
  } finally {
    client.release();
  }
});

// Simulation Endpoint (Modified to update memory)
fastify.get('/simulate', async () => {
  let lat = -38.7639;
  let lng = -72.7502;
  console.log('Starting simulation for NB-2026 (HTTP Mode)...');

  // Simulate movement
  const interval = setInterval(() => {
    lat += (Math.random() - 0.5) * 0.001;
    lng += (Math.random() - 0.5) * 0.001;

    // Insert into DB
    const query = `
        INSERT INTO bus_locations (bus_id, lat, lng, speed)
        VALUES ($1, $2, $3, $4)
    `;
    fastify.pg.query(query, ['NB-2026', lat, lng, 30]).catch(err => console.error(err));
  }, 2000);

  // Keep emitting socket just in case, but primary is now HTTP
  // fastify.io.to('bus_NB-2026').emit('update_location', ...);

  return { status: 'Simulation started' };
});

fastify.ready(err => {
  if (err) throw err;
  // Socket logic kept minimal for reference or future use
  fastify.io.on('connection', (socket) => {
    fastify.log.info(`Socket connected: ${socket.id}`);
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Servidor corriendo en http://localhost:3001 con Socket.io');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
