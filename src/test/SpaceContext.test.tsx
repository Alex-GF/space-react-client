import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpaceProvider } from '../main/contexts/SpaceContext';
import { useSpaceClient } from '../main/hooks/useSpaceClient';
import type { SpaceConfiguration } from '@/main/types';

const config: SpaceConfiguration = {
  url: 'http://localhost:3000',
  apiKey: 'test-key',
};

function TestComponent() {
  const client = useSpaceClient();
  return <div data-testid="client">{client ? 'ClientReady' : 'NoClient'}</div>;
}

describe('SpaceProvider & useSpaceClient', () => {
  it('provides the SpaceClient instance to children', () => {
    render(
      <SpaceProvider config={config}>
        <TestComponent />
      </SpaceProvider>
    );
    expect(screen.getByTestId('client').textContent).toBe('ClientReady');
  });

  it('throws if useSpaceClient is used outside provider', () => {
    expect(() => render(<TestComponent />)).toThrow();
  });
});
