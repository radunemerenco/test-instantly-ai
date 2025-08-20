export interface Email {
  id: number;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmailFormData {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
}

export interface AIGenerationRequest {
  prompt: string;
  context?: {
    recipient?: string;
    senderName?: string;
    previousContext?: string;
  };
}

export interface AIStreamResponse {
  type: 'classification' | 'subject' | 'body' | 'complete' | 'error';
  content?: string;
  agentType?: 'sales' | 'followup';
  error?: string;
}