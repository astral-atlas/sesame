#!/usr/bin/env node
// @flow strict
import { S3 } from '@aws-sdk/client-s3';
import { createS3Data, createFileData } from "@astral-atlas/sesame-data";
import { createLoginProof, encodeProofToken, castAPIConfig } from "@astral-atlas/sesame-models";
import generateString from 'crypto-random-string';
import { promises } from 'fs';
import { v4 as uuid } from 'uuid';
import qrcode from 'qrcode-terminal';
import { dirname } from "path";
import JSON5 from 'json5';
const { writeFile, mkdir, readFile } = promises;

const readConfig = async (configPath = './config.json5') => {
  return castAPIConfig(JSON5.parse(await readFile(configPath, 'utf8')));
};

const initAWS = async ({ bucket, prefix }) => {
  const s3 = new S3({ region: 'ap-southeast-2' });

  const emptyTable = Buffer.from(JSON.stringify([]));
  const { keys } = createS3Data(s3, bucket, prefix || '/sesame');

  await Promise.all(
    Object.values(keys)
      .map(k => typeof k === 'string' ? k : null)
      .filter(Boolean)
      .map(bucketKey =>
        s3.putObject({
          Body: emptyTable,
          Bucket: bucket,
          Key: bucketKey,
          ContentType: 'application/json'
        })
      )
  );

  console.log('done');
};

const createData = async () => {
  const config = await readConfig();
  const dataConfig = config.data || { type: 'file', dataDir: './data' };

  switch (dataConfig.type) {
    case 'awsS3':
      const s3 = new S3({ region: 'ap-southeast-2' });
      return createS3Data(s3, dataConfig.bucket, dataConfig.prefix || '/sesame');
    case 'file':
      return createFileData(dataConfig.dataDir || './data');
    default:
      throw new Error();
  }
};

const addUser = async (name) => {
  const { data } = await createData()
  const user = {
    id: uuid(),
    name,
    adminId: null,
    creatorAdminId: null
  };
  const grant = {
    type: 'login',
    createdIdentity: null,
    revoked: false,
    createdBy: null,
    login: user.id,
    id: uuid()
  };
  const secret = generateString({ length: 32 }); 
  
  await data.grants.login.set(user.id, grant.id, grant)
  await data.secrets.set(grant.id, secret);
  await data.users.set(user.id, user);

  const proof = createLoginProof(grant, secret);
  const token = encodeProofToken(proof);
  const loginUrl = new URL('/token/login.html', 'http://sesame.astral-atlas.com');
  loginUrl.searchParams.append('token', token);

  console.log(loginUrl.href);
  qrcode.generate(loginUrl.href, { small: true });
};

const addLogin = async (userId) => {
  const { data } = createFileData('./api/data');
  const grant = {
    type: 'login',
    createdIdentity: null,
    revoked: false,
    createdBy: null,
    login: userId,
    id: uuid()
  };
  const secret = generateString({ length: 32 }); 
  await data.grants.login.set(userId, grant.id, grant)
  await data.secrets.set(grant.id, secret);

  const proof = createLoginProof(grant, secret);
  const token = encodeProofToken(proof);
  const loginUrl = new URL('/', 'http://localhost:8080');
  loginUrl.searchParams.append('token', token);
  console.log(loginUrl.href);
}

const init = async () => {
  const config = await readConfig();
  const data = config.data || { type: 'file', dataDir: './data' };

  switch (data.type) {
    case 'file': {
      const { files } = createFileData(data.dataDir || './data');
      for (const file of files) {
        await mkdir(dirname(file), { recursive: true });
      }
      return;
    }
    case 'awsS3': {
      return await initAWS(data);
    }
  }

}

const entry = async (command, ...subcommands) => {
  try {
    switch (command) {
      case 'init':
        return await init();
      case 'add-user':
        return await addUser(...subcommands);
      case 'add-login':
        return await addLogin(...subcommands);
      default:
        return console.log('🤷');
    }
  } catch (error) {
    console.warn(error.message);
  }
};

entry(...process.argv.slice(2));