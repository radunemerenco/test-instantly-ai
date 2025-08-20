import { ChatOpenAI } from '@langchain/openai';
import { AgentRequest, EmailContent } from '../types/agents';

const openai = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
  temperature: 0.6,
  maxTokens: 200,
});

const FOLLOWUP_SYSTEM_PROMPT = `You are a follow-up email specialist. Generate polite, professional follow-up emails.
Be courteous but persistent. Reference previous interactions when possible.
Maintain a helpful, non-pushy tone.

Format your response as JSON:
{
  "subject": "Professional follow-up subject line",
  "body": "Polite follow-up email body"
}

Keep the tone warm but professional. Show value and consideration for their time.`;

export async function generateFollowupEmail(request: AgentRequest): Promise<EmailContent> {
  try {
    const contextInfo = request.context?.recipient ? 
      `Recipient: ${request.context.recipient}` : '';
    
    const previousContext = request.context?.previousContext ?
      `Previous context: ${request.context.previousContext}` : '';
    
    const prompt = `${request.prompt}\n${contextInfo}\n${previousContext}`;
    
    const response = await openai.invoke([
      { role: 'system', content: FOLLOWUP_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ]);

    const content = response.content.toString();
    
    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content);
      return {
        subject: parsed.subject || 'Following up on our conversation',
        body: parsed.body || 'Hi! I wanted to follow up on our previous discussion. Do you have any questions or need additional information?',
        agentType: 'followup'
      };
    } catch {
      // Fallback if JSON parsing fails
      const lines = content.split('\n').filter(line => line.trim());
      return {
        subject: lines[0] || 'Following up on our conversation',
        body: lines.slice(1).join('\n') || 'Hi! I wanted to follow up on our previous discussion. Do you have any questions or need additional information?',
        agentType: 'followup'
      };
    }
  } catch (error) {
    console.error('Follow-up agent error:', error);
    return {
      subject: 'Following up on our conversation',
      body: 'Hi! I wanted to follow up on our previous discussion. Please let me know if you have any questions or if there\'s anything else I can help with.',
      agentType: 'followup'
    };
  }
}

// Streaming version for real-time generation
export async function* generateFollowupEmailStream(request: AgentRequest): AsyncGenerator<{type: string, content: string}, void, unknown> {
  try {
    const contextInfo = request.context?.recipient ? 
      `Recipient: ${request.context.recipient}` : '';
    
    const previousContext = request.context?.previousContext ?
      `Previous context: ${request.context.previousContext}` : '';
    
    const prompt = `${request.prompt}\n${contextInfo}\n${previousContext}`;
    
    // Create streaming OpenAI instance
    const streamingOpenai = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.6,
      maxTokens: 200,
      streaming: true,
    });

    // Use a simpler prompt that encourages natural text output
    const streamPrompt = `You are a follow-up email specialist. Write a professional follow-up email for this request: "${prompt}"

Write the subject line first, then the body. Don't use JSON format. Keep it conversational and professional.`;

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
        if (lines.length > 1 || fullContent.length > 50) {
          const subject = firstLine.replace(/^(Subject:|SUBJECT:)/i, '').trim();
          yield { type: 'subject', content: subject || 'Following up on our conversation' };
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
      yield { type: 'subject', content: 'Following up on our conversation' };
      yield { type: 'body', content: fullContent || 'Hi! I wanted to follow up on our previous discussion. Please let me know if you have any questions.' };
    }

  } catch (error) {
    console.error('Follow-up agent streaming error:', error);
    yield { type: 'subject', content: 'Following up on our conversation' };
    yield { type: 'body', content: 'Hi! I wanted to follow up on our previous discussion. Please let me know if you have any questions.' };
  }
}