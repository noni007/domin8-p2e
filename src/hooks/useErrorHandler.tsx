
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseErrorHandlerReturn {
  error: string | null;
  isError: boolean;
  handleError: (error: unknown, customMessage?: string) => void;
  clearError: () => void;
  retryWithErrorHandling: (fn: () => Promise<void>) => Promise<void>;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    console.error('Error occurred:', error);
    
    let errorMessage = customMessage || "An unexpected error occurred";
    
    if (error instanceof Error) {
      errorMessage = customMessage || error.message;
    } else if (typeof error === 'string') {
      errorMessage = customMessage || error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = customMessage || String(error.message);
    }
    
    setError(errorMessage);
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryWithErrorHandling = useCallback(async (fn: () => Promise<void>) => {
    try {
      clearError();
      await fn();
    } catch (error) {
      handleError(error, "Operation failed. Please try again.");
    }
  }, [handleError, clearError]);

  return {
    error,
    isError: !!error,
    handleError,
    clearError,
    retryWithErrorHandling,
  };
};
