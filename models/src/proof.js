// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { UserID } from './user.js'; */
/*:: import type { ServiceID } from './services.js'; */
/*:: import type {
  LoginGrantID, LoginGrant,
  IdentityGrantID, IdentityGrant,
  LinkGrantID, LinkGrant,
  ServiceGrantID, ServiceGrant,
} from './grant.js'; */

import { createObjectCaster, createConstantCaster, createKeyedUnionCaster, castString } from '@lukekaalim/cast';
import { castIdentityGrantId } from './grant.js';
import { castUserId } from './user.js';
import { castServiceId } from "./services.js";

/*
## Proofs
  Proofs are short objects that indicate that the user
  should have the same permissions as it's equivelant grant.
*/

export const PROOF_TYPE_IDS = {
  login: 0,
  identity: 1,
  link: 2,
  service: 3,
};
/*::
export type Proof =
  | LoginProof
  | IdentityProof
  | LinkProof
  | ServiceProof

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

export type LinkProof = {|
  type: 'link',
  grantId: LinkGrantID,
  userId: UserID,
  secret: string,
|};

export type ServiceProof = {|
  type: 'service',
  serviceId: ServiceID,
  grantId: ServiceGrantID,
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
export const createLinkProof = (linkGrant/*: LinkGrant*/, secret/*: string*/)/*: LinkProof*/ => {
  return {
    type: 'link',
    grantId: linkGrant.id,
    userId: linkGrant.identity,
    secret,
  };
}
export const createServiceProof = (serviceGrant/*: ServiceGrant*/, secret/*: string*/)/*: ServiceProof*/ => {
  return {
    type: 'service',
    grantId: serviceGrant.id,
    serviceId: serviceGrant.serviceId,
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
export const castLinkProof/*: Cast<LinkProof>*/ = createObjectCaster({
  type: createConstantCaster('link'),
  grantId: castIdentityGrantId,
  userId: castUserId,
  secret: castString,
});
export const castServiceProof/*: Cast<ServiceProof>*/ = createObjectCaster({
  type: createConstantCaster('service'),
  grantId: castIdentityGrantId,
  serviceId: castServiceId,
  secret: castString,
});
export const castProof/*:Cast<Proof>*/ = createKeyedUnionCaster('type', {
  'login': castLoginProof,
  'identity': castIdentityProof,
  'link': castLinkProof,
  'service': castServiceProof,
});

/*::
export type TokenPrelude =
  | 'base64.1'
  | 'json.1'
*/

export const encodeProofToken = (proof/*: Proof*/)/*: string*/ => {
  return JSON.stringify(proof);
};
export const decodeProofToken = (token/*: string*/)/*: Proof*/ => {
  return castProof(JSON.parse(token));
};
