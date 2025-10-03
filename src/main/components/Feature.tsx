import React, { JSX, useEffect, useMemo, useState } from 'react';
import { usePricingToken } from '@/hooks/usePricingToken';

interface FeatureProps {
  id: string;
  children: React.ReactNode;
}

// Generic wrapper for feature children
export function On({ children }: { children: React.ReactNode }): JSX.Element {
  return <>{children}</>;
}

export function Default({ children }: { children: React.ReactNode }): JSX.Element {
  return <>{children}</>;
}
export function Loading({ children }: { children: React.ReactNode }): JSX.Element {
  return <>{children}</>;
}
export function ErrorFallback({ children }: { children: React.ReactNode }): JSX.Element {
  return <>{children}</>;
}

// Helper to get the children of a specific subcomponent type
function getChildrenOfType(children: React.ReactNode, type: React.ElementType): React.ReactNode {
  const match = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === type
  ) as React.ReactElement<any, any> | undefined;

  return match ? match.props.children : null;
}

export const Feature = ({ id, children }: FeatureProps): JSX.Element => {
  const tokenService = usePricingToken();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [result, setResult] = useState<boolean | null>(null);

  // Validate id
  const isValidId = useMemo(() => id.includes('-'), [id]);

  useEffect(() => {
    if (!isValidId) {
      setStatus('error');
      return;
    }
    if (tokenService.getPricingToken() === null) {
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
  }, [id, isValidId, tokenService.tokenPayload]);

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
