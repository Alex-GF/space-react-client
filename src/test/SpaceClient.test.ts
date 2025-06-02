import { SpaceClient } from '../main/clients/SpaceClient';
import type { SpaceConfiguration, SpaceEvents } from '@/main/types';
import { describe, it, expect, beforeAll, vi } from 'vitest';

describe('SpaceClient', () => {
  const config: SpaceConfiguration = {
    url: 'http://localhost:3000',
    apiKey: 'test-key',
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

  it('should instantiate with correct URLs', () => {
    const client = new SpaceClient(config);
    // @ts-ignore
    expect(client['httpUrl']).toContain('/api/v1');
    // @ts-ignore
    expect(client['wsUrl']).toContain('/events/pricings');
  });

  it('should call callback on event emit', () => {
    const client = new SpaceClient(config);
    const callback = vi.fn();
    client.on('pricing_created', callback);
    // @ts-ignore
    client['emitter'].emit('pricing_created', { foo: 'bar' });
    expect(callback).toHaveBeenCalledWith({ foo: 'bar' });
  });

  it('should log on evaluateFeature', () => {
    const client = new SpaceClient(config);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    client.evaluateFeature('user1', 'feature1');
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("Evaluating feature 'feature1' for user 'user1' using API key 'test-key'")
    );
    spy.mockRestore();
  });
});
