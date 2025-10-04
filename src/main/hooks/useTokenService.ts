import { useContext } from 'react';
import { SpaceContext } from '../contexts/SpaceContext';

/**
 * Custom hook to access the service that manages the pricing token.
 * Throws an error if used outside of SpaceProvider.
 */
export function useTokenService() {
  const spaceContext = useContext(SpaceContext);
  if (!spaceContext) {
    throw new Error('useTokenService must be used within a SpaceProvider');
  }
  return spaceContext.tokenService;
}
