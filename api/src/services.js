// @flow strict
/*:: import type { SesameData } from '@astral-atlas/sesame-data'; */
/*:: import type { GrantService } from './services/grants.js'; */
/*:: import type { AuthorityService } from './services/auth.js'; */
/*:: import type { UserService } from './services/users.js'; */
/*:: import type { Config } from "./config";*/
import { createGrantService } from './services/grants.js';
import { createAuthorityService } from './services/auth.js';
import { createUserService } from './services/users.js';

import { createMemorySesameData, createFileSesameData, createAWSS3SesameData } from '@astral-atlas/sesame-data';
import { S3 } from "@aws-sdk/client-s3";

/*::
export type Services = {
  grant: GrantService,
  auth: AuthorityService,
  user: UserService,
};
*/

const lukeUser = {
  id: '1',
  name: 'luke',
  adminId: null,
  creatorAdminId: null
};

export const createData = async (config/*: Config*/)/*: Promise<SesameData>*/ => {
  const dataConfig = config.data || { type: 'memory' };
  switch (dataConfig.type) {
    case 'memory':
      const { data: memoryData } = createMemorySesameData({ users: [lukeUser] });
      return memoryData;
    case 'file':
      const { data: fileData } = await createFileSesameData(dataConfig.dataDir || undefined)
      return fileData;
    case 'awsS3':
      const s3 = new S3({ region: 'ap-southeast-2' });
      const { data: awsS3Data } = createAWSS3SesameData(s3, dataConfig.bucket, dataConfig.prefix || '/sesame');
      return awsS3Data;
  }
};

export const createServices = async (config/*: Config*/)/*: Promise<Services>*/ => {
  const data = await createData(config);

  const grant = createGrantService(data)
  const auth = createAuthorityService(data);
  const user = createUserService(data.users);

  return {
    grant,
    auth,
    user,
  };
};
