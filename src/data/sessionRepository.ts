import { openDB as idbOpenDB, type DBSchema, type IDBPDatabase } from 'idb';

import type { HealthDay } from '@/domain/health/healthDay';
import type { UserProfile } from '@/domain/profile/userProfile';
import type { Session } from '@/domain/types';
import type { WeightEntry } from '@/domain/weight/weightEntry';

const PROFILE_KEY = 'me';

interface StoredUserProfile extends UserProfile {
  id: typeof PROFILE_KEY;
}

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
  userProfile: {
    key: string;
    value: StoredUserProfile;
  };
  weightEntries: {
    key: string;
    value: WeightEntry;
    indexes: { 'by-recordedAt': string };
  };
}

const DB_NAME = 'exercise-tracker';
const DB_VERSION = 3;

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
      if (!database.objectStoreNames.contains('userProfile')) {
        database.createObjectStore('userProfile', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('weightEntries')) {
        const store = database.createObjectStore('weightEntries', { keyPath: 'id' });
        store.createIndex('by-recordedAt', 'recordedAt');
      }
    },
  });
}

export const EXPORT_VERSION = 3;

export interface ExportPayload {
  version: typeof EXPORT_VERSION;
  exportedAt: string;
  sessions: Session[];
  healthDays: HealthDay[];
  profile: UserProfile | null;
  weightEntries: WeightEntry[];
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
  getProfile(): Promise<UserProfile | null>;
  setProfile(profile: UserProfile): Promise<void>;
  clearProfile(): Promise<void>;
  listWeightEntries(): Promise<WeightEntry[]>;
  addWeightEntry(entry: WeightEntry): Promise<void>;
  updateWeightEntry(
    id: string,
    partial: Pick<WeightEntry, 'recordedAt' | 'weightKg'>,
  ): Promise<void>;
  deleteWeightEntry(id: string): Promise<void>;
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
      const [sessions, healthDays, profile, weightEntries] = await Promise.all([
        this.list(),
        this.listHealthDays(),
        this.getProfile(),
        this.listWeightEntries(),
      ]);
      return {
        version: EXPORT_VERSION,
        exportedAt: now.toISOString(),
        sessions,
        healthDays,
        profile,
        weightEntries,
      };
    },
    async importAll(payload) {
      if (typeof payload !== 'object' || payload === null) {
        throw new InvalidImportPayloadError('El payload debe ser un objeto');
      }
      const candidate = payload as Record<string, unknown>;
      if (candidate.version !== 1 && candidate.version !== 2 && candidate.version !== 3) {
        throw new UnsupportedImportVersionError(candidate.version);
      }
      if (!Array.isArray(candidate.sessions)) {
        throw new InvalidImportPayloadError('El payload no contiene "sessions" como array');
      }
      const sessions = candidate.sessions as Session[];

      // v2/v3 incluye healthDays (obligatorio en v2 y v3); v1 no los trae.
      let healthDays: HealthDay[] | null = null;
      if (candidate.version === 2 || candidate.version === 3) {
        if (!Array.isArray(candidate.healthDays)) {
          throw new InvalidImportPayloadError(
            'El payload v2/v3 no contiene "healthDays" como array',
          );
        }
        healthDays = candidate.healthDays as HealthDay[];
      }

      // v3 añade profile y weightEntries (obligatorios).
      let profile: UserProfile | null | undefined;
      let weightEntries: WeightEntry[] | null = null;
      if (candidate.version === 3) {
        if (
          candidate.profile !== null &&
          (typeof candidate.profile !== 'object' || candidate.profile === undefined)
        ) {
          throw new InvalidImportPayloadError('El payload v3 tiene "profile" inválido');
        }
        profile = candidate.profile as UserProfile | null;
        if (!Array.isArray(candidate.weightEntries)) {
          throw new InvalidImportPayloadError(
            'El payload v3 no contiene "weightEntries" como array',
          );
        }
        weightEntries = candidate.weightEntries as WeightEntry[];
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

      if (profile !== undefined) {
        if (profile === null) {
          await this.clearProfile();
        } else {
          await this.setProfile(profile);
        }
      }

      if (weightEntries !== null) {
        const weightsTx = db.transaction('weightEntries', 'readwrite');
        await weightsTx.store.clear();
        for (const entry of weightEntries) {
          await weightsTx.store.put(entry);
        }
        await weightsTx.done;
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
    async getProfile() {
      const stored = await db.get('userProfile', PROFILE_KEY);
      if (!stored) return null;
      const { id: _id, ...profile } = stored;
      void _id;
      return profile;
    },
    async setProfile(profile) {
      await db.put('userProfile', { id: PROFILE_KEY, ...profile });
    },
    async clearProfile() {
      await db.delete('userProfile', PROFILE_KEY);
    },
    async listWeightEntries() {
      return db.getAllFromIndex('weightEntries', 'by-recordedAt');
    },
    async addWeightEntry(entry) {
      await db.put('weightEntries', entry);
    },
    async updateWeightEntry(id, partial) {
      const existing = await db.get('weightEntries', id);
      if (!existing) {
        throw new Error(`weightEntries: no existe entrada con id "${id}"`);
      }
      await db.put('weightEntries', { ...existing, ...partial });
    },
    async deleteWeightEntry(id) {
      await db.delete('weightEntries', id);
    },
  };
}
