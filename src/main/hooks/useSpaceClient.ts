import { useContext } from 'react';
import { SpaceContext } from '../contexts/SpaceContext';

/**
 * Custom hook to access the SpaceClient instance from context.
 * Throws an error if used outside of SpaceProvider.
 */
export function useSpaceClient() {
  const spaceContext = useContext(SpaceContext);
  if (!spaceContext) {
    throw new Error('useSpaceClient must be used within a SpaceProvider');
  }

  if (!spaceContext.client) {
    throw new Error(
      `SpaceClient is not initialized, so it cannot be instanciated. 
      If you want to allow direct connection with the SPACE instance, 
      ensure that you configuration has allowConnectionWithSpace = true, 
      and url and apiKey provided.`,
    );
  }

  return spaceContext.client;
}
