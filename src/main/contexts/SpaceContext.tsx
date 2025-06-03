import React, { createContext, JSX, useMemo } from "react";
import { SpaceClientContext, SpaceConfiguration } from "@/types";
import { SpaceClient as SpaceClientClass } from "../clients/SpaceClient";
import { TokenService } from "@/services/token";

// Context provides the SpaceClient instance
export const SpaceContext = createContext<SpaceClientContext | undefined>(undefined);

/**
 * SpaceProvider initializes and provides the SpaceClient instance to children.
 */
export const SpaceProvider = ({
  config,
  loader,
  children,
}: { config: SpaceConfiguration; loader?: React.ReactNode, children: React.ReactNode }): JSX.Element => {
  // Memorize the client to avoid unnecessary re-instantiation
  const context = useMemo(() => {

    const client = config.allowConnectionWithSpace ? new SpaceClientClass(config) : undefined;
    let tokenService: TokenService | undefined;
    if (!client) {
      tokenService = new TokenService();
    }else{
      tokenService = client.tokenService;
    }

    return {
      client: client,
      tokenService: tokenService,
    };
  }, [config.url, config.apiKey]);

  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    if (!context.client) {
      setConnected(true); // No connection needed if client is undefined
      return;
    }
    const handleSync = () => setConnected(true);
    context.client.on('synchronized', handleSync);
  }, [context.client]);

  if (!connected) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%' }}>
      {loader ?? (
        <div style={{
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #1976d2',
          borderRadius: '50%',
          width: 48,
          height: 48,
          animation: 'spin 1s linear infinite',
        }}
        />
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return <SpaceContext.Provider value={context}>{children}</SpaceContext.Provider>;
};
