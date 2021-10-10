// @flow strict
/*:: import type { Component, Context } from '@lukekaalim/act'; */
/*:: import type { WWWConfig, Proof } from '@astral-atlas/sesame-models'; */
/*:: import type { SesameClient } from '@astral-atlas/sesame-client'; */
import { h, createContext, useContext } from '@lukekaalim/act';

export const configContext/*: Context<?WWWConfig>*/ = createContext(null);

export const useConfig = ()/*: WWWConfig*/ => {
  const config = useContext(configContext);
  if (!config)
    throw new Error(`Attempting to use config without config provider`);
  return config;
};