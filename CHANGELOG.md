# Changelog

## 0.4.0 - 2026-11-04

- Integrate the subscription-change API, contract event notifications and subscription token types.
- Read multiorganization token claims without interpreting the subject as a user ID.
- Deduplicate events and expose reconnection resynchronization.
- Verify ES256 tokens with SPACE's public JWKS and typed errors.
- Expose subscription hooks and preserve base64url/UTF-8 token claims.
- Keep token verification in the optional `/verify` entry point.
