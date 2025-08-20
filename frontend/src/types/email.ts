export type EmailStatus = 'draft' | 'sent';

export interface Email {
  id: number;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  status?: EmailStatus;
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
  emailId?: number; // Optional: for updating existing drafts
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