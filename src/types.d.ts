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
  onSynchronized?: (data: any) => void;
  onPricingCreated?: (data: any) => void;
  onPricingActivated?: (data: any) => void;
  onPricingArchived?: (data: any) => void;
  onServiceDisabled?: (data: any) => void;
  onError?: (error: any) => void;
}
