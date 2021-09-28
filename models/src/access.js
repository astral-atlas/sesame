// @flow strict
/*:: import type { UserID } from './user'; */
/*:: import type { Cast, JSONValue } from '@lukekaalim/cast'; */
import { createObjectCaster, createConstantCaster, castString, createConstantUnionCaster, createKeyedUnionCaster } from '@lukekaalim/cast';
import { castUserId } from "./user.js";

/*::
// Describe in total a user's access
// (but no secrets!)
export type AccessDescription = {
  user: UserID,
  grants: {
    identity: IdentityGrant[],
    login: LoginGrant[]
  }
};
*/

/*::
// An identifier for something that should possess this grant
export type GrantTarget =
  | { type: 'origin', origin: string }
*/
export const castGrantTarget/*: Cast<GrantTarget>*/ = createObjectCaster({
  type: createConstantCaster('origin'),
  origin: castString,
});

// An "Identity Grant" allows the bearer to act as if
// they had the contained identity for a specific service
/*::
export type IdentityGrantID = string;
export type IdentityGrant = {|
  id: IdentityGrantID,
  type: 'identity',
  // The Identity the possesser of this grant can assume
  identity: UserID,
  // The origin of the service grant is intended owned
  target: string,
  // The "name" of the intended possessor of this grant,
  // like a nickname of the device
  granteeName: string
|};
*/

export const castIdentityGrantId/*: Cast<IdentityGrantID>*/ = castString;
export const castIdentityGrant/*: Cast<IdentityGrant>*/ = createObjectCaster({
  id: castIdentityGrantId,
  type: createConstantCaster('identity'),
  identity: castUserId,
  target: castString,
  granteeName: castString
});

// A "Login Grant" allows the bearer to create an "Identity Grant"
// for themselves at an identity service
/*::
export type LoginGrantID = string;
export type LoginGrant = {|
  id: LoginGrantID,
  type: 'login',
  login: UserID,
|};
*/
export const castLoginGrantID/*: Cast<LoginGrantID>*/ = castString;
export const castLoginGrant/*: Cast<LoginGrant>*/ = createObjectCaster({
  id: castLoginGrantID,
  type: createConstantCaster('login'),
  login: castUserId,
});

/*
## Proofs
  Proofs are short objects that indicate that the user
  should have the same permissions as it's equivelant grant.
*/

export const PROOF_TYPE_IDS = {
  login: 0,
  identity: 1,
};
/*::
export type Proof =
  | LoginProof
  | IdentityProof

export type LoginProof = {|
  type: 'login',
  grantId: LoginGrantID,
  userId: UserID,
  secret: string,
|};

export type IdentityProof = {|
  type: 'identity',
  grantId: IdentityGrantID,
  userId: UserID,
  secret: string,
|};
*/

export const createIdentityProof = (identityGrant/*: IdentityGrant*/, secret/*: string*/)/*: IdentityProof*/ => {
  return {
    type: 'identity',
    grantId: identityGrant.id,
    userId: identityGrant.identity,
    secret,
  };
}
export const createLoginProof = (loginGrant/*: LoginGrant*/, secret/*: string*/)/*: LoginProof*/ => {
  return {
    type: 'login',
    grantId: loginGrant.id,
    userId: loginGrant.login,
    secret,
  };
}

export const castLoginProof/*: Cast<LoginProof>*/ = createObjectCaster({
  type: createConstantCaster('login'),
  grantId: castIdentityGrantId,
  userId: castUserId,
  secret: castString,
});
export const castIdentityProof/*: Cast<IdentityProof>*/ = createObjectCaster({
  type: createConstantCaster('identity'),
  grantId: castIdentityGrantId,
  userId: castUserId,
  secret: castString,
});
export const castProof/*:Cast<Proof>*/ = createKeyedUnionCaster('type', {
  'login': castLoginProof,
  'identity': castIdentityProof,
});

export const encodeProofToken = (proof/*: Proof*/)/*: string*/ => {
  return JSON.stringify(proof);
};
export const decodeProofToken = (token/*: string*/)/*: Proof*/ => {
  return castProof(JSON.parse(token));
};