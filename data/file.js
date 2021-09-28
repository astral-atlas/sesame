// @flow strict
/*:: import type { User } from '@astral-atlas/sesame-models'; */
/*:: import type { SesameData } from './entry.js'; */
import { castUser, castIdentityGrantId, castIdentityGrant, castLoginGrantID, castLoginGrant } from '@astral-atlas/sesame-models';
import { createArrayCaster, createTupleCaster, castString } from '@lukekaalim/cast';
import { join, resolve } from 'path';
import * as fsc from 'fs';
import { createFileTable, createCompositeKeyTable } from './table.js';
const { mkdir } = fsc.promises;


export const createFileSesameData = async (dataDirectory/*: string*/ = './data')/*: Promise<{ data: SesameData, files: string[] }>*/ => {
  console.log(`Using File Data from ${resolve(dataDirectory)}`);
  await mkdir(dataDirectory, { recursive: true })


  const usersPath = resolve(dataDirectory, './users.json');
  console.log(`Loading ${usersPath}`)
  const users = await createFileTable(usersPath, castUser);

  const identityPath = resolve(dataDirectory, './identity.json');
  console.log(`Loading ${identityPath}`)
  const identity = createCompositeKeyTable(await createFileTable(identityPath, createArrayCaster(createTupleCaster([
    castIdentityGrantId,
    castIdentityGrant,
  ]))));

  const loginPath = resolve(dataDirectory, './login.json');
  console.log(`Loading ${loginPath}`)
  const login = createCompositeKeyTable(await createFileTable(loginPath, createArrayCaster(createTupleCaster([
    castLoginGrantID,
    castLoginGrant,
  ]))));
  const secretsPath = resolve(dataDirectory, './secrets.json');
  console.log(`Loading ${secretsPath}`)
  const secrets = createCompositeKeyTable(await createFileTable(secretsPath, createArrayCaster(createTupleCaster([
    castString,
    castString,
  ]))));

  const files = [
    usersPath,
    identityPath,
    loginPath,
    secretsPath,
  ]

  const data = {
    users,
    grants: {
      identity,
      secrets,
      login,
    }
  }

  return {
    data,
    files,
  };
};
