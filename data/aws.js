// @flow strict
/*:: import type { SesameData } from './entry.js'; */
import { createArrayCaster, createTupleCaster, castString } from "@lukekaalim/cast";
import { castUser, castIdentityGrantId, castIdentityGrant, castLoginGrant, castLoginGrantID } from "@astral-atlas/sesame-models";
import { createAWSS3Table, createCompositeKeyTable, createMemoryTable } from "./table.js";
import { S3 } from '@aws-sdk/client-s3';

import { join } from "path";

export const createAWSS3SesameData = (
  s3/*: S3*/,
  bucket/*: string*/,
  keyPrefix/*: string*/ = 'sesame'
)/*: { data: SesameData, keys: { [string]: string } }*/ => {
  const keys = {
    users: join(keyPrefix,    'users.json'),
    identity: join(keyPrefix, 'identity.json'),
    login: join(keyPrefix,    'login.json'),
    secrets: join(keyPrefix,  'secrets.json'),
  };
  
  const users = createAWSS3Table(s3, bucket, keys.users, castUser);
  const identity = createCompositeKeyTable(createAWSS3Table(s3, bucket, keys.identity, createArrayCaster(createTupleCaster([
    castIdentityGrantId,
    castIdentityGrant,
  ]))));
  const login = createCompositeKeyTable(createAWSS3Table(s3, bucket, keys.login, createArrayCaster(createTupleCaster([
    castLoginGrantID,
    castLoginGrant,
  ]))));
  const secrets = createCompositeKeyTable(createAWSS3Table(s3, bucket, keys.secrets, createArrayCaster(createTupleCaster([
    castString,
    castString,
  ]))));

  const data =  {
    users,
    grants: {
      identity,
      secrets,
      login,
    }
  }
  return {
    data,
    keys,
  };
};
