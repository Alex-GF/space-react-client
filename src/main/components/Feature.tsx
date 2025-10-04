import { usePricingTokenPayload } from '@/hooks/usePricingTokenPayload';
import { useTokenService } from '@/hooks/useTokenService';
import React, { useEffect, useMemo, useState } from 'react';

interface FeatureProps {
  id: string;
  children: React.ReactNode;
}

// Generic wrapper for feature children
export function On({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <>{children}</>;
}

export function Default({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <>{children}</>;
}
export function Loading({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <>{children}</>;
}
export function ErrorFallback({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <>{children}</>;
}

// Helper to get the children of a specific subcomponent type
function getChildrenOfType(children: React.ReactNode, type: React.ElementType): React.ReactNode {
  const match = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === type
  ) as React.ReactElement<any, any> | undefined;

  return match ? match.props.children : null;
}

export const Feature = ({ id, children }: FeatureProps): React.JSX.Element => {
  const tokenService = useTokenService();
  const tokenPayload = usePricingTokenPayload();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [result, setResult] = useState<boolean | null>(null);

  // Validate id
  const isValidId = useMemo(() => id.includes('-'), [id]);

  useEffect(() => {
    const evaluate = () => {
      if (!isValidId) {
        setStatus('error');
        return;
      }
      if (tokenService.getPayload() === null) {
        setStatus('error');
        return;
      }
      setStatus('loading');
      setResult(null);
      const evaluationResult = tokenService.evaluateFeature(id);
      if (evaluationResult === null || evaluationResult === undefined) {
        setStatus('error');
      } else {
        setResult(evaluationResult);
        setStatus('success');
      }
    };

    // Initial evaluation
    evaluate();

    // Subscribe to token changes to re-evaluate
    const unsubscribe = tokenService.subscribe(() => {
      evaluate();
    });

    return () => {
      unsubscribe();
    };
  }, [id, isValidId, tokenPayload, tokenService]);

  if (status === 'loading') {
    return <>{getChildrenOfType(children, Loading)}</>;
  }
  if (status === 'error') {
    return <>{getChildrenOfType(children, ErrorFallback)}</>;
  }
  if (status === 'success' && result === true) {
    return <>{getChildrenOfType(children, On)}</>;
  }
  if (status === 'success' && result === false) {
    return <>{getChildrenOfType(children, Default)}</>;
  }
  return <></>;
};
