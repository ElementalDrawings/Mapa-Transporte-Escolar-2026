const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    await client.connect();

    console.log('--- BUS IDS ---');
    const busIds = await client.query('SELECT DISTINCT bus_id FROM bus_locations');
    console.log(busIds.rows);

    console.log('--- RECENT LOCATIONS ---');
    const locs = await client.query('SELECT id, bus_id, lat, lng, timestamp FROM bus_locations ORDER BY timestamp DESC LIMIT 5');
    console.log(locs.rows);

    await client.end();
}

run().catch(console.error);
