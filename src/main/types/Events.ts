export interface EventMessage {
  code: string;
  details: {
    serviceName: string;
    pricingVersion?: string;
  };
}
