import { useState, useCallback, useRef } from 'react';
import { AIGenerationRequest, AIStreamResponse, EmailFormData } from '../types/email';

interface UseStreamingAIProps {
  onSubjectUpdate?: (subject: string) => void;
  onBodyUpdate?: (body: string) => void;
  onComplete?: () => void;
}

export function useStreamingAI({
  onSubjectUpdate,
  onBodyUpdate,
  onComplete
}: UseStreamingAIProps = {}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentBody, setCurrentBody] = useState('');
  const eventSourceRef = useRef<EventSource | null>(null);

  const startGeneration = useCallback(async (request: AIGenerationRequest) => {
    setIsGenerating(true);
    setError(null);
    setCurrentSubject('');
    setCurrentBody('');

    try {
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create the request first
      const response = await fetch('http://localhost:3001/api/emails/generate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to start generation');
      }

      // Now listen for server-sent events
      const eventSource = new EventSource('http://localhost:3001/api/emails/generate-stream');
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data: AIStreamResponse = JSON.parse(event.data);
          
          switch (data.type) {
            case 'classification':
              // Optional: show classification result
              break;
              
            case 'subject':
              if (data.content) {
                setCurrentSubject(data.content);
                onSubjectUpdate?.(data.content);
              }
              break;
              
            case 'body':
              if (data.content) {
                setCurrentBody(data.content);
                onBodyUpdate?.(data.content);
              }
              break;
              
            case 'complete':
              setIsGenerating(false);
              onComplete?.();
              eventSource.close();
              break;
              
            case 'error':
              throw new Error(data.error || 'Generation failed');
          }
        } catch (parseError) {
          setError('Failed to parse server response');
          setIsGenerating(false);
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        setError('Connection lost');
        setIsGenerating(false);
        eventSource.close();
      };

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setIsGenerating(false);
    }
  }, [onSubjectUpdate, onBodyUpdate, onComplete]);

  const stopGeneration = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  return {
    isGenerating,
    error,
    currentSubject,
    currentBody,
    startGeneration,
    stopGeneration,
  };
}