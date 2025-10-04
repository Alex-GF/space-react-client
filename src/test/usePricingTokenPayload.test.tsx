import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SpaceContext, SpaceProvider } from '@/contexts/SpaceContext';
import { TokenService } from '@/services/token';
import { usePricingTokenPayload } from '@/hooks/usePricingTokenPayload';
import { TEST_TOKEN, updateJwtExp } from './utils/token/helpers';

function HookConsumer() {
  const payload = usePricingTokenPayload<any>();
  return <div data-testid="payload">{payload ? 'HAS_PAYLOAD' : 'NO_PAYLOAD'}</div>;
}

describe('usePricingTokenPayload hook', () => {
  it('returns null initially and updates after token update', async () => {
    const ts = new TokenService();

    render(
      <SpaceContext.Provider value={{ client: undefined, tokenService: ts }}>
        <HookConsumer />
      </SpaceContext.Provider>,
    );

    expect(screen.getByTestId('payload').textContent).toBe('NO_PAYLOAD');

    const validToken = updateJwtExp(TEST_TOKEN, 30);
    await act(async () => {
      ts.update(validToken);
    });

    expect(screen.getByTestId('payload').textContent).toBe('HAS_PAYLOAD');
  });

  it('goes back to null when updated with an expired token', async () => {
    const ts = new TokenService();

    render(
      <SpaceContext.Provider value={{ client: undefined, tokenService: ts }}>
        <HookConsumer />
      </SpaceContext.Provider>,
    );

    await act(async () => {
      ts.update(updateJwtExp(TEST_TOKEN, 30));
    });
    expect(screen.getByTestId('payload').textContent).toBe('HAS_PAYLOAD');

    // Set expired token (original TEST_TOKEN is expired)
    await act(async () => {
      ts.update(TEST_TOKEN);
    });

    expect(screen.getByTestId('payload').textContent).toBe('NO_PAYLOAD');
  });

  it('throws when used outside of SpaceProvider', () => {
    // A component that uses the hook without provider should throw
    const Bad = () => {
      usePricingTokenPayload();
      return null;
    };

    expect(() => render(<Bad />)).toThrow();
  });
});
