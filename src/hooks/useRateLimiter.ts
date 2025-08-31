import { useState, useCallback } from 'react';

interface RateLimiterConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimiterState {
  attempts: number;
  windowStart: number;
  blockedUntil?: number;
}

/**
 * Client-side rate limiter hook for authentication attempts
 * Provides basic protection against brute force attacks
 */
export const useRateLimiter = (config: RateLimiterConfig) => {
  const { maxAttempts, windowMs, blockDurationMs = 300000 } = config; // Default 5 min block
  
  const [state, setState] = useState<RateLimiterState>({
    attempts: 0,
    windowStart: Date.now()
  });

  const isBlocked = useCallback(() => {
    const now = Date.now();
    
    // Check if currently blocked
    if (state.blockedUntil && now < state.blockedUntil) {
      return true;
    }

    // Reset window if expired
    if (now - state.windowStart > windowMs) {
      setState({
        attempts: 0,
        windowStart: now
      });
      return false;
    }

    // Check if max attempts exceeded
    return state.attempts >= maxAttempts;
  }, [state, maxAttempts, windowMs]);

  const recordAttempt = useCallback(() => {
    const now = Date.now();
    
    setState(prevState => {
      // Reset window if expired
      if (now - prevState.windowStart > windowMs) {
        return {
          attempts: 1,
          windowStart: now
        };
      }

      const newAttempts = prevState.attempts + 1;
      
      // Block if max attempts exceeded
      if (newAttempts >= maxAttempts) {
        return {
          ...prevState,
          attempts: newAttempts,
          blockedUntil: now + blockDurationMs
        };
      }

      return {
        ...prevState,
        attempts: newAttempts
      };
    });
  }, [maxAttempts, windowMs, blockDurationMs]);

  const getRemainingTime = useCallback(() => {
    if (!state.blockedUntil) return 0;
    return Math.max(0, state.blockedUntil - Date.now());
  }, [state.blockedUntil]);

  const reset = useCallback(() => {
    setState({
      attempts: 0,
      windowStart: Date.now()
    });
  }, []);

  return {
    isBlocked: isBlocked(),
    recordAttempt,
    getRemainingTime,
    reset,
    attemptsRemaining: Math.max(0, maxAttempts - state.attempts)
  };
};