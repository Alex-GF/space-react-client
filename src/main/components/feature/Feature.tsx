import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { usePricingToken } from '@/hooks/usePricingToken';

interface FeatureProps {
  id: string;
  children: React.ReactNode;
}

// Helper to get a child by type name
function getChildByType(children: React.ReactNode, typeName: string): ReactElement | null {
  const arr = React.Children.toArray(children) as ReactElement[];
  return arr.find(child => child.type && (child.type as any).name === typeName) || null;
}

export const Feature: React.FC<FeatureProps> = ({ id, children }) => {
  const tokenService = usePricingToken();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [result, setResult] = useState<boolean | null>(null);

  // Validate id
  const isValidId = useMemo(() => id.includes('-'), [id]);

  useEffect(() => {
    if (!isValidId) {
      console.error(`Invalid feature ID: ‘${id}’. A valid feature ID must contain a hyphen (’-’) and follow the format: ‘{serviceName in lowercase}-{featureName as defined in the pricing}’.`);
      return;
    }
    setStatus('loading');
    setResult(null);

    const evaluationResult = tokenService.evaluateFeature(id);

    if (evaluationResult === null || evaluationResult === undefined) {
      setStatus('error');
      console.error(`Feature evaluation failed for ID: ‘${id}’.`);
    } else {
      setResult(evaluationResult);
      setStatus('success');
    }
  }, [id, isValidId]);

  if (status === 'loading') {
    return getChildByType(children, 'Loading') || <></>;
  }
  if (status === 'error') {
    return getChildByType(children, 'ErrorFallback') || <></>;
  }
  if (status === 'success' && result === true) {
    return getChildByType(children, 'On') || <></>;
  }
  if (status === 'success' && result === false) {
    return getChildByType(children, 'Default') || <></>;
  }
  return <></>;
};
