function parseJwt(token: string) {
  return JSON.parse(atob(token.split('.')[1]));
}

/**
 * Checks if the current pricing token is expired based on the 'exp' claim.
 * @returns True if the token is expired or not set, false otherwise.
 */
function isTokenExpired(tokenPayload: Record<string, any>): boolean {
  if (typeof tokenPayload.exp !== 'number') {
    return true;
  }
  // 'exp' is in seconds since epoch
  const now = Math.floor(Date.now() / 1000);
  return now >= tokenPayload.exp;
}

export class TokenService {
  private tokenPayload: Record<string, any> | null = null;

  /**
   * Retrieves the stored pricing token's payload.
   * @returns The stored pricing token payload.
   */
  getPricingToken() {
    if (!this._validToken()) {
      return null;
    }

    return this.tokenPayload;
  }

  /**
   * Retrieves an attribute from the stored pricing token payload and returns it.
   * @param key - A key of the stored pricing token whose is going to be retrieved.
   * @return The value of the key in the stored pricing token payload.
   */
  getFromToken(key: string) {
    if (!this._validToken()) {
      return null;
    }

    return this.tokenPayload![key];
  }

  /**
   * Updates the stored pricing token with the payload of a new one.
   * @param token - Pricing token string
   */
  updatePricingToken(token: string): void {
    const parsedToken = parseJwt(token);

    this.tokenPayload = parsedToken;
  }

  evaluateFeature(featureId: string): boolean | null {
    if (!this._validToken()) {
      return false;
    }

    // Check if the feature exists in the token payload
    if (this.tokenPayload?.features?.[featureId]) {
      return this.tokenPayload!.features[featureId].eval;
    } else {
      console.warn(`Feature '${featureId}' not found in token payload.`);
      return null;
    }
  }

  private _validToken(): boolean {
    if (!this.tokenPayload) {
      console.warn('Token payload is not set. Please call updateLocalPricingToken first.');
      return false;
    }

    if (isTokenExpired(this.tokenPayload)) {
      console.warn('Pricing token is expired. Please update it the pricing token.');
      return false;
    }

    return true;
  }
}
