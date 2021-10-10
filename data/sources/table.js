// @flow strict
/*:: import type { JSONValue, Cast } from '@lukekaalim/cast'; */

/*:: import type { BufferStore } from './buffer.js'; */
import { c } from '@lukekaalim/cast';

/*::
export type Page<Key, Value> = { result: Value[], next: Key | null };

export type Table<Key, Value> = {
  get: (key: Key) => Promise<{ result: Value | null }>,
  set: (key: Key, value: null | Value) => Promise<void>,
  scan: (from?: null | Key, limit?: null | number) => Promise<Page<Key, Value>>
};

export type CompositeTable<PartitionKey, SortKey, Value> = {
  get: (partition: PartitionKey, sort: SortKey) => Promise<{ result: Value | null }>,
  set: (partition: PartitionKey, sort: SortKey, value: null | Value) => Promise<void>,
  scan: (from: { partition: ?PartitionKey, sort: ?SortKey }, limit: null | number) => Promise<Page<{ partition: PartitionKey, sort: SortKey }, Value>>,
};
*/

export const createBufferTable = /*:: <T>*/(store/*: BufferStore*/, castValue/*: Cast<T>*/)/*: Table<string, T>*/ => {
  const castTable = c.arr(c.obj({ key: c.str, value: castValue }));
  const loadTable = async () => {
    try {
      const buffer = await store.get()
      const table = castTable(JSON.parse(buffer.toString('utf8')))
      return table;
    } catch (error) {
      return [];
    }
  };
  const get = async (key) => {
    const table = await loadTable();
    const entry = table.find(e => e.key === key) || null;
    return { result: entry && entry.value };
  };
  const set = async (key, newValue) => {
    const table = await loadTable();
    const updatedTable = newValue ?
    [...table.filter(e => e.key !== key), { key, value: newValue }] :
      table.filter(e => e.key !== key);
    await store.set(Buffer.from(JSON.stringify(updatedTable, null, 2)));
  };
  const scan = async () => {
    const table = await loadTable();
    // TODO: this is broken!
    return { result: table.map(e => e.value), next: null };
  }
  return {
    get,
    set,
    scan,
  };
}
export const createBufferCompositeTable = /*:: <T>*/(store/*: BufferStore*/, castValue/*: Cast<T>*/)/*: CompositeTable<string, string, T>*/ => {
  const castTable = c.arr(c.obj({ partition: c.str, sort: c.str, value: castValue }));
  const matchEntry = (partition, sort, e) => (e.partition === partition && e.sort === sort);
  const loadTable = async () => {
    try {
      const buffer = await store.get()
      const table = castTable(JSON.parse(buffer.toString('utf8')))
      return table;
    } catch (error) {
      return [];
    }
  };
  const get = async (partition, sort) => {
    const table = await loadTable();
    const entry = table.find(e => matchEntry(partition, sort, e)) || null;
    return { result: entry && entry.value };
  }
  const set = async (partition, sort, newValue) => {
    const table = await loadTable();
    const updatedTable = newValue ?
      [...table.filter(e => !matchEntry(partition, sort, e)), { partition, sort, value: newValue }] :
      table.filter(e => !matchEntry(partition, sort, e));
    await store.set(Buffer.from(JSON.stringify(updatedTable, null, 2)));
  }
  const scan = async ({ partition = null, sort }, limit) => {
    // we assume buffer tables have no limit
    const table = await loadTable();
    // TODO: this is broken!
    const entries = table
      .filter(e => e.partition === partition)
      .map(e => e.value)
    return { result: entries, next: null };
  };
  return { get, set, scan };
};
