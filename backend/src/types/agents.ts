export type AgentType = 'sales' | 'followup';

export interface AgentRequest {
  prompt: string;
  context?: {
    recipient?: string;
    senderName?: string;
    previousContext?: string;
  };
}

export interface AgentResponse {
  type: 'classification' | 'subject' | 'body' | 'complete' | 'error';
  content?: string;
  agentType?: AgentType;
  error?: string;
}

export interface EmailContent {
  subject: string;
  body: string;
  agentType: AgentType;
}

export interface StreamingResponse {
  write: (data: string) => void;
  end: () => void;
}