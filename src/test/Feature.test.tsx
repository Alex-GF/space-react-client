import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Default, ErrorFallback, Feature, Loading, On } from '@/components/Feature';
import { TokenService } from '@/services/token';
import { updateJwtExp, TEST_TOKEN } from './utils/token/helpers';
import { SpaceContext } from '@/contexts/SpaceContext';

// Helper to render Feature with context
function renderWithProvider(tokenService: TokenService, featureId: string) {
  return render(
    <SpaceContext.Provider value={{ client: undefined, tokenService }}>
      <Feature id={featureId}>
        <On>ON</On>
        <Default>DEFAULT</Default>
        <Loading>LOADING</Loading>
        <ErrorFallback>ERROR</ErrorFallback>
      </Feature>
    </SpaceContext.Provider>,
  );
}

describe('Feature component', () => {
  let tokenService: TokenService;

  beforeAll(() => {
    tokenService = new TokenService();
    tokenService.update(updateJwtExp(TEST_TOKEN, 20));
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
    tokenServiceExpired.update(TEST_TOKEN); // Set an expired token
    const { getByText } = renderWithProvider(tokenServiceExpired, 'zoom-automatedCaptions');
    expect(getByText('ERROR')).toBeDefined();
  });

  it('re-evaluates when tokenService updates token', async () => {
    const localService = new TokenService();
    // Start with disabled feature
    localService.update(updateJwtExp(TEST_TOKEN, 20));
    const { rerender } = render(
      <SpaceContext.Provider value={{ client: undefined, tokenService: localService }}>
        <Feature id="zoom-automatedCaptions">
          <On>ON</On>
          <Default>DEFAULT</Default>
          <Loading>LOADING</Loading>
          <ErrorFallback>ERROR</ErrorFallback>
        </Feature>
      </SpaceContext.Provider>,
    );

    // Initially disabled -> DEFAULT
    expect(screen.getByText('DEFAULT')).toBeDefined();

    // Create a token where the feature evaluates to true by toggling payload
    const parts = TEST_TOKEN.split('.');
    const payload = JSON.parse(atob(parts[1]));
    payload.features['zoom-automatedCaptions'].eval = true;
    payload.exp = Math.floor(Date.now() / 1000) + 30;
    const newToken = `${parts[0]}.${btoa(JSON.stringify(payload))}.${parts[2]}`;

    await act(async () => {
      localService.update(newToken);
    });

    // After update, component should re-render to ON
    expect(screen.getByText('ON')).toBeDefined();
  });
});
