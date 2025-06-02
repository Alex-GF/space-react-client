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
  // Memoize the client to avoid unnecessary re-instantiation
  const client = useMemo(() => new SpaceClientClass(config), [config.url, config.apiKey]);
  const tokenService = new TokenService();

  return <SpaceContext.Provider value={{client, tokenService}}>{children}</SpaceContext.Provider>;
};
