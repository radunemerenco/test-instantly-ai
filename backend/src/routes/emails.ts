import { FastifyInstance } from 'fastify';
import { classifyPrompt } from '../agents/router';
import { generateSalesEmail } from '../agents/sales';
import { generateFollowupEmail } from '../agents/followup';
import { StreamingHandler, delay } from '../utils/streaming';
import { AgentRequest } from '../types/agents';
import { DB } from '../db';

export default async function emailRoutes(fastify: FastifyInstance, options: any) {
  // Streaming email generation endpoint
  fastify.post('/emails/generate-stream', async (request, reply) => {
    const stream = new StreamingHandler(reply);
    
    try {
      const { prompt, context } = request.body as AgentRequest;
      
      if (!prompt) {
        stream.error('Prompt is required');
        return;
      }

      // Step 1: Classify the prompt
      stream.write({ type: 'classification', content: 'Analyzing your request...' });
      await delay(500); // Simulate processing time
      
      const agentType = await classifyPrompt(prompt);
      stream.write({ type: 'classification', content: `Classified as: ${agentType}`, agentType });
      
      await delay(300);
      
      // Step 2: Generate email content
      const emailContent = agentType === 'sales' 
        ? await generateSalesEmail({ prompt, context })
        : await generateFollowupEmail({ prompt, context });
      
      // Step 3: Stream subject
      stream.write({ type: 'subject', content: emailContent.subject });
      await delay(400);
      
      // Step 4: Stream body (simulate typing effect)
      const bodyWords = emailContent.body.split(' ');
      let currentBody = '';
      
      for (const word of bodyWords) {
        currentBody += (currentBody ? ' ' : '') + word;
        stream.write({ type: 'body', content: currentBody });
        await delay(100); // Simulate typing
      }
      
      // Step 5: Save to database
      await DB.createEmail({
        to: context?.recipient || '',
        subject: emailContent.subject,
        body: emailContent.body
      });
      
      stream.end();
      
    } catch (error) {
      console.error('Streaming error:', error);
      stream.error(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  });

  // Get emails list
  fastify.get('/emails', async (request, reply) => {
    try {
      const emails = await DB.getEmailList();
      return { emails };
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch emails' });
    }
  });

  // Get single email
  fastify.get('/emails/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const email = await DB.getEmailById(parseInt(id));
      
      if (!email) {
        reply.status(404).send({ error: 'Email not found' });
        return;
      }
      
      return { email };
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch email' });
    }
  });
}