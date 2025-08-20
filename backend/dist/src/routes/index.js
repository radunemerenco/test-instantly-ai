import emailRoutes from './emails';
export default async function routes(fastify, options) {
    fastify.get('/ping', async (request, reply) => {
        return 'pong\n';
    });
    // Register email routes
    fastify.register(emailRoutes, { prefix: '/api' });
}
//# sourceMappingURL=index.js.map