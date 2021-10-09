// @flow strict
/*:: import type { S3 } from "@aws-sdk/client-s3"; */
/*:: import type { SesameData } from './data'; */
import { resolve, join } from 'path';
import { createBufferedSesameData } from './data.js';
import { createFileBufferStore, createMemoryBufferStore, createS3BufferStore } from "./sources/buffer";

export const createMemoryData = ()/*: { data: SesameData }*/ => {
  const { data } = createBufferedSesameData(() => createMemoryBufferStore());
  return { data };
}
export const createFileData = (directory/*: string*/)/*: { data: SesameData, files: string[] }*/ => {
  const files = [];
  const createBackingBufferBuffer = (name) => {
    const path = resolve(directory, `${name}.json`);
    files.push(path);
    return createFileBufferStore(path);
  };
  const { data } = createBufferedSesameData(createBackingBufferBuffer);
  return { data, files };
}
export const createS3Data = (S3/*: S3*/, bucket/*: string*/, keyPrefix/*: string*/)/*: { data: SesameData, keys: string[] }*/ => {
  const keys = [];
  const createBackingBufferBuffer = (name) => {
    const key = join(keyPrefix, name);
    keys.push(key);
    return createS3BufferStore(S3, bucket, key);
  };
  const { data } = createBufferedSesameData(createBackingBufferBuffer);
  return { data, keys };
}
/*:: export type * from './data'; */