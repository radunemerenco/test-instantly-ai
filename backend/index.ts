import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import routes from './src/routes';

const fastify: FastifyInstance = Fastify({
  logger: true
});

// Register CORS - Allow all origins and methods for development
fastify.register(cors, {
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

fastify.register(routes);

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

fastify.listen({ port, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`Server listening on ${address}`)
});