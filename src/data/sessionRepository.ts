import { openDB as idbOpenDB, type DBSchema, type IDBPDatabase } from 'idb';

import type { HealthDay } from '@/domain/health/healthDay';
import type { Session } from '@/domain/types';

export interface SessionsSchema extends DBSchema {
  sessions: {
    key: string;
    value: Session;
    indexes: { startedAt: string };
  };
  healthDays: {
    key: string;
    value: HealthDay;
  };
}

const DB_NAME = 'exercise-tracker';
const DB_VERSION = 2;

export class IndexedDBUnavailableError extends Error {
  constructor() {
    super('IndexedDB no está disponible en este entorno');
    this.name = 'IndexedDBUnavailableError';
  }
}

export async function openDB({ name = DB_NAME }: { name?: string } = {}): Promise<
  IDBPDatabase<SessionsSchema>
> {
  if (typeof globalThis.indexedDB === 'undefined') {
    throw new IndexedDBUnavailableError();
  }
  return idbOpenDB<SessionsSchema>(name, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('sessions')) {
        const store = database.createObjectStore('sessions', { keyPath: 'id' });
        store.createIndex('startedAt', 'startedAt');
      }
      if (!database.objectStoreNames.contains('healthDays')) {
        database.createObjectStore('healthDays', { keyPath: 'date' });
      }
    },
  });
}

export const EXPORT_VERSION = 2;

export interface ExportPayload {
  version: typeof EXPORT_VERSION;
  exportedAt: string;
  sessions: Session[];
  healthDays: HealthDay[];
}

export class InvalidImportPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidImportPayloadError';
  }
}

export class UnsupportedImportVersionError extends Error {
  constructor(public readonly receivedVersion: unknown) {
    super(`Versión de importación no soportada: ${String(receivedVersion)}`);
    this.name = 'UnsupportedImportVersionError';
  }
}

export interface SessionRepository {
  save(session: Session): Promise<void>;
  getById(id: string): Promise<Session | undefined>;
  list(): Promise<Session[]>;
  update(session: Session, now: Date): Promise<void>;
  delete(id: string): Promise<void>;
  exportAll(now: Date): Promise<ExportPayload>;
  importAll(payload: unknown): Promise<void>;
  listHealthDays(): Promise<HealthDay[]>;
  upsertHealthDays(days: HealthDay[]): Promise<void>;
  clearHealthDays(): Promise<void>;
}

export function createSessionRepository(db: IDBPDatabase<SessionsSchema>): SessionRepository {
  return {
    async save(session) {
      await db.put('sessions', session);
    },
    async getById(id) {
      return db.get('sessions', id);
    },
    async list() {
      const sessions: Session[] = [];
      const index = db.transaction('sessions', 'readonly').store.index('startedAt');
      let cursor = await index.openCursor(null, 'prev');
      while (cursor) {
        sessions.push(cursor.value);
        cursor = await cursor.continue();
      }
      return sessions;
    },
    async update(session, now) {
      const stamped: Session = { ...session, updatedAt: now.toISOString() };
      await db.put('sessions', stamped);
    },
    async delete(id) {
      await db.delete('sessions', id);
    },
    async exportAll(now) {
      const [sessions, healthDays] = await Promise.all([this.list(), this.listHealthDays()]);
      return {
        version: EXPORT_VERSION,
        exportedAt: now.toISOString(),
        sessions,
        healthDays,
      };
    },
    async importAll(payload) {
      if (typeof payload !== 'object' || payload === null) {
        throw new InvalidImportPayloadError('El payload debe ser un objeto');
      }
      const candidate = payload as Record<string, unknown>;
      if (candidate.version !== 1 && candidate.version !== 2) {
        throw new UnsupportedImportVersionError(candidate.version);
      }
      if (!Array.isArray(candidate.sessions)) {
        throw new InvalidImportPayloadError('El payload no contiene "sessions" como array');
      }
      const sessions = candidate.sessions as Session[];

      // v2 incluye healthDays (obligatorio); v1 no los trae y no se tocan.
      let healthDays: HealthDay[] | null = null;
      if (candidate.version === 2) {
        if (!Array.isArray(candidate.healthDays)) {
          throw new InvalidImportPayloadError('El payload v2 no contiene "healthDays" como array');
        }
        healthDays = candidate.healthDays as HealthDay[];
      }

      const sessionsTx = db.transaction('sessions', 'readwrite');
      await sessionsTx.store.clear();
      for (const session of sessions) {
        await sessionsTx.store.put(session);
      }
      await sessionsTx.done;

      if (healthDays !== null) {
        const healthTx = db.transaction('healthDays', 'readwrite');
        await healthTx.store.clear();
        for (const day of healthDays) {
          await healthTx.store.put(day);
        }
        await healthTx.done;
      }
    },
    async listHealthDays() {
      const days = await db.getAll('healthDays');
      return days.sort((a, b) => a.date.localeCompare(b.date));
    },
    async upsertHealthDays(days) {
      const tx = db.transaction('healthDays', 'readwrite');
      for (const day of days) {
        await tx.store.put(day);
      }
      await tx.done;
    },
    async clearHealthDays() {
      await db.clear('healthDays');
    },
  };
}
