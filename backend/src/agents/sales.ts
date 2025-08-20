import { ChatOpenAI } from '@langchain/openai';
import { AgentRequest, EmailContent } from '../types/agents';

const openai = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 150,
});

const SALES_SYSTEM_PROMPT = `You are a sales email specialist. Generate concise sales emails under 40 words total.
Use 7-10 words per sentence maximum. Be direct, professional, and compelling.
Always include a clear call-to-action.

Format your response as JSON:
{
  "subject": "Brief subject line (5-8 words)",
  "body": "Email body under 40 words total"
}

Keep sentences short and punchy. Focus on value proposition and next steps.`;

export async function generateSalesEmail(request: AgentRequest): Promise<EmailContent> {
  try {
    const contextInfo = request.context?.recipient ? 
      `Recipient: ${request.context.recipient}` : '';
    
    const prompt = `${request.prompt}\n${contextInfo}`;
    
    const response = await openai.invoke([
      { role: 'system', content: SALES_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ]);

    const content = response.content.toString();
    
    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content);
      return {
        subject: parsed.subject || 'Quick Connection',
        body: parsed.body || 'Hi! Let\'s discuss opportunities. When works for a brief call?',
        agentType: 'sales'
      };
    } catch {
      // Fallback if JSON parsing fails
      const lines = content.split('\n').filter(line => line.trim());
      return {
        subject: lines[0] || 'Quick Connection',
        body: lines.slice(1).join('\n') || 'Hi! Let\'s discuss opportunities. When works for a brief call?',
        agentType: 'sales'
      };
    }
  } catch (error) {
    console.error('Sales agent error:', error);
    return {
      subject: 'Quick Connection',
      body: 'Hi! I\'d love to discuss how we can help your business. When works for a brief call?',
      agentType: 'sales'
    };
  }
}

// Streaming version for real-time generation
export async function* generateSalesEmailStream(request: AgentRequest): AsyncGenerator<{type: string, content: string}, void, unknown> {
  try {
    const contextInfo = request.context?.recipient ? 
      `Recipient: ${request.context.recipient}` : '';
    
    const prompt = `${request.prompt}\n${contextInfo}`;
    
    // Create streaming OpenAI instance
    const streamingOpenai = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 150,
      streaming: true,
    });

    // Use a simpler prompt that encourages natural text output
    const streamPrompt = `You are a sales email specialist. Write a concise sales email for this request: "${prompt}"

Write the subject line first, then the body. Keep it under 40 words total. Don't use JSON format. Be direct and compelling with a clear call-to-action.`;

    const stream = await streamingOpenai.stream([
      { role: 'user', content: streamPrompt }
    ]);

    let fullContent = '';
    let subjectSent = false;

    for await (const chunk of stream) {
      const token = chunk.content;
      fullContent += token;
      
      // For the first few tokens, try to identify if this looks like a subject line
      if (!subjectSent) {
        const lines = fullContent.split('\n');
        const firstLine = lines[0].trim();
        
        // If we have a complete first line (ended with newline) or enough content
        if (lines.length > 1 || fullContent.length > 30) {
          const subject = firstLine.replace(/^(Subject:|SUBJECT:)/i, '').trim();
          yield { type: 'subject', content: subject || 'Quick Connection' };
          subjectSent = true;
          
          // Send the body content (everything after the first line)
          const bodyContent = lines.slice(1).join('\n').trim();
          if (bodyContent) {
            yield { type: 'body', content: bodyContent };
          }
        } else {
          // Still building the subject line
          yield { type: 'subject', content: firstLine.replace(/^(Subject:|SUBJECT:)/i, '').trim() };
        }
      } else {
        // We're in the body section - send the complete content minus the first line
        const lines = fullContent.split('\n');
        const bodyContent = lines.slice(1).join('\n').trim();
        yield { type: 'body', content: bodyContent };
      }
    }

    // Fallback if something went wrong
    if (!subjectSent) {
      yield { type: 'subject', content: 'Quick Connection' };
      yield { type: 'body', content: fullContent || 'Hi! I\'d love to discuss how we can help your business. When works for a brief call?' };
    }

  } catch (error) {
    console.error('Sales agent streaming error:', error);
    yield { type: 'subject', content: 'Quick Connection' };
    yield { type: 'body', content: 'Hi! I\'d love to discuss how we can help your business. When works for a brief call?' };
  }
}