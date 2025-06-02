import { TinyEmitter } from 'tiny-emitter';
import type { SpaceEvents, SpaceConfiguration, EventMessage } from '@/types';
import axios, { AxiosInstance } from 'axios';

/**
 * SpaceClient handles API and WebSocket communication with SPACE.
 * It allows event subscription and provides feature evaluation methods.
 */
export class SpaceClient {
  private httpUrl: string;
  private wsUrl: string;
  private apiKey: string;
  private axios: AxiosInstance
  private emitter: any;
  private ws?: WebSocket;
  private userId: string | null = null;

  constructor(config: SpaceConfiguration) {
    this.httpUrl = config.url.endsWith('/') ? config.url.slice(0, -1) + '/api/v1' : config.url + '/api/v1';
    this.wsUrl = config.url.replace(/^http/, 'ws') + '/events/pricings';
    this.apiKey = config.apiKey;
    this.emitter = new TinyEmitter();

    this.axios = axios.create({
      baseURL: this.httpUrl,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': `${this.apiKey}`,
      }
    })

    this.connectWebSocket();
  }

  /**
   * Connects to the SPACE WebSocket and handles incoming events.
   */
  private connectWebSocket() {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.onopen = () => {
      this.emitter.emit('synchronized', 'WebSocket connection established');
    }
    this.ws.onmessage = (event) => {
      try {
        const data: EventMessage = JSON.parse(event.data);
        if (data && data.code && data.details) {
          this.emitter.emit(data.code.toLowerCase(), data.details);
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
   * Listen to SPACE and connection events.
   * @param event The event key to listen for.
   * @param callback The callback function to execute when the event is emitted.
   * @example
   * ```typescript
   * spaceClient.on('pricing_created', (data) => {
   *   console.log('Pricing created:', data);
   * });
   * ```
   * @throws Will throw an error if the event is not recognized.
   * @throws Will throw an error if the callback is not a function.
   */
  on(event: SpaceEvents, callback: (data: any) => void) {

    if (typeof callback !== 'function') {
      throw new Error(`Callback for event '${event}' must be a function.`);
    }

    if (['synchronized', 'pricing_created', 'pricing_archived', 'pricing_actived', 'service_disabled', 'error'].indexOf(event) === -1) {
      throw new Error(`Event '${event}' is not recognized.`);
    }

    this.emitter.on(event, callback);
  }

  /**
   * Sets the user ID for the client and loads the pricing token for that user.
   * @param userId The user ID to set for the client.
   * @returns A promise that resolves when the user ID is set and the pricing token is generated.
   * @throws Will throw an error if the user ID is not a non-empty string.
   * @example
   * ```typescript
   * await spaceClient.setUserId('user123');
   * ```
   */
  async setUserId(userId: string): Promise<void> {
    if (typeof userId !== 'string' || userId.trim() === '') {
      throw new Error('User ID must be a non-empty string.');
    }
    this.userId = userId;
    await this.generateUserPricingToken();
  }

  /**
   * Performs a request to SPACE to retrieve a new pricing token for the user with the given userId.
   * @param userId The user ID for which to evaluate the feature.
   * @returns A promise that resolves to the pricing token.
   * @throws Will throw an error if the request fails.
   */
  async generateUserPricingToken(): Promise<string> {

    if (!this.userId) {
      throw new Error('User ID is not set. Please set the user ID with `setUserId(userId)` before trying to generate a pricing token.');
    }

    return this.axios.post(`/features/${this.userId}`)
      .then(response => {
        return response.data.pricingToken;
      })
      .catch(error => {
        console.error(`Error generating pricing token for user ${this.userId}:`, error);
        throw error;
      });
  }
}
