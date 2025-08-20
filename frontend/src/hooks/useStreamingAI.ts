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
      // Use the emailApi streaming connection
      await (await import('../utils/api')).emailApi.createStreamingConnection(
        request,
        (data: AIStreamResponse) => {
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
          }
        },
        () => {
          setIsGenerating(false);
          onComplete?.();
        },
        (error: string) => {
          setError(error);
          setIsGenerating(false);
        }
      );
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