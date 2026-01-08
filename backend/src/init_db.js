const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function initDB() {
    try {
        await client.connect();
        console.log('✅ Conectado a PostgreSQL');

        // Crear tabla si no existe
        const createTableQuery = `
      CREATE TABLE IF NOT EXISTS bus_locations (
        id SERIAL PRIMARY KEY,
        bus_id VARCHAR(50) NOT NULL,
        lat DECIMAL(10, 6) NOT NULL,
        lng DECIMAL(10, 6) NOT NULL,
        speed DECIMAL(5, 2) DEFAULT 0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

        await client.query(createTableQuery);
        console.log('✅ Tabla bus_locations lista');

        // Crear tabla de usuarios
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL, -- TODO: Hash in production
                role VARCHAR(20) NOT NULL,
                bus_id VARCHAR(50) -- Null for parents/admins
            );
        `;
        await client.query(createUsersTable);
        console.log('✅ Tabla users lista');

        // Insertar conductor de prueba
        const checkUsers = await client.query('SELECT count(*) FROM users WHERE username = $1', ['conductor']);
        if (checkUsers.rows[0].count === '0') {
            const insertUser = `
                INSERT INTO users (username, password, role, bus_id)
                VALUES ('conductor', '1234', 'driver', 'NB-2026');
            `;
            await client.query(insertUser);
            console.log('✅ Usuario conductor insertado');
        }

        // Insertar un dato de prueba de ubicación si está vacía
        const checkEmpty = await client.query('SELECT count(*) FROM bus_locations');
        if (checkEmpty.rows[0].count === '0') {
            const insertQuery = `
            INSERT INTO bus_locations (bus_id, lat, lng, speed)
            VALUES ('NB-2026', -38.7639, -72.7502, 0);
        `;
            await client.query(insertQuery);
            console.log('✅ Dato de prueba insertado');
        }

        await client.end();
    } catch (err) {
        console.error('❌ Error inicializando DB:', err);
        process.exit(1);
    }
}

initDB();
