"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = routes;
const emails_1 = __importDefault(require("./emails"));
async function routes(fastify, options) {
    fastify.get('/ping', async (request, reply) => {
        return 'pong\n';
    });
    // Register email routes
    fastify.register(emails_1.default, { prefix: '/api' });
}
//# sourceMappingURL=index.js.map