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