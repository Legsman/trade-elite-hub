
import { useState, useCallback } from "react";

export interface RetryState {
  retryCount: number;
  setRetryCount: (count: number | ((prev: number) => number)) => void;
  scheduleRetry: (fetchFunction: () => Promise<void>, maxRetries: number) => void;
}

export const useRetryLogic = (): RetryState => {
  const [retryCount, setRetryCount] = useState(0);
  
  const scheduleRetry = useCallback((fetchFunction: () => Promise<void>, maxRetries: number) => {
    if (retryCount < maxRetries) {
      const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        fetchFunction();
      }, retryDelay);
    }
  }, [retryCount]);
  
  return {
    retryCount,
    setRetryCount,
    scheduleRetry
  };
};
