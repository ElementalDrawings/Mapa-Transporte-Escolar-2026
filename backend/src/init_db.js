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

        // Crear tabla de grupos de pasajeros
        const createGroupsTable = `
            CREATE TABLE IF NOT EXISTS passenger_groups (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                bus_id VARCHAR(50)
            );
        `;
        await client.query(createGroupsTable);
        console.log('✅ Tabla passenger_groups lista');

        // Crear tabla de pasajeros
        const createPassengersTable = `
            CREATE TABLE IF NOT EXISTS passengers (
                id SERIAL PRIMARY KEY,
                group_id VARCHAR(50) REFERENCES passenger_groups(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                is_on_board BOOLEAN DEFAULT FALSE
            );

            -- Intentamos añadir la columna si la tabla ya existía de antes
            DO $$
            BEGIN
                BEGIN
                    ALTER TABLE passengers ADD COLUMN is_on_board BOOLEAN DEFAULT FALSE;
                EXCEPTION
                    WHEN duplicate_column THEN null;
                END;
            END $$;
        `;
        await client.query(createPassengersTable);
        console.log('✅ Tabla passengers lista (con is_on_board)');

        // Inicializar grupo por defecto
        await client.query(`
            INSERT INTO passenger_groups (id, name, is_active, bus_id)
            VALUES ('default', 'Recorrido General', TRUE, 'NB-2026')
            ON CONFLICT (id) DO NOTHING;
        `);

        await client.end();
    } catch (err) {
        console.error('❌ Error inicializando DB:', err);
        if (client) await client.end().catch(() => { });
        process.exit(1);
    }
}

initDB();
