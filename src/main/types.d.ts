export type SpaceEvents =
  | 'synchronized'
  | 'pricing_created'
  | 'pricing_archived'
  | 'pricing_actived'
  | 'service_disabled'
  | 'error';

export interface SpaceConfiguration {
  url: string;
  apiKey: string;
}

export * from './types/Events';