// @flow strict
/*:: import type { S3 } from "@aws-sdk/client-s3"; */
/*:: import type { SesameData } from './data'; */
/*:: import type { FS } from './sources/buffer'; */
import { createBufferedSesameData } from './data.js';
import { createFileBufferStore, createMemoryBufferStore, createS3BufferStore } from "./sources/buffer.js";

export const createMemoryData = ()/*: { data: SesameData }*/ => {
  const { data } = createBufferedSesameData(() => createMemoryBufferStore());
  return { data };
}
export const createFileData = (fs/*: FS*/, directory/*: string*/)/*: { data: SesameData, files: string[] }*/ => {
  const files = [];
  const createBackingBufferBuffer = (name) => {
    const path = [directory, `${name}.json`].join('/');
    files.push(path);
    return createFileBufferStore(fs, path);
  };
  const { data } = createBufferedSesameData(createBackingBufferBuffer);
  return { data, files };
}
export const createS3Data = (S3/*: S3*/, bucket/*: string*/, keyPrefix/*: string*/)/*: { data: SesameData, keys: string[] }*/ => {
  const keys = [];
  const createBackingBufferBuffer = (name) => {
    const key = [keyPrefix, name].join('');
    keys.push(key);
    return createS3BufferStore(S3, bucket, key);
  };
  const { data } = createBufferedSesameData(createBackingBufferBuffer);
  return { data, keys };
}
/*:: export type * from './data'; */