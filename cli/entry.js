#!/usr/bin/env node
// @flow strict
import { S3 } from '@aws-sdk/client-s3';
import { createAWSS3SesameData } from "@astral-atlas/sesame-data";
import { createLoginProof, encodeProofToken } from "@astral-atlas/sesame-models";
import generateString from 'crypto-random-string';
import { v4 as uuid } from 'uuid';
import qrcode from 'qrcode-terminal';

const bucketName = 'sesame-test-data20210930112954914600000001';

const initAWS = async () => {
  const s3 = new S3({ region: 'ap-southeast-2' });

  const emptyTable = Buffer.from(JSON.stringify([]));
  const { keys } = createAWSS3SesameData(s3, bucketName, '/');

  await Promise.all(
    Object.values(keys)
      .map(k => typeof k === 'string' ? k : null)
      .filter(Boolean)
      .map(bucketKey =>
        s3.putObject({
          Body: emptyTable,
          Bucket: bucketName,
          Key: bucketKey,
          ContentType: 'application/json'
        })
      )
  );

  console.log('done');
};

const addUser = async (name) => {
  const s3 = new S3({ region: 'ap-southeast-2' });

  const { data, keys } = createAWSS3SesameData(s3, 'sesame-test-data20210930112954914600000001', '/');
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
  await data.users.set(user.id, user);
  const proof = createLoginProof(grant, secret);
  const token = encodeProofToken(proof);
  const loginUrl = new URL('/token/login.html', 'http://sesame.astral-atlas.com');
  loginUrl.searchParams.append('token', token);

  console.log(loginUrl.href);
  qrcode.generate(loginUrl.href, { small: true });
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