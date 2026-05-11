import dotenv from 'dotenv';
import Fastify from 'fastify';
import apiRoutes from './routes/api.js';

const NODE_ENV = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${NODE_ENV}` });

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '0.0.0.0';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const isDev = NODE_ENV === 'development';

const app = Fastify({
  logger: isDev
    ? {
        level: LOG_LEVEL,
        transport: { target: 'pino-pretty', options: { colorize: true } },
      }
    : { level: LOG_LEVEL },
});

app.get('/', async (request, reply) => {
  return {
    status: 'ok',
    env: NODE_ENV,
    message: 'fnp-back Fastify server is running',
  };
});

app.register(apiRoutes, { prefix: '/api' });

const start = async () => {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`[${NODE_ENV}] Server listening on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
