// @flow strict
/*::
import type { S3 } from '@aws-sdk/client-s3';
*/
/*::
export type FS = {
  +writeFile: (path: string, buffer: Uint8Array) => Promise<void>, 
  +readFile: (path: string) => Promise<Uint8Array>, 
}

export type BufferStore = {
  get: () => Promise<Uint8Array>,
  set: Uint8Array => Promise<void>
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
export const createFileBufferStore = (fs/*: FS*/, path/*: string*/)/*: BufferStore*/ => ({
  async get() {
    return await fs.readFile(path);
  },
  async set(newBuffer) {
    await fs.writeFile(path, newBuffer);
  }
});
export const createS3BufferStore = (s3/*: S3*/, bucket/*: string*/, key/*: string*/)/*: BufferStore*/ => ({
  async get() {
    const response = await s3.getObject({ Bucket: bucket, Key: key });
    const { Body, ContentLength } = response;
    if (typeof ReadableStream === 'object' && Body instanceof ReadableStream) {
      const reader = Body.getReader();
      const buffer = new Uint8Array(ContentLength);
      let done = false;
      let offset = 0;
      while (!done) {
        const result = await reader.read();
        const { value } = result;
        if (value instanceof Uint8Array) {
          buffer.set(value, offset)
          offset += value.byteLength;
        }
        done = result.done;
      }
      return buffer;
    }
    const buffers = [];
    for await (const chunk of Body)
      buffers.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
    return Buffer.concat(buffers);
  },
  async set(newBuffer) {
    await s3.putObject({ Body: newBuffer, Bucket: bucket, Key: key });
  }
});