import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpaceProvider } from '../main/contexts/SpaceContext';
import { useSpaceClient } from '../main/hooks/useSpaceClient';
import type { SpaceConfiguration } from '@/index';

const config: SpaceConfiguration = {
  url: 'http://localhost:3000',
  apiKey: 'test-key',
  allowConnectionWithSpace: true,
};

function TestComponent() {
  const client = useSpaceClient();
  return <div data-testid="client">{client ? 'ClientReady' : 'NoClient'}</div>;
}

describe('SpaceProvider & useSpaceClient', () => {
  it('throws if useSpaceClient is used outside provider', () => {
    expect(() => render(<TestComponent />)).toThrow();
  });
});
