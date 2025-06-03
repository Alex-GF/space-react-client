import React, { createContext, useMemo } from "react";
import { SpaceClientContext, SpaceConfiguration } from "@/types";
import { SpaceClient as SpaceClientClass } from "../clients/SpaceClient";
import { TokenService } from "@/services/token";

// Context provides the SpaceClient instance
export const SpaceContext = createContext<SpaceClientContext | undefined>(undefined);

/**
 * SpaceProvider initializes and provides the SpaceClient instance to children.
 */
export const SpaceProvider: React.FC<{ config: SpaceConfiguration; children: React.ReactNode }> = ({
  config,
  children,
}) => {
  // Memorize the client to avoid unnecessary re-instantiation
  const context = useMemo(() => {
    return {
      client: config.allowConnectionWithSpace ? new SpaceClientClass(config) : undefined,
      tokenService: new TokenService(),
    };
  }, [config.url, config.apiKey]);

  return <SpaceContext.Provider value={context}>{children}</SpaceContext.Provider>;
};
