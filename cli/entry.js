#!/usr/bin/env node
// @flow strict
import { S3 } from '@aws-sdk/client-s3';
import { createAWSS3SesameData } from "@astral-atlas/sesame-data";
import { createLoginProof, encodeProofToken } from "@astral-atlas/sesame-models";

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

const addRootUser = async () => {
  const s3 = new S3({ region: 'ap-southeast-2' });

  const { data } = createAWSS3SesameData(s3, 'sesame-test-data', 'sesame');
  const grant = {
    type: 'login',
    login: "f06f27ef-7274-49d1-b9ef-40ef19015ee8",
    id: '0'
  };
  const secret = 'yes';
  await data.grants.login.set({ partition: "f06f27ef-7274-49d1-b9ef-40ef19015ee8", sort: "0" }, grant)
  await data.grants.secrets.set({ partition: "f06f27ef-7274-49d1-b9ef-40ef19015ee8", sort: "0" }, secret)
  const proof = createLoginProof(grant, secret);
  const token = encodeProofToken(proof)
  console.log(token)
  console.log(encodeURI(token));
};

const entry = async (command, ...subcommands) => {
  switch (command) {
    case 'init-aws':
      return await initAWS();
    case 'add-root-user':
      return await addRootUser();
    default:
      return console.log('🤷');
  }
};

entry(...process.argv.slice(2));