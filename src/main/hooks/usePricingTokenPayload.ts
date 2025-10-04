import { useEffect, useState } from 'react';
import { useTokenService } from './useTokenService';

/**
 * React hook that returns the current pricing token payload and
 * re-renders when the token changes.
 */
export function usePricingTokenPayload<T extends Record<string, any> = Record<string, any>>() {
  const tokenService = useTokenService();
  const [payload, setPayload] = useState<T | null>(() => tokenService.getPayload() as T | null);

  useEffect(() => {
    // Ensure latest value on mount
    setPayload(tokenService.getPayload() as T | null);

    // Subscribe to token updates
    const unsubscribe = tokenService.subscribe(() => {
      setPayload(tokenService.getPayload() as T | null);
    });

    return () => unsubscribe();
  }, [tokenService]);

  return payload;
}
