// @flow strict
/*:: import type { UserID, User } from '@astral-atlas/sesame-models'; */
/*:: import type { Table } from './table.js'; */
import { v4 as uuid } from 'uuid';

/*::
export type UserTable = Table<UserID, User>;

export type UserService = {
  getByID: (userId: UserID) => Promise<User>,
  create: (name: string) => Promise<User>, 
};
*/

export const createUserService = (table/*: UserTable*/)/*: UserService*/ => {
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

  return {
    create,
    getByID,
  }
}