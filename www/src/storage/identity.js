// @flow strict
/*:: import type { IdentityProof } from '@astral-atlas/sesame-models'; */
/*:: import type { StoredValue } from '../lib/storage.js'; */
import { createStoredValue } from "../lib/storage.js";
import { castIdentityProof } from '@astral-atlas/sesame-models';
import { createObjectCaster as object, castString as string, createNullableCaster as maybe } from '@lukekaalim/cast';

export const identityStore/*: StoredValue<?{ proof: IdentityProof }>*/ = createStoredValue(
  'sesame_identity',
  maybe(object({ proof: castIdentityProof })),
  null
);