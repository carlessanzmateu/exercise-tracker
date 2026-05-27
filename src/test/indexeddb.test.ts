import { describe, it, expect } from 'vitest';

describe('fake-indexeddb setup', () => {
  it('exposes a global indexedDB capable of opening a DB and creating an object store', async () => {
    const dbName = `t004-test-${Date.now()}-${Math.random()}`;

    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('items', { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    expect(db.objectStoreNames.contains('items')).toBe(true);
    db.close();
  });
});
