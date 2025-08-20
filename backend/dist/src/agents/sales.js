import { ChatOpenAI } from '@langchain/openai';
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
export async function generateSalesEmail(request) {
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
        }
        catch {
            // Fallback if JSON parsing fails
            const lines = content.split('\n').filter(line => line.trim());
            return {
                subject: lines[0] || 'Quick Connection',
                body: lines.slice(1).join('\n') || 'Hi! Let\'s discuss opportunities. When works for a brief call?',
                agentType: 'sales'
            };
        }
    }
    catch (error) {
        console.error('Sales agent error:', error);
        return {
            subject: 'Quick Connection',
            body: 'Hi! I\'d love to discuss how we can help your business. When works for a brief call?',
            agentType: 'sales'
        };
    }
}
//# sourceMappingURL=sales.js.map