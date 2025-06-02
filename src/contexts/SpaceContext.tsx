import React, { createContext, useEffect, useState } from "react";
import { SpaceConfiguration, SpaceEvents } from "@/types";

export interface SpaceContextType {
  httpUrl: string;
  userApiKey: string;
  on: (eventKey: SpaceEvents, callback: (data: any) => void) => void;
}

export const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export const SpaceClient: React.FC<{ config: SpaceConfiguration, children: React.ReactNode }> = ({
  config,
  children,
}) => {

  const [httpUrl, setHttpUrl] = useState<string>("");
  const [userApiKey, setUserApiKey] = useState<string>("");

  useEffect(() => {
    if (!config.url) {
      console.error("SpaceClient: 'url' is required.");
      return;
    } else if (!config.apiKey) {
      console.error("SpaceClient: 'apiKey' is required.");
      return;
    }

    setHttpUrl(config.url.endsWith('/') ? config.url.slice(0, -1) + '/api/v1' : config.url + '/api/v1');
    setUserApiKey(config.apiKey);
  }, [config]);

  return (
    <SpaceContext.Provider value={{ httpUrl, userApiKey, on: (eventKey, callback) => {} }}>
      {children}
    </SpaceContext.Provider>
  );
};
