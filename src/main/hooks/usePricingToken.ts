import { useContext } from 'react';
import { SpaceContext } from '../contexts/SpaceContext';

/**
 * Custom hook to access the SpaceClient instance from context.
 * Throws an error if used outside of SpaceProvider.
 */
export function usePricingToken() {
  const spaceClient = useContext(SpaceContext);
  if (!spaceClient) {
    throw new Error('useSpaceClient must be used within a SpaceProvider');
  }
  return spaceClient.tokenService;
}
