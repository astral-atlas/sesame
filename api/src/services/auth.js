// @flow strict
/*:: import type { HTTPHeaders } from '@lukekaalim/http-server'; */
/*:: import type { UserID, LoginGrant, Proof, IdentityProof, IdentityGrant } from '@astral-atlas/sesame-models'; */
/*:: import type { SesameData } from '@astral-atlas/sesame-data'; */
import { getAuthorization } from "@lukekaalim/http-server";
import { decodeProofToken } from "@astral-atlas/sesame-models";

/*::
export type AuthorityService = {
  assertIdentity: (headers: HTTPHeaders) => Promise<{ actor: UserID, proof: IdentityProof, grant: IdentityGrant }>,
  assertIdentityOrLogin: (headers: HTTPHeaders) => Promise<{ actor: UserID, proof: Proof, grant: IdentityGrant | LoginGrant }>,
};
*/

export const createAuthorityService = (data/*: SesameData*/)/*: AuthorityService*/ => {
  const assertIdentity = async (headers) => {
    throw new Error();
  };

  const assertIdentityOrLogin = async (headers) => {
    const authorization = getAuthorization(headers);
    if  (!authorization || authorization.type !== 'bearer')
      throw new Error();
    const proof = decodeProofToken(authorization.token);
    switch (proof.type) {
      case 'identity':
        const { result: identityGrant } = await data.grants.identity.get({ partition: proof.userId, sort: proof.grantId });
        if (!identityGrant)
          throw new Error();
        const { result: identitySecret } = await data.grants.secrets.get({ partition: proof.userId, sort: identityGrant.id });
        if (identitySecret !== proof.secret)
          throw new Error();

        return { actor: identityGrant.identity, grant: identityGrant, proof };
      case 'login':
        const { result: loginGrant } = await data.grants.login.get({ partition: proof.userId, sort: proof.grantId });
        if (!loginGrant)
          throw new Error();
        const { result: loginSecret } = await data.grants.secrets.get({ partition: proof.userId, sort: loginGrant.id });
        if (loginSecret !== proof.secret)
          throw new Error();
        
        return { actor: loginGrant.login, grant: loginGrant, proof };
    }
  };

  return {
    assertIdentity,
    assertIdentityOrLogin,
  }
};