// @flow strict
/*:: import type { SesameData } from '@astral-atlas/sesame-data'; */
/*:: import type { APIConfig } from '@astral-atlas/sesame-models'; */
/*:: import type { GrantService } from './services/grants.js'; */
/*:: import type { AuthorityService } from './services/auth.js'; */
/*:: import type { UserService } from './services/users.js'; */
import { createGrantService } from './services/grants.js';
import { createAuthorityService } from './services/auth.js';
import { createUserService } from './services/users.js';

import { createMemoryData, createFileData, createS3Data } from '@astral-atlas/sesame-data';
import { S3 } from "@aws-sdk/client-s3";

/*::
export type Services = {
  grant: GrantService,
  auth: AuthorityService,
  user: UserService,
};
*/

export const createData = async (config/*: APIConfig*/)/*: Promise<SesameData>*/ => {
  const dataConfig = config.data || { type: 'memory' };
  switch (dataConfig.type) {
    case 'memory':
      const { data: memoryData } = createMemoryData();
      return memoryData;
    case 'file':
      const { data: fileData } = await createFileData(dataConfig.dataDir || './data')
      return fileData;
    case 'awsS3':
      const s3 = new S3({ region: 'ap-southeast-2' });
      const { data: awsS3Data } = createS3Data(s3, dataConfig.bucket, dataConfig.prefix || '/sesame');
      return awsS3Data;
  }
};

export const createServices = async (config/*: APIConfig*/)/*: Promise<Services>*/ => {
  const data = await createData(config);

  const auth = createAuthorityService(data);
  const grant = createGrantService(data, auth)
  const user = createUserService(data.users);

  return {
    grant,
    auth,
    user,
  };
};
