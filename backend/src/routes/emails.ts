import { FastifyInstance } from 'fastify';
import { classifyPrompt } from '../agents/router';
import { generateSalesEmailStream } from '../agents/sales';
import { generateFollowupEmailStream } from '../agents/followup';
import { StreamingHandler } from '../utils/streaming';
import { AgentRequest, EmailStatus } from '../types/agents';
import { DB, EmailInput } from '../db';

export default async function emailRoutes(fastify: FastifyInstance, options: any) {
  // Streaming email generation endpoint
  fastify.post('/emails/generate-stream', async (request, reply) => {
    const stream = new StreamingHandler(reply);
    
    try {
      const { prompt, emailId, context } = request.body as AgentRequest;
      
      if (!prompt) {
        stream.error('Prompt is required');
        return;
      }

      // Step 1: Classify the prompt
      stream.write({ type: 'classification', content: 'Analyzing your request...' });
      
      const agentType = await classifyPrompt(prompt);
      stream.write({ type: 'classification', content: `Classified as: ${agentType}`, agentType });
      
      // Step 2: Generate email with real OpenAI streaming
      const streamGenerator = agentType === 'sales' 
        ? generateSalesEmailStream({ prompt, context })
        : generateFollowupEmailStream({ prompt, context });
      
      let subject = '';
      let body = '';
      let currentSection = 'subject';
      
      // Stream the OpenAI response in real-time
      for await (const chunk of streamGenerator) {
        if (chunk.type === 'subject') {
          subject = chunk.content;
          stream.write({ type: 'subject', content: subject });
          currentSection = 'body';
        } else if (chunk.type === 'body') {
          body = chunk.content;
          stream.write({ type: 'body', content: body });
        } else if (chunk.type === 'token') {
          // Accumulate tokens for the current section
          if (currentSection === 'subject') {
            subject += chunk.content;
            stream.write({ type: 'subject', content: subject });
          } else {
            body += chunk.content;
            stream.write({ type: 'body', content: body });
          }
        }
      }
      
      // Step 3: Save to database (create new or update existing)
      if (emailId) {
        // Update existing email
        await DB.updateEmail(emailId, {
          subject: subject,
          body: body,
          status: 'draft'
        });
      } else {
        // Create new email as draft
        await DB.createEmail({
          to: context?.recipient || '',
          subject: subject,
          body: body,
          status: 'draft'
        });
      }
      
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

  // Create email (save as draft)
  fastify.post('/emails', async (request, reply) => {
    try {
      const emailData = request.body as EmailInput;
      
      if (!emailData.to || !emailData.subject) {
        reply.status(400).send({ error: 'To and subject are required' });
        return;
      }

      const [emailId] = await DB.createEmail({
        ...emailData,
        status: 'draft'
      });
      
      return { id: emailId, status: 'draft' };
    } catch (error) {
      reply.status(500).send({ error: 'Failed to create email' });
    }
  });

  // Update email status (send email)
  fastify.patch('/emails/:id/status', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: EmailStatus };
      
      if (!status || !['draft', 'sent'].includes(status)) {
        reply.status(400).send({ error: 'Valid status is required (draft or sent)' });
        return;
      }

      const success = await DB.updateEmailStatus(parseInt(id), status);
      
      if (!success) {
        reply.status(404).send({ error: 'Email not found' });
        return;
      }
      
      return { success: true, status };
    } catch (error) {
      reply.status(500).send({ error: 'Failed to update email status' });
    }
  });

  // Delete email
  fastify.delete('/emails/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const success = await DB.deleteEmail(parseInt(id));
      
      if (!success) {
        reply.status(404).send({ error: 'Email not found' });
        return;
      }
      
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: 'Failed to delete email' });
    }
  });
}