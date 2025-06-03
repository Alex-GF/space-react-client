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
  children,
}: { config: SpaceConfiguration, children: React.ReactNode }): JSX.Element => {
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

  return <SpaceContext.Provider value={context}>{children}</SpaceContext.Provider>;
};
