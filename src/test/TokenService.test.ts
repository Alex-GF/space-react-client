import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokenService } from '@/services/token';
import { createFakeJwt } from './utils/token/helpers';

// Mock JWT payloads
const validPayload = {
  exp: Math.floor(Date.now() / 1000) + 60, // expires in 1 minute
  features: {
    'service-feature': { eval: true },
    'other-feature': { eval: false },
  },
  custom: 'value',
};

const expiredPayload = {
  ...validPayload,
  exp: Math.floor(Date.now() / 1000) - 60, // expired 1 minute ago
};

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    service = new TokenService();
  });

  it('should return null if token is not set', () => {
    expect(service.getPayload()).toBeNull();
  });

  it('should update and retrieve a valid token', () => {
    const token = createFakeJwt(validPayload);
    service.update(token);
    expect(service.getPayload()).toEqual(validPayload);
  });

  it('should return null if token is expired', () => {
    const token = createFakeJwt(expiredPayload);
    service.update(token);
    expect(service.getPayload()).toBeNull();
  });

  it('should retrieve a value from the token payload', () => {
    const token = createFakeJwt(validPayload);
    service.update(token);
    expect(service.getKey('custom')).toBe('value');
  });

  it('should return null for getKey if token is invalid', () => {
    expect(service.getKey('custom')).toBeNull();
  });

  it('should evaluate features correctly', () => {
    const token = createFakeJwt(validPayload);
    service.update(token);
    expect(service.evaluateFeature('service-feature')).toBe(true);
    expect(service.evaluateFeature('other-feature')).toBe(false);
  });

  it('should return false for evaluateFeature if token is invalid', () => {
    expect(service.evaluateFeature('service-feature')).toBe(false);
  });

  it('should return false and warn if feature is not found', () => {
    const token = createFakeJwt(validPayload);
    service.update(token);
    expect(service.evaluateFeature('non-existent')).toBe(null);
  });

  it('should notify subscribers on token update and allow unsubscribe', () => {
    const listener = vi.fn();
    const unsubscribe = service.subscribe(listener);
    const token = createFakeJwt(validPayload);
    service.update(token);
    expect(listener).toHaveBeenCalledTimes(1);

    // After unsubscribe, no more notifications
    unsubscribe();
    const token2 = createFakeJwt({ ...validPayload, exp: Math.floor(Date.now() / 1000) + 120 });
    service.update(token2);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
