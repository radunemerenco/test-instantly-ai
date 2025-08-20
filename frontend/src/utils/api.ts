import { Email, AIGenerationRequest } from '../types/email';

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

  createStreamingConnection(
    request: AIGenerationRequest,
    onMessage: (data: any) => void,
    onComplete: () => void,
    onError: (error: string) => void
  ): EventSource | null {
    try {
      const eventSource = new EventSource(`${API_BASE}/emails/generate-stream`, {
        withCredentials: false,
      });

      // Send the request data via POST (we'll need to modify this)
      fetch(`${API_BASE}/emails/generate-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }).catch(onError);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'complete') {
            onComplete();
            eventSource.close();
          } else if (data.type === 'error') {
            onError(data.error || 'Unknown error');
            eventSource.close();
          } else {
            onMessage(data);
          }
        } catch (error) {
          onError('Failed to parse response');
        }
      };

      eventSource.onerror = () => {
        onError('Connection error');
        eventSource.close();
      };

      return eventSource;
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }
};