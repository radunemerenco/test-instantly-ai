import { ChatOpenAI } from '@langchain/openai';
const openai = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0.1,
    maxTokens: 50,
});
const ROUTER_SYSTEM_PROMPT = `You are an email classification agent. Classify the user's request into one of two categories:
- "sales": If the user wants to generate a sales email, pitch, or promotional content
- "followup": If the user wants to generate a follow-up email, check-in, or reminder

Respond with ONLY the category name: either "sales" or "followup"

Examples:
"Meeting request for Tuesday" → sales
"Follow up on last week's discussion" → followup
"Product demo invitation" → sales
"Checking in on proposal status" → followup`;
export async function classifyPrompt(prompt) {
    try {
        const response = await openai.invoke([
            { role: 'system', content: ROUTER_SYSTEM_PROMPT },
            { role: 'user', content: prompt }
        ]);
        const classification = response.content.toString().toLowerCase().trim();
        if (classification.includes('sales')) {
            return 'sales';
        }
        else if (classification.includes('followup')) {
            return 'followup';
        }
        // Default to sales if unclear
        return 'sales';
    }
    catch (error) {
        console.error('Router agent error:', error);
        // Default to sales on error
        return 'sales';
    }
}
//# sourceMappingURL=router.js.map