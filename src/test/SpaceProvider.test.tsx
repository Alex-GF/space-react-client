import { describe, it, expect } from 'vitest';
import { SpaceProvider, useSpaceClient } from '@/index';
import { render } from '@testing-library/react';

function DummyConsumer() {
  // This hook should throw if client is undefined
  useSpaceClient();
  return <div>Should not render</div>;
}

describe('SpaceProvider with allowConnectionWithSpace = false', () => {
  it('should provide undefined client when allowConnectionWithSpace is false', () => {
    const config = {
      url: 'http://localhost',
      apiKey: 'test',
      allowConnectionWithSpace: false,
    };
    // The consumer should throw an error because client is undefined
    expect(() => {
      render(
        <SpaceProvider config={config}>
          <DummyConsumer />
        </SpaceProvider>
      );
    }).toThrowError(/SpaceClient is not initialized/);
  });
});
