// @flow strict
/*:: import type { UserID, IdentityGrantID, IdentityGrant, LoginGrant } from '@astral-atlas/sesame-models'; */
/*:: import type { SesameData } from '@astral-atlas/sesame-data'; */
import { v4 as uuid } from 'uuid';
import generateString from 'crypto-random-string';

/*::
export type GrantService = {
  createIdentity(identity: UserID, target: string, granteeName: string, actor: UserID): Promise<{ grant: IdentityGrant, secret: string }>,
  createLogin(identity: UserID, actor: UserID): Promise<{ grant: LoginGrant, secret: string }>,
};
*/

export const createGrantService = (data/*: SesameData*/)/*: GrantService*/ => {
  const createIdentity = async (whoIWantAnIdentityFor, target, granteeName, whoIAm) => {
    if (whoIWantAnIdentityFor != whoIAm)
      throw new Error();

    const grant = {
      type: 'identity',
      id: uuid(),
      identity: whoIWantAnIdentityFor,
      granteeName,
      target,
    };
    const secret = generateString({ length: 32 });
    await Promise.all([
      await data.grants.identity.set({ partition: whoIWantAnIdentityFor, sort: grant.id }, grant),
      await data.grants.secrets.set({ partition: whoIWantAnIdentityFor, sort: grant.id }, secret)
    ]);
    return { grant, secret };
  };
  const createLogin = async () => {
    throw new Error();
  }

  return {
    createIdentity,
    createLogin,
  };
};