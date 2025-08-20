import Fastify from 'fastify';
import routes from './src/routes/index';
const fastify = Fastify({
    logger: true
});
fastify.register(routes);
const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
fastify.listen({ port }, function (err, address) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    console.log(`Server listening on ${address}`);
});
//# sourceMappingURL=index.js.map