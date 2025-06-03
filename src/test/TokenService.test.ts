import { describe, it, expect, beforeEach } from 'vitest';
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
    expect(service.getPricingToken()).toBeNull();
  });

  it('should update and retrieve a valid token', () => {
    const token = createFakeJwt(validPayload);
    service.updatePricingToken(token);
    expect(service.getPricingToken()).toEqual(validPayload);
  });

  it('should return null if token is expired', () => {
    const token = createFakeJwt(expiredPayload);
    service.updatePricingToken(token);
    expect(service.getPricingToken()).toBeNull();
  });

  it('should retrieve a value from the token payload', () => {
    const token = createFakeJwt(validPayload);
    service.updatePricingToken(token);
    expect(service.getFromToken('custom')).toBe('value');
  });

  it('should return null for getFromToken if token is invalid', () => {
    expect(service.getFromToken('custom')).toBeNull();
  });

  it('should evaluate features correctly', () => {
    const token = createFakeJwt(validPayload);
    service.updatePricingToken(token);
    expect(service.evaluateFeature('service-feature')).toBe(true);
    expect(service.evaluateFeature('other-feature')).toBe(false);
  });

  it('should return false for evaluateFeature if token is invalid', () => {
    expect(service.evaluateFeature('service-feature')).toBe(false);
  });

  it('should return false and warn if feature is not found', () => {
    const token = createFakeJwt(validPayload);
    service.updatePricingToken(token);
    expect(service.evaluateFeature('non-existent')).toBe(null);
  });
});
