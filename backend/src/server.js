const fastify = require('fastify')({ logger: true });
require('dotenv').config();
const socketio = require('fastify-socket.io');

fastify.register(require('@fastify/postgres'), {
  connectionString: process.env.DATABASE_URL
});

fastify.register(require('@fastify/cors'), {
  origin: true,
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
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
  console.log(`Intento de login para: ${username}`);

  // Validar contra DB
  const query = 'SELECT id, username, role, bus_id FROM users WHERE username = $1 AND password = $2';

  try {
    const client = await fastify.pg.connect();
    try {
      const { rows } = await client.query(query, [username, password]);
      if (rows.length > 0) {
        console.log(`✅ Login OK: ${username}`);
        return { success: true, user: rows[0] };
      } else {
        console.log(`❌ Credenciales fallo: ${username}`);
        reply.code(401);
        return { success: false, message: 'Credenciales incorrectas' };
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('🔥 ERROR LOGIN DB:', err.message);
    reply.code(500);
    return { success: false, error: 'Error de base de datos', detail: err.message };
  }
});

fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

fastify.get('/bus-config/:busId', async (request, reply) => {
  const { busId } = request.params;
  const client = await fastify.pg.connect();
  try {
    const { rows } = await client.query('SELECT is_visible FROM bus_config WHERE bus_id = $1', [busId]);
    return rows.length > 0 ? rows[0] : { is_visible: true };
  } finally {
    client.release();
  }
});

fastify.post('/bus-config', async (request, reply) => {
  const { busId, is_visible } = request.body;
  const client = await fastify.pg.connect();
  try {
    await client.query(
      'INSERT INTO bus_config (bus_id, is_visible, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (bus_id) DO UPDATE SET is_visible = $2, updated_at = NOW()',
      [busId, is_visible]
    );
    return { success: true };
  } finally {
    client.release();
  }
});

fastify.get('/location/:busId', async (request, reply) => {
  const { busId } = request.params;
  const client = await fastify.pg.connect();

  try {
    // 1. Verificar visibilidad
    const configRes = await client.query('SELECT is_visible FROM bus_config WHERE bus_id = $1', [busId]);
    const isVisible = configRes.rows.length > 0 ? configRes.rows[0].is_visible : true;

    if (!isVisible) {
      return { status: 'hidden', lat: null, lng: null, message: 'El conductor ha ocultado la ubicación' };
    }

    // 2. Buscar la última ubicación conocida en DB
    const query = `
      SELECT lat, lng, speed, timestamp 
      FROM bus_locations 
      WHERE bus_id = $1 
      ORDER BY timestamp DESC 
      LIMIT 1
    `;

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
  const data = request.body;
  const client = await fastify.pg.connect();

  try {
    // Si enviamos un array (RÁFAGA)
    if (Array.isArray(data)) {
      console.log(`Recibida ráfaga de ${data.length} ubicaciones`);
      for (const loc of data) {
        const query = `
          INSERT INTO bus_locations (bus_id, lat, lng, speed, timestamp)
          VALUES ($1, $2, $3, $4, $5)
        `;
        // Usar timestamp del cliente si existe, sino el del servidor
        const ts = loc.timestamp ? new Date(loc.timestamp) : new Date();
        await client.query(query, [loc.busId, loc.lat, loc.lng, loc.speed || 0, ts]);
      }
    } else {
      // Caso normal (un solo objeto)
      const { busId, lat, lng, speed } = data;
      const query = `
        INSERT INTO bus_locations (bus_id, lat, lng, speed)
        VALUES ($1, $2, $3, $4)
      `;
      await client.query(query, [busId, lat, lng, speed || 0]);
      console.log(`Saved DB update from ${busId}: ${lat}, ${lng}`);
    }
    return { status: 'received' };
  } catch (err) {
    console.error('Error guardando ubicación:', err);
    reply.code(500);
    return { error: 'Database error' };
  } finally {
    client.release();
  }
});

// Passenger Management
fastify.get('/groups/:busId', async (request, reply) => {
  const { busId } = request.params;
  const client = await fastify.pg.connect();
  try {
    const { rows: groups } = await client.query('SELECT * FROM passenger_groups WHERE bus_id = $1', [busId]);
    for (let group of groups) {
      const { rows: passengers } = await client.query('SELECT name, is_on_board, boarding_order FROM passengers WHERE group_id = $1 ORDER BY boarding_order ASC, name ASC', [group.id]);
      group.passengers = passengers; // Now an array of objects
    }
    return groups;
  } finally {
    client.release();
  }
});

fastify.post('/groups/toggle', async (request, reply) => {
  const { groupId, isActive } = request.body;
  const client = await fastify.pg.connect();
  try {
    await client.query('UPDATE passenger_groups SET is_active = $1 WHERE id = $2', [isActive, groupId]);
    fastify.io.emit('sync_passengers'); // Real-time notify
    return { success: true };
  } finally {
    client.release();
  }
});

fastify.post('/passengers', async (request, reply) => {
  const { groupId, name, boardingOrder } = request.body;
  const client = await fastify.pg.connect();
  try {
    await client.query('INSERT INTO passengers (group_id, name, is_on_board, boarding_order) VALUES ($1, $2, TRUE, $3)', [groupId, name, boardingOrder || 0]);
    fastify.io.emit('sync_passengers'); // Real-time notify
    return { success: true };
  } finally {
    client.release();
  }
});

fastify.post('/passengers/update-order', async (request, reply) => {
  const { groupId, name, boardingOrder } = request.body;
  const client = await fastify.pg.connect();
  try {
    await client.query('UPDATE passengers SET boarding_order = $1 WHERE group_id = $2 AND name = $3', [boardingOrder, groupId, name]);
    fastify.io.emit('sync_passengers'); // Real-time notify
    return { success: true };
  } finally {
    client.release();
  }
});

fastify.delete('/passengers', async (request, reply) => {
  const { groupId, name } = request.body; // Simplified for PoC since we don't have passenger IDs yet
  const client = await fastify.pg.connect();
  try {
    await client.query('DELETE FROM passengers WHERE group_id = $1 AND name = $2', [groupId, name]);
    fastify.io.emit('sync_passengers'); // Real-time notify
    return { success: true };
  } finally {
    client.release();
  }
});

fastify.post('/passengers/toggle', async (request, reply) => {
  const { groupId, name, is_on_board } = request.body;
  const client = await fastify.pg.connect();
  try {
    await client.query('UPDATE passengers SET is_on_board = $1 WHERE group_id = $2 AND name = $3', [is_on_board, groupId, name]);
    fastify.io.emit('sync_passengers'); // Real-time notify
    return { success: true };
  } finally {
    client.release();
  }
});

fastify.post('/passengers/turn-off-all', async (request, reply) => {
  const { groupId } = request.body;
  const client = await fastify.pg.connect();
  try {
    await client.query('UPDATE passengers SET is_on_board = FALSE WHERE group_id = $1', [groupId]);
    fastify.io.emit('sync_passengers'); // Real-time notify
    return { success: true };
  } finally {
    client.release();
  }
});

fastify.get('/active-passengers/:busId', async (request, reply) => {
  const { busId } = request.params;
  const client = await fastify.pg.connect();
  try {
    const query = `
      SELECT p.name, p.boarding_order
      FROM passengers p
      JOIN passenger_groups g ON p.group_id = g.id
      WHERE g.bus_id = $1 AND p.is_on_board = TRUE
      ORDER BY p.boarding_order ASC, p.name ASC
    `;
    const { rows } = await client.query(query, [busId]);
    return rows; // Return full objects with order
  } finally {
    client.release();
  }
});

// Simulation Endpoint (Modified to update memory)
// Simulation Endpoint (Modified to update memory - Loop Removed)
fastify.get('/simulate', async () => {
  console.log('Simulation disabled to prevent GPS jumping.');
  return { status: 'Simulation disabled' };
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

    // Debug Connection String (Masked)
    const dbUrl = process.env.DATABASE_URL || '';
    const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`Intentando conectar a DB: ${maskedUrl} `);

    console.log('Servidor corriendo en http://localhost:3001 con Socket.io');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
