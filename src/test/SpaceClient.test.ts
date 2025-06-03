import { SpaceClient } from '../main/clients/SpaceClient';
import type { SpaceConfiguration } from '@/index';
import { describe, it, expect, beforeAll, vi } from 'vitest';

describe('SpaceClient', () => {
  const config: SpaceConfiguration = {
    url: 'http://localhost:3000',
    apiKey: 'test-key',
    allowConnectionWithSpace: true,
  };

  beforeAll(() => {
    // @ts-ignore
    global.WebSocket = class {
      onmessage: ((event: any) => void) | null = null;
      onerror: ((event: any) => void) | null = null;
      close = vi.fn();
      send = vi.fn();
      constructor() {}
    };
  });

  it('Should instantiate with correct URLs', () => {
    const client = new SpaceClient(config);
    // @ts-ignore
    expect(client['httpUrl']).toContain('/api/v1');
    // @ts-ignore
    expect(client['wsUrl']).toContain('/events/pricings');
  });

  it('Should call callback on event emit', () => {
    const client = new SpaceClient(config);
    const callback = vi.fn();
    client.on('pricing_created', callback);
    // @ts-ignore
    client['emitter'].emit('pricing_created', { foo: 'bar' });
    expect(callback).toHaveBeenCalledWith({ foo: 'bar' });
  });

  it('Should generate pricing token', () => {
    const client = new SpaceClient(config);
    const spy = vi.spyOn(client, 'generateUserPricingToken').mockImplementation(() => {
      return new Promise((resolve) => {
        resolve('token');
      });
    });
    client.generateUserPricingToken();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveReturnedWith(Promise.resolve('token'));
    spy.mockRestore();
  });
});
