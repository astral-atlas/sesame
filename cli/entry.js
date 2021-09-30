#!/usr/bin/env node
// @flow strict
import { S3 } from '@aws-sdk/client-s3';
import { createAWSS3SesameData } from "@astral-atlas/sesame-data";
import { createLoginProof, encodeProofToken } from "@astral-atlas/sesame-models";
import generateString from 'crypto-random-string';
import { v4 as uuid } from 'uuid';


const initAWS = async () => {
  const s3 = new S3({ region: 'ap-southeast-2' });

  const emptyTable = Buffer.from(JSON.stringify([]));

  await Promise.all([
    s3.putObject({ Body: emptyTable, Bucket: 'sesame-test-data', Key: 'sesame/users.json', ContentType: 'application/json' }),
    s3.putObject({ Body: emptyTable, Bucket: 'sesame-test-data', Key: 'sesame/identity.json', ContentType: 'application/json' }),
    s3.putObject({ Body: emptyTable, Bucket: 'sesame-test-data', Key: 'sesame/login.json', ContentType: 'application/json' }),
    s3.putObject({ Body: emptyTable, Bucket: 'sesame-test-data', Key: 'sesame/secrets.json', ContentType: 'application/json' })
  ]);

  console.log('done');
};

const addUser = async (name) => {
  const s3 = new S3({ region: 'ap-southeast-2' });

  const { data } = createAWSS3SesameData(s3, 'sesame-test-data', 'sesame');
  const user = {
    id: uuid(),
    name,
    adminId: null,
    creatorAdminId: null
  };
  const grant = {
    type: 'login',
    login: user.id,
    id: uuid()
  };
  const secret = generateString({ length: 32 });
  await data.grants.login.set({ partition: user.id, sort: grant.id }, grant)
  await data.grants.secrets.set({ partition: user.id, sort: grant.id }, secret)
  const proof = createLoginProof(grant, secret);
  const token = encodeProofToken(proof)
  console.log(token)
  console.log(encodeURI(token));
};

const entry = async (command, ...subcommands) => {
  switch (command) {
    case 'init-aws':
      return await initAWS();
    case 'add-user':
      return await addUser(...subcommands);
    default:
      return console.log('🤷');
  }
};

entry(...process.argv.slice(2));