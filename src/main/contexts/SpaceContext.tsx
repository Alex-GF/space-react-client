import React, { createContext, useMemo } from "react";
import { SpaceConfiguration } from "@/main/types";
import { SpaceClient as SpaceClientClass } from "../clients/SpaceClient";

// Context provides the SpaceClient instance
export const SpaceContext = createContext<SpaceClientClass | undefined>(undefined);

/**
 * SpaceProvider initializes and provides the SpaceClient instance to children.
 */
export const SpaceProvider: React.FC<{ config: SpaceConfiguration; children: React.ReactNode }> = ({
  config,
  children,
}) => {
  // Memoize the client to avoid unnecessary re-instantiation
  const client = useMemo(() => new SpaceClientClass(config), [config.url, config.apiKey]);

  return <SpaceContext.Provider value={client}>{children}</SpaceContext.Provider>;
};
