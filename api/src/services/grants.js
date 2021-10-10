// @flow strict
/*:: import type { UserID, IdentityGrantID, IdentityGrant, LoginGrant, LinkGrant, LinkGrantID } from '@astral-atlas/sesame-models'; */
/*:: import type { SesameData } from '@astral-atlas/sesame-data'; */
/*:: import type { Authority, AuthorityService } from './auth'; */
import { v4 as uuid } from 'uuid';
import generateString from 'crypto-random-string';

/*::
export type GrantService = {
  createIdentity(identity: UserID, granteeName: string,  authorizer: Authority): Promise<{ grant: IdentityGrant, secret: string }>,
  createLogin(identity: UserID,  authorizer: Authority): Promise<{ grant: LoginGrant, secret: string }>,
  createLink(target: string, authorizer: Authority): Promise<{ grant: LinkGrant, secret: string }>,

  revokeIdentity(userId: UserID, grantId: IdentityGrantID, authorizer: Authority): Promise<void>,
};
*/

export const createGrantService = (data/*: SesameData*/, auth/*: AuthorityService*/)/*: GrantService*/ => {
  const createIdentity = async (identityUserId, granteeName, authorizer) => {
    if (authorizer.type !== 'login')
      throw new Error(`Only login tokens can be used to create identities`);

    if (authorizer.grant.login !== identityUserId)
      throw new Error(`The identity you want is not the identity you have permission to create`);

    const grant = {
      type: 'identity',
      id: uuid(),
      identity: identityUserId,
      loginGrantId: authorizer.grant.id,
      revoked: false,
      granteeName,
    };
    const updatedLoginGrant = {
      ...authorizer.grant,
      createdIdentity: grant.id,
    };
    const secret = generateString({ length: 32 });
    await Promise.all([
      await data.grants.identity.set(identityUserId, grant.id , grant),
      await data.grants.login.set(identityUserId, updatedLoginGrant.id , updatedLoginGrant),
      await data.secrets.set(grant.id, secret)
    ]);
    return { grant, secret };
  };
  const createLogin = async (identity, authorizer) => {
    if (authorizer.type !== 'identity')
      throw new Error(`Only identity tokens can be used to create logins`);

    if (authorizer.grant.identity !== identity) {
      const { admin } = await auth.getUserDetails(authorizer);
      if (!admin)
        throw new Error(`Only administrators can create login tokens for other users`);
    }

    const grant/*: LoginGrant*/ = {
      type: 'login',
      id: uuid(),
      createdBy: authorizer.grant.identity,
      createdIdentity: null,

      login: identity,
      revoked: false,
    };
    const secret = generateString({ length: 32 });
    await Promise.all([
      await data.grants.login.set(identity, grant.id , grant),
      await data.secrets.set(grant.id, secret)
    ]);
    return { grant, secret };
  }
  const createLink = async (target, authorizer) => {
    if (authorizer.type !== 'identity')
      throw new Error(`Only the user can create identity links`);
      
    const grant = {
      id: uuid(),
      type: 'link',
      identity: authorizer.grant.identity,
      target,
      linkedIdentity: authorizer.grant.id,
      revoked: false,
    }
    const secret =  generateString({ length: 32 });
    await Promise.all([
      data.grants.link.set(authorizer.grant.identity, grant.id, grant),
      data.secrets.set(grant.id, secret)
    ]);
    return { grant, secret };
  }

  const revokeIdentity = async (userId, grantId, authorizer) => {
    if (authorizer.type !== 'identity')
      throw new Error(`Only identity tokens can be used to revoke identities`);

    if (authorizer.grant.identity !== userId)
      throw new Error(`You can only revoke grant IDs you own`);

    await data.grants.identity.set(userId, grantId, null);
    await data.secrets.set(grantId, null);
  }

  return {
    createIdentity,
    createLink,
    createLogin,
    revokeIdentity,
  };
};
