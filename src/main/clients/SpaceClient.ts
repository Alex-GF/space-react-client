import { TinyEmitter } from 'tiny-emitter';
import type { SpaceEvents, SpaceConfiguration } from '@/main/types';

/**
 * SpaceClient handles API and WebSocket communication with SPACE.
 * It allows event subscription and provides feature evaluation methods.
 */
export class SpaceClient {
  private httpUrl: string;
  private wsUrl: string;
  private apiKey: string;
  private emitter: any;
  private ws?: WebSocket;

  constructor(config: SpaceConfiguration) {
    this.httpUrl = config.url.endsWith('/') ? config.url.slice(0, -1) + '/api/v1' : config.url + '/api/v1';
    this.wsUrl = config.url.replace(/^http/, 'ws') + '/events/pricings';
    this.apiKey = config.apiKey;
    this.emitter = new TinyEmitter();
    this.connectWebSocket();
  }

  /**
   * Connects to the SPACE WebSocket and handles incoming events.
   */
  private connectWebSocket() {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.event && data.payload) {
          this.emitter.emit(data.event, data.payload);
        }
      } catch (err) {
        this.emitter.emit('error', err);
      }
    };
    this.ws.onerror = (err) => {
      this.emitter.emit('error', err);
    };
  }

  /**
   * Subscribe to SPACE events.
   */
  on(event: SpaceEvents, callback: (data: any) => void) {
    this.emitter.on(event, callback);
  }

  /**
   * Example method for feature evaluation.
   */
  evaluateFeature(userId: string, featureId: string) {
    // Example: Replace with real API call
    // fetch(`${this.httpUrl}/features/evaluate`, ...)
    console.log(`Evaluating feature '${featureId}' for user '${userId}' using API key '${this.apiKey}'`);
  }
}
