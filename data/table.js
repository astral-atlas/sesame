// @flow strict
/*:: import type { JSONValue, Cast } from '@lukekaalim/cast'; */
import { promises } from 'fs';
import { dirname } from 'path';
import { castString, createArrayCaster, createTupleCaster, createObjectCaster } from '@lukekaalim/cast';
import { S3 } from '@aws-sdk/client-s3';
import { Readable } from "stream";
const { writeFile, readFile, mkdir } = promises;

/*::
export type Page<Key, Value> = { result: Value[], next: Key | null };

export type Table<Key, Value> = {
  get: (key: Key) => Promise<{ result: Value | null }>,
  set: (key: Key, value: null | Value) => Promise<void>,
  scan: (from?: null | Key, limit?: null | number) => Promise<Page<Key, Value>>
};

export type CompositeTable<PartitionKey, SortKey, Value> = Table<{ partition: PartitionKey, sort: SortKey }, Value> & {
  query: (partition: PartitionKey) => Promise<Page<PartitionKey, Value>>,
};
*/


export const createMemoryTable = /*::<K, V>*/(
  initialMap/*: Iterable<[K, V]>*/ = []
)/*: { ...Table<K, V>, data: Map<K, V> }*/ => {
  const data = new Map/*::<K, V>*/(initialMap);
  const get = async (key) => {
    const result = data.get(key) || null;
    return { result };
  };
  const set = async (key, value) => {
    if (value === null)
      data.delete(key);
    else
      data.set(key, value);
  };
  const scan = async (from, limit) => {
    const entries = [...data.entries()];
    const startIndex = from ? entries.findIndex(([k, v]) => k === from) : 0;
    const endIndex = limit ? (startIndex + limit - 1) : (entries.length - startIndex - 1);

    const result = entries.filter(([k, v], i) => i >= startIndex && i <= endIndex).map(([k, v]) => v);
    const nextEntry = entries[endIndex + 1];
    const next = nextEntry ? nextEntry[0] : null;

    return { result, next };
  };
  return {
    get,
    set,
    scan,
    data,
  };
};

const readOrCreateFile = async (filename, encoding, defaultFileContent) => {
  try {
    return await readFile(filename, encoding);
  } catch (error) {
    switch (error.code) {
      case 'ENOENT':
        await mkdir(dirname(filename), { recursive: true });
        await writeFile(filename, defaultFileContent);
        return defaultFileContent;
      default:
        throw error;
    }
  }
};

/// A "File Table" is a table that is loaded asynchronously
export const createFileTable = async /*::<V>*/(
  filename/*: string*/,
  castValue/*: Cast<V>*/,
)/*: Promise<Table<string, V>>*/ => {
  const toMapEntry = createTupleCaster([castString, castValue]);
  const toTable = createArrayCaster(toMapEntry);

  const fileContents = await readOrCreateFile(filename, 'utf-8', JSON.stringify([]));
  const tableValue = toTable(JSON.parse(fileContents));
  const internalTable = createMemoryTable(tableValue);

  const get = async (key) => {
    const { result } = await internalTable.get(key);
    return { result };
  };
  const scan = async (from, limit) => {
    const { next, result } = await internalTable.scan(from, limit);
    return { next, result };
  };
  const set = async (key, value) => {
    await internalTable.set(key, value);
    const newTableValue = [...internalTable.data.entries()];
    await writeFile(filename, JSON.stringify(newTableValue, null, 2));
  };

  return {
    get,
    set,
    scan,
  };
};

export const createCompositeKeyTable = /*:: <PartitionKey, SortKey, Value>*/(
  backingTable/*: Table<PartitionKey, $ReadOnlyArray<[SortKey, Value]>>*/,
)/*: CompositeTable<PartitionKey, SortKey, Value>*/ => {
  const get = async (key) => {
    const { result: partition } = await backingTable.get(key.partition);
    if (!partition)
      return { result: null };
    const value = partition.find(([sortKey]) => key.sort === sortKey);
    if (!value)
      return { result: null };
    const [sortKey, result] = value;
    return { result };
  };
  const set = async (key, newValue) => {
    const { result: partition } = await backingTable.get(key.partition);
    if (newValue) {
      if (!partition)
        return backingTable.set(key.partition, [[key.sort, newValue]])

      const newPartition = [
        ...partition.filter(([sk, oldValue]) => sk !== key.sort),
        [key.sort, newValue],
      ];
      return await backingTable.set(key.partition, newPartition);
    } else {
      if (!partition)
        return; // Cant delete something that doesn't exist
      const newPartition = partition.filter(([sk, oldValue]) => sk !== key.sort);
      return await backingTable.set(key.partition, newPartition);
    }
  };
  // TODO: Scan is totally broken
  const scan = async (from, limit) => {
    const { next, result: partitions } = await backingTable.scan(from ? from.partition : null, null);
    const result = partitions.flat(1).map(([sk, v]) => v);
    return { next: null, result };
  };
  const query = async (partitionKey) => {
    const { result: partition } = await backingTable.get(partitionKey);
    if (!partition)
      return { result: [], next: null };
    return { result: partition.map(([sk, v]) => v), next: null };
  };
  return { get, set, scan, query };
};

export const createAWSS3Table = /*:: <V>*/(
  s3/*: S3*/,
  bucketName/*: string*/,
  bucketKeyName/*: string*/,
  castValue/*: Cast<V>*/
)/*: Table<string, V>*/ => {
  const castS3Object = createArrayCaster(createObjectCaster({ key: castString, value: castValue }));
  const loadEntries = async () => {
    const { Body, ContentType } = await s3.getObject({ Bucket: bucketName, Key: bucketKeyName });
    const chunks = [];
    for await (const chunk of Body)
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    const buffer = Buffer.concat(chunks);
    const entries = castS3Object(JSON.parse(buffer.toString('utf-8')));
    return entries;
  };

  const get = async (key) => {
    const entries = await loadEntries();
    const entry = entries.find((entry) => key == entry.key);
    if (!entry)
      return { result: null };
    return { result: entry.value };
  };
  const set = async (key, value) => {
    const entries = await loadEntries();
    const updatedEntries = [...entries.filter(e => e.key !== key), { key, value }];
    const body = Buffer.from(JSON.stringify(updatedEntries));
    await s3.putObject({ Body: body, Bucket: bucketName, Key: bucketKeyName });
  };
  const scan = async () => {
    throw new Error();
  };

  return {
    get,
    set,
    scan,
  };
};