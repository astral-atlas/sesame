// @flow strict
/*:: import type { UserID, User } from '@astral-atlas/sesame-models'; */
/*:: import type { Table } from './table.js'; */
/*:: import type { Authority, AuthorityService } from "./auth.js"; */
import { v4 as uuid } from 'uuid';

/*::
export type UserTable = Table<UserID, User>;

export type UserService = {
  getByID: (userId: UserID) => Promise<User>,
  create: (name: string) => Promise<User>, 
  update: (userId: UserID, values: { name: string }, authorizer: Authority) => Promise<User>, 
};
*/

export const createUserService = (auth/*: AuthorityService*/, table/*: UserTable*/)/*: UserService*/ => {
  const getByID = async (userId) => {
    const { result: user } = await table.get(userId);
    if (!user)
      throw new Error(`User does not exist`);
    return user;
  };
  const create = async (name) => {
    const newUser = {
      id: uuid(),
      name,
      adminId: null,
      creatorAdminId: null,
    };
    await table.set(newUser.id, newUser);
    return newUser;
  };
  const update = async (userId, { name }, authorizer) => {
    if (authorizer.type !== 'identity')
      throw new Error();
    if (authorizer.grant.identity !== userId) {
      const { admin } = await auth.getUserDetails(authorizer);
      if (!admin)
        throw new Error();
    }

    const { result: prevUser } = await table.get(userId);
    if (!prevUser)
      throw new Error(`User does not exist`);
    const nextUser = {
      ...prevUser,
      name,
    };
    await table.set(nextUser.id, nextUser);
    return nextUser;
  };

  return {
    create,
    getByID,
    update,
  }
}