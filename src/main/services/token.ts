function parseJwt(token: string) {
  return JSON.parse(decodeURIComponent(token.split(".")[1]));
}

export class TokenService {
  private tokenPayload: Record<string, any> | null = null;

  constructor() {}

  /**
   * Retrieves the stored pricing token's payload.
   * @returns The stored pricing token payload.
   */
  getPricingToken() {
    return this.tokenPayload;
  }

  /**
   * Retrieves an attribute from the stored pricing token payload and returns it.
   * @param key - A key of the stored pricing token whose is going to be retrieved.
   * @return The value of the key in the stored pricing token payload.
   */
  getFromToken(key: string) {
    if (this.tokenPayload) {
      return this.tokenPayload[key];
    } else {
      console.warn(
        "Token payload is not set. Please call updateLocalPricingToken first."
      );
      return null;
    }
  }

  /**
   * Updates the stored pricing token with the payload of a new one.
   * @param token - Pricing token string
   */
  updatePricingToken(token: string): void {
    const parsedToken = parseJwt(token);

    this.tokenPayload = parsedToken;
  }

  evaluateFeature(featureId: string): boolean {
    if (!this.tokenPayload) {
      console.warn("Token payload is not set. Please call updateLocalPricingToken to configure a pricing token first.");
      return false;
    }

    // Check if the feature exists in the token payload
    if (this.tokenPayload.features && this.tokenPayload.features[featureId]) {
      return this.tokenPayload.features[featureId].eval;
    } else {
      console.warn(`Feature '${featureId}' not found in token payload.`);
      return false;
    }
  }
}
