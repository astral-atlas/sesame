// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { WWWConfig, Proof } from '@astral-atlas/sesame-models'; */
/*:: import type { SesameClient } from '@astral-atlas/sesame-client'; */
import { h, createContext, useContext, useMemo } from '@lukekaalim/act';
import { createWebClient } from '@lukekaalim/http-client';
import { createClient } from '@astral-atlas/sesame-client';

const apiContext = createContext(null);

export const APIProvider/*: Component<{ config: WWWConfig, proof: ?Proof }>*/ = ({ config, proof, children }) => {
  const apiClient = useMemo(() => {
    const httpClient = createWebClient(fetch);
    const apiClient = createClient(new URL(config.api.sesame.origin), httpClient, proof);
    return apiClient;
  }, [config.api.sesame.origin, proof && proof.grantId]);

  return h(apiContext.Provider, { value: apiClient }, children);
};

export const useAPI = ()/*: SesameClient*/ => {
  const client = useContext(apiContext);
  if (!client)
    throw new Error(`Attempting to use Client without client provider`);
  return client;
};