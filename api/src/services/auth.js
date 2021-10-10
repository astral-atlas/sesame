// @flow strict
/*:: import type { HTTPHeaders } from '@lukekaalim/net-description'; */
/*:: import type {
  UserID, LoginGrant, Proof, LoginProof,
  ServiceProof, ServiceID, ServiceGrant,
  IdentityProof, IdentityGrant,
  LinkProof, LinkGrant,
  Admin, User
} from '@astral-atlas/sesame-models'; */
/*:: import type { SesameData } from '@astral-atlas/sesame-data'; */
import { getAuthorization } from "@lukekaalim/http-server";
import { decodeProofToken } from "@astral-atlas/sesame-models";

/*::
export type Authority =
  | { type: 'login', grant: LoginGrant, proof: LoginProof }
  | { type: 'identity', grant: IdentityGrant, proof: IdentityProof }
  | { type: 'service', grant: ServiceGrant, proof: ServiceProof }
  | { type: 'guest' }

export type AuthorityService = {
  getAuth: (headers: HTTPHeaders) => Promise<Authority>,
  validateLink: (proof: LinkProof) => Promise<{ grant: LinkGrant, linkedGrant: IdentityGrant }>,
  getUserDetails: (auth: Authority) => Promise<{ user: ?User, admin: ?Admin }>
};
*/

export const createAuthorityService = (data/*: SesameData*/)/*: AuthorityService*/ => {
  const getProof = (headers) => {
    const authorization = getAuthorization(headers);
    if  (!authorization || authorization.type !== 'bearer')
      return null;
    const proof = decodeProofToken(authorization.token);
    return proof;
  };
  const validateIdentity = async (proof) => {
    const { result: grant } = await data.grants.identity.get(proof.userId, proof.grantId);
    const { result: secret } = await data.secrets.get(proof.grantId);
    if (!secret || secret !== proof.secret)
      throw new Error(`Invalid Secret`);
    if (!grant || grant.revoked)
      throw new Error(`Revoked or invalid grant`);
    return { type: 'identity', grant, proof };
  };
  const validateLogin = async (proof) => {
    const { result: grant } = await data.grants.login.get(proof.userId, proof.grantId);
    const { result: secret } = await data.secrets.get(proof.grantId);
    if (!secret || secret !== proof.secret)
      throw new Error(`Invalid Secret`);
    if (!grant || grant.revoked)
      throw new Error(`Revoked or invalid grant`);
    return { type: 'login', grant, proof };
  };
  const validateService = async (proof) => {
    const { result: grant } = await data.grants.service.get(proof.serviceId, proof.grantId);
    const { result: secret } = await data.secrets.get(proof.grantId);
    if (!secret || secret !== proof.secret)
      throw new Error(`Invalid Secret`);
    if (!grant)
      throw new Error(`Revoked or invalid grant`);
    return { type: 'service', grant, proof };
  }

  const getAuth = async (headers) => {
    const proof = getProof(headers);
    if (!proof)
      return { type: 'guest' };
    switch (proof.type) {
      case 'link':
        throw new Error(`Link identity has no authority for sesame`);
      case 'identity':
        return validateIdentity(proof);
      case 'login':
        return validateLogin(proof);
      case 'service':
        return validateService(proof);
    }
  };

  const validateLink = async (proof) => {
    const { result: grant } = await data.grants.link.get(proof.userId, proof.grantId);
    const { result: secret } = await data.secrets.get(proof.grantId);
    if (secret == null || secret !== proof.secret)
      throw new Error(`Secret does not match!`);
    if (!grant || grant.revoked)
      throw new Error(`Revoked or invalid grant`);
    const { result: linkedGrant } = await data.grants.identity.get(proof.userId, grant.linkedIdentity);
    if (!linkedGrant || linkedGrant.revoked)
      throw new Error(`Revoked or invalid grant`);
    return { grant, linkedGrant };
  }

  const getUserDetails = async (authority) => {
    switch (authority.type) {
      case 'guest':
      case 'service':
      case 'login':
      default:
        return { user: null, admin: null };
      case 'identity':
        const { result: identityUser } = await data.users.get(authority.grant.identity);
        const { result: identityAdmin } = identityUser && identityUser.adminId ? await data.admins.get(identityUser.adminId) : { result: null };
        return { user: identityUser, admin: identityAdmin };
    }
  };

  return {
    getAuth,
    getUserDetails,
    validateLink,
  }
};