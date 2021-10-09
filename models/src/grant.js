// @flow strict
/*:: import type { Cast, JSONValue } from '@lukekaalim/cast'; */
/*:: import type { ServiceID } from './services.js' */
/*:: import type { AdminID, UserID } from "./user.js"; */
import {
  createObjectCaster, createConstantCaster, castString, c,
  createConstantUnionCaster, createKeyedUnionCaster, createNullableCaster, castBoolean
} from '@lukekaalim/cast';
import { castUserId } from "./user.js";
import { castServiceId } from "./services.js";

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

export const castIdentityGrantId/*: Cast<IdentityGrantID>*/ = castString;
export const castLoginGrantId/*: Cast<LoginGrantID>*/ = castString;
export const castLinkGrantId/*: Cast<LinkGrantID>*/ = castString;
export const castServiceGrantId/*: Cast<ServiceGrantID>*/ = castString;

// An "Identity Grant" allows the bearer to act as if
// they had the contained identity
/*::
export type IdentityGrantID = string;
export type IdentityGrant = {|
  id: IdentityGrantID,
  loginGrantId: LoginGrantID,
  revoked: boolean,
  type: 'identity',
  // The Identity the possesser of this grant can assume
  identity: UserID,
  // The "name" of the intended possessor of this grant,
  // like a nickname of the device
  granteeName: string
|};
*/

export const castIdentityGrant/*: Cast<IdentityGrant>*/ = createObjectCaster({
  id: castIdentityGrantId,
  loginGrantId: castLoginGrantId,
  
  type: createConstantCaster('identity'),
  revoked: castBoolean,
  identity: castUserId,
  granteeName: castString
});

// A "Login Grant" allows the bearer to create an "Identity Grant"
// for themselves at an identity service
/*::
export type LoginGrantID = string;
export type LoginGrant = {|
  id: LoginGrantID,
  createdBy: ?IdentityGrantID,
  type: 'login',
  login: UserID,
  revoked: boolean,
  createdIdentity: ?IdentityGrantID
|};
*/
export const castLoginGrant/*: Cast<LoginGrant>*/ = createObjectCaster({
  type: createConstantCaster('login'),
  id: castLoginGrantId,
  createdBy: createNullableCaster(castIdentityGrantId),
  login: castUserId,
  revoked: castBoolean,
  createdIdentity: createNullableCaster(castIdentityGrantId)
});

// A "link grant" is a grant provided to a third party website
/*::
export type LinkGrantID = string;
export type LinkGrant = {
  type: 'link',
  id: LinkGrantID,
  identity: UserID,
  linkedIdentity: IdentityGrantID,
  target: string,
  revoked: boolean,
};
*/
export const castLinkGrant/*: Cast<LinkGrant>*/ = createObjectCaster({
  type: createConstantCaster('link'),
  id: castLinkGrantId,
  identity: castUserId,
  // The origin of the service grant is intended owned
  linkedIdentity: castIdentityGrantId,
  target: castString,
  revoked: castBoolean,
});

/*::
export type ServiceGrantID = string;
export type ServiceGrant = {
  type: 'service',
  id: ServiceGrantID,
  serviceId: ServiceID,
}
*/
export const castServiceGrant/*: Cast<ServiceGrant>*/ = createObjectCaster({
  type: createConstantCaster('service'),
  id: castServiceGrantId,
  serviceId: castServiceId,
});