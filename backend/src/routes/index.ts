import { FastifyInstance } from 'fastify';
import emailRoutes from './emails';

export default async function routes(fastify: FastifyInstance, options: any) {
  fastify.get('/ping', async (request, reply) => {
    return 'pong\n';
  });

  // Register email routes
  fastify.register(emailRoutes, { prefix: '/api' });
}