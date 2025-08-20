"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = emailRoutes;
const router_1 = require("../agents/router");
const sales_1 = require("../agents/sales");
const followup_1 = require("../agents/followup");
const streaming_1 = require("../utils/streaming");
const db_1 = require("../db");
async function emailRoutes(fastify, options) {
    // Streaming email generation endpoint
    fastify.post('/emails/generate-stream', async (request, reply) => {
        const stream = new streaming_1.StreamingHandler(reply);
        try {
            const { prompt, context } = request.body;
            if (!prompt) {
                stream.error('Prompt is required');
                return;
            }
            // Step 1: Classify the prompt
            stream.write({ type: 'classification', content: 'Analyzing your request...' });
            await (0, streaming_1.delay)(500); // Simulate processing time
            const agentType = await (0, router_1.classifyPrompt)(prompt);
            stream.write({ type: 'classification', content: `Classified as: ${agentType}`, agentType });
            await (0, streaming_1.delay)(300);
            // Step 2: Generate email content
            const emailContent = agentType === 'sales'
                ? await (0, sales_1.generateSalesEmail)({ prompt, context })
                : await (0, followup_1.generateFollowupEmail)({ prompt, context });
            // Step 3: Stream subject
            stream.write({ type: 'subject', content: emailContent.subject });
            await (0, streaming_1.delay)(400);
            // Step 4: Stream body (simulate typing effect)
            const bodyWords = emailContent.body.split(' ');
            let currentBody = '';
            for (const word of bodyWords) {
                currentBody += (currentBody ? ' ' : '') + word;
                stream.write({ type: 'body', content: currentBody });
                await (0, streaming_1.delay)(100); // Simulate typing
            }
            // Step 5: Save to database
            await db_1.DB.createEmail({
                to: context?.recipient || '',
                subject: emailContent.subject,
                body: emailContent.body
            });
            stream.end();
        }
        catch (error) {
            console.error('Streaming error:', error);
            stream.error(error instanceof Error ? error.message : 'Unknown error occurred');
        }
    });
    // Get emails list
    fastify.get('/emails', async (request, reply) => {
        try {
            const emails = await db_1.DB.getEmailList();
            return { emails };
        }
        catch (error) {
            reply.status(500).send({ error: 'Failed to fetch emails' });
        }
    });
    // Get single email
    fastify.get('/emails/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            const email = await db_1.DB.getEmailById(parseInt(id));
            if (!email) {
                reply.status(404).send({ error: 'Email not found' });
                return;
            }
            return { email };
        }
        catch (error) {
            reply.status(500).send({ error: 'Failed to fetch email' });
        }
    });
}
//# sourceMappingURL=emails.js.map