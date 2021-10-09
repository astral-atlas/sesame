// @flow strict

import { S3 } from '@aws-sdk/client-s3';
import { promises } from 'fs';
const { writeFile, readFile, mkdir } = promises;

/*::
export type BufferStore = {
  get: () => Promise<Buffer>,
  set: Buffer => Promise<void>
}
*/

export const createMemoryBufferStore = ()/*: BufferStore*/ => {
  let buffer = Buffer.alloc(0);
  return {
    async get() {
      return buffer;
    },
    async set(newBuffer) {
      buffer = newBuffer;
    }
  }
};
export const createFileBufferStore = (path/*: string*/)/*: BufferStore*/ => ({
  async get() {
    return await readFile(path);
  },
  async set(newBuffer) {
    await writeFile(path, newBuffer);
  }
});
export const createS3BufferStore = (s3/*: S3*/, bucket/*: string*/, key/*: string*/)/*: BufferStore*/ => ({
  async get() {
    const { Body } = await s3.getObject({ Bucket: bucket, Key: key });
    const buffers = [];
    for await (const chunk of Body)
      buffers.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
    return Buffer.concat(buffers);
  },
  async set(newBuffer) {
    await s3.putObject({ Body: newBuffer, Bucket: bucket, Key: key });
  }
});