import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance, options: any) {
  fastify.get('/ping', async (request, reply) => {
    return 'pong\n';
  });
}