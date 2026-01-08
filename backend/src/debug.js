const fastify = require('fastify')({ logger: true });
require('dotenv').config();

console.log('DB URL:', process.env.DATABASE_URL);

// fastify.register(require('@fastify/postgres'), {
//   connectionString: process.env.DATABASE_URL
// });

// fastify.register(require('fastify-socket.io'));

fastify.get('/', async () => {
    return { hello: 'world' };
});

const start = async () => {
    try {
        await fastify.listen({ port: 3001, host: '0.0.0.0' }); // Port 3001 to avoid conflict
        console.log('Debug server running on 3001');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
