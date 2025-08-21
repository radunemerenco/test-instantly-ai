export type AgentType = 'sales' | 'followup';

export interface AgentRequest {
  prompt: string;
  emailId?: number; // Optional: for updating existing drafts
  context?: {
    recipient?: string;
    senderName?: string;
    previousContext?: string;
  };
}

export interface AgentResponse {
  type: 'classification' | 'subject' | 'body' | 'complete' | 'error' | 'emailId';
  content?: string | number;
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

export type EmailStatus = 'draft' | 'sent';

export interface Email {
  id: number;
  to: string;
  cc?: string | null;
  bcc?: string | null;
  subject: string;
  body: string;
  status?: EmailStatus;
  created_at: string;
  updated_at: string;
}