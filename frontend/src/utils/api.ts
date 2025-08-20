import { Email, AIGenerationRequest, EmailFormData, EmailStatus } from '../types/email';

const API_BASE = 'http://localhost:3001/api';

export const emailApi = {
  async getEmails(): Promise<Email[]> {
    const response = await fetch(`${API_BASE}/emails`);
    if (!response.ok) {
      throw new Error('Failed to fetch emails');
    }
    const data = await response.json();
    return data.emails;
  },

  async getEmailById(id: number): Promise<Email> {
    const response = await fetch(`${API_BASE}/emails/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch email');
    }
    const data = await response.json();
    return data.email;
  },

  async createStreamingConnection(
    request: AIGenerationRequest,
    onMessage: (data: any) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      // Send the POST request and handle the streaming response
      const response = await fetch(`${API_BASE}/emails/generate-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.slice(6); // Remove 'data: '
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                console.log('Received streaming data:', data); // Debug log
                if (data.type === 'complete') {
                  onComplete();
                  return;
                } else if (data.type === 'error') {
                  onError(data.error || 'Unknown error');
                  return;
                } else {
                  onMessage(data);
                }
              }
            } catch (parseError) {
              console.warn('Failed to parse line:', trimmedLine, parseError);
            }
          }
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unknown error');
    }
  },

  async createEmail(emailData: EmailFormData): Promise<{ id: number; status: EmailStatus }> {
    const response = await fetch(`${API_BASE}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error('Failed to create email');
    }

    return response.json();
  },

  async updateEmailStatus(id: number, status: EmailStatus): Promise<{ success: boolean; status: EmailStatus }> {
    const response = await fetch(`${API_BASE}/emails/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update email status');
    }

    return response.json();
  },

  async deleteEmail(id: number): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/emails/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete email');
    }

    return response.json();
  }
};