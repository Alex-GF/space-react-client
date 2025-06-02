import { useContext } from 'react';
import { SpaceContext } from '../contexts/SpaceContext';

/**
 * Custom hook to access the SpaceClient instance from context.
 * Throws an error if used outside of SpaceProvider.
 */
export function useSpaceClient() {
  const client = useContext(SpaceContext);
  if (!client) {
    throw new Error('useSpaceClient must be used within a SpaceProvider');
  }
  return client;
}
