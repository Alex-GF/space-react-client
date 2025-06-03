import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { Feature } from '@/components/Feature';
import { TokenService } from '@/services/token';
import { updateJwtExp, TEST_TOKEN } from './utils/token/helpers';
import { SpaceContext } from '@/contexts/SpaceContext';

// Dummy children components for testing
function On() {
  return <div>ON</div>;
}
function Default() {
  return <div>DEFAULT</div>;
}
function Loading() {
  return <div>LOADING</div>;
}
function ErrorFallback() {
  return <div>ERROR</div>;
}

// Helper to render Feature with context
function renderWithProvider(tokenService: TokenService, featureId: string) {
  return render(
    <SpaceContext.Provider value={{ client: undefined, tokenService }}>
      <Feature id={featureId}>
        <On />
        <Default />
        <Loading />
        <ErrorFallback />
      </Feature>
    </SpaceContext.Provider>,
  );
}

describe('Feature component', () => {
  let tokenService: TokenService;

  beforeAll(() => {
    tokenService = new TokenService();
    tokenService.updatePricingToken(updateJwtExp(TEST_TOKEN, 20));
  });

  it('Renders ON when feature with usage limit is enabled', () => {
    const { getByText } = renderWithProvider(tokenService, 'zoom-meetings');
    expect(getByText('ON')).toBeDefined();
  });

  it('Renders DEFAULT when feature is disabled', () => {
    const { getByText } = renderWithProvider(tokenService, 'zoom-automatedCaptions');
    expect(getByText('DEFAULT')).toBeDefined();
  });

  it('Renders ErrorFallback when provided an invalid id', () => {
    const { getByText } = renderWithProvider(tokenService, 'invalidid');
    expect(getByText('ERROR')).toBeDefined();
  });

  it('Renders ErrorFallback when provided an unexistent feature', () => {
    const { getByText } = renderWithProvider(tokenService, 'zoom-nonExistentFeature');
    expect(getByText('ERROR')).toBeDefined();
  });

  it('renders ErrorFallback when pricing token is not set', () => {
    const tokenServiceNoToken = new TokenService();
    const { getByText } = renderWithProvider(tokenServiceNoToken, 'zoom-automatedCaptions');
    expect(getByText('ERROR')).toBeDefined();
  });

  it('renders ErrorFallback when pricing token is expired', () => {
    const tokenServiceExpired = new TokenService();
    tokenServiceExpired.updatePricingToken(TEST_TOKEN); // Set an expired token
    const { getByText } = renderWithProvider(tokenServiceExpired, 'zoom-automatedCaptions');
    expect(getByText('ERROR')).toBeDefined();
  });
});
