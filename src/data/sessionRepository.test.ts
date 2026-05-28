import { openDB as idbOpenDB } from 'idb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createSessionRepository,
  IndexedDBUnavailableError,
  InvalidImportPayloadError,
  openDB,
  UnsupportedImportVersionError,
  type ExportPayload,
  type SessionRepository,
} from '@/data/sessionRepository';
import type { Session } from '@/domain/types';

type OpenedDB = Awaited<ReturnType<typeof openDB>>;

describe('SessionRepository.openDB', () => {
  const opened: OpenedDB[] = [];

  afterEach(() => {
    while (opened.length > 0) {
      opened.pop()?.close();
    }
  });

  async function open(): Promise<OpenedDB> {
    const dbName = `exercise-tracker-test-${Date.now()}-${Math.random()}`;
    const db = await openDB({ name: dbName });
    opened.push(db);
    return db;
  }

  it('creates the "sessions" object store with keyPath = "id"', async () => {
    const db = await open();

    expect(db.objectStoreNames.contains('sessions')).toBe(true);

    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    expect(store.keyPath).toBe('id');
  });

  it('creates an index on "startedAt" in the "sessions" object store', async () => {
    const db = await open();

    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');

    expect(Array.from(store.indexNames)).toContain('startedAt');

    const index = store.index('startedAt');
    expect(index.keyPath).toBe('startedAt');
  });
});

describe('SessionRepository.save / getById', () => {
  let db: OpenedDB;
  let repo: SessionRepository;

  beforeEach(async () => {
    const dbName = `exercise-tracker-test-${Date.now()}-${Math.random()}`;
    db = await openDB({ name: dbName });
    repo = createSessionRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  const sampleSession: Session = {
    id: 'session-1',
    startedAt: '2026-05-26T10:00:00.000Z',
    createdAt: '2026-05-26T10:00:00.000Z',
    updatedAt: '2026-05-26T10:00:00.000Z',
    exercises: [
      {
        id: 'ex-1',
        typeId: 'press-banca',
        order: 0,
        shape: 'strength',
        sets: [
          { id: 'set-1', reps: 8, weightKg: 60 },
          { id: 'set-2', reps: 6, weightKg: 65 },
        ],
      },
      {
        id: 'ex-2',
        typeId: 'correr',
        order: 1,
        shape: 'cardio',
        cardio: { durationMinutes: 20, distanceKm: 3.5 },
      },
    ],
  };

  it('save() persists a session and getById() retrieves a deeply-equal copy', async () => {
    await repo.save(sampleSession);

    const retrieved = await repo.getById(sampleSession.id);

    expect(retrieved).toEqual(sampleSession);
    expect(retrieved).not.toBe(sampleSession);
  });

  it('getById() returns undefined when the id does not exist', async () => {
    const result = await repo.getById('no-existe');

    expect(result).toBeUndefined();
  });
});

describe('SessionRepository.list', () => {
  let db: OpenedDB;
  let repo: SessionRepository;

  beforeEach(async () => {
    const dbName = `exercise-tracker-test-${Date.now()}-${Math.random()}`;
    db = await openDB({ name: dbName });
    repo = createSessionRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  function makeSession(id: string, startedAt: string): Session {
    return {
      id,
      startedAt,
      createdAt: startedAt,
      updatedAt: startedAt,
      exercises: [],
    };
  }

  it('returns [] when there are no sessions', async () => {
    const result = await repo.list();

    expect(result).toEqual([]);
  });

  it('returns sessions ordered by startedAt descending (newest first)', async () => {
    const oldest = makeSession('s-old', '2026-03-01T08:00:00.000Z');
    const middle = makeSession('s-mid', '2026-04-15T18:30:00.000Z');
    const newest = makeSession('s-new', '2026-05-26T10:00:00.000Z');

    // Insert in non-chronological order to exercise the index-based sorting.
    await repo.save(middle);
    await repo.save(oldest);
    await repo.save(newest);

    const result = await repo.list();

    expect(result.map((s) => s.id)).toEqual(['s-new', 's-mid', 's-old']);
  });
});

describe('SessionRepository.update', () => {
  let db: OpenedDB;
  let repo: SessionRepository;

  beforeEach(async () => {
    const dbName = `exercise-tracker-test-${Date.now()}-${Math.random()}`;
    db = await openDB({ name: dbName });
    repo = createSessionRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('sets updatedAt to the injected clock, preserves createdAt and persists the changes', async () => {
    const t1 = '2026-05-01T10:00:00.000Z';
    const t2 = new Date('2026-05-26T15:30:00.000Z');

    const original: Session = {
      id: 's-1',
      startedAt: t1,
      createdAt: t1,
      updatedAt: t1,
      exercises: [],
    };
    await repo.save(original);

    const modified: Session = {
      ...original,
      exercises: [
        {
          id: 'ex-1',
          typeId: 'press-banca',
          order: 0,
          shape: 'strength',
          sets: [{ id: 'set-1', reps: 5, weightKg: 70 }],
        },
      ],
    };
    await repo.update(modified, t2);

    const persisted = await repo.getById('s-1');

    expect(persisted?.updatedAt).toBe(t2.toISOString());
    expect(persisted?.createdAt).toBe(t1);
    expect(persisted?.exercises).toHaveLength(1);
    expect(persisted?.exercises[0]).toMatchObject({ id: 'ex-1', shape: 'strength' });
  });

  it('ignores the incoming updatedAt and always overrides it with the injected clock', async () => {
    const t1 = '2026-05-01T10:00:00.000Z';
    const t2 = new Date('2026-05-26T15:30:00.000Z');

    const session: Session = {
      id: 's-2',
      startedAt: t1,
      createdAt: t1,
      updatedAt: t1,
      exercises: [],
    };
    await repo.save(session);

    // The caller passes a tampered updatedAt far in the future — the repo must ignore it.
    const tampered: Session = { ...session, updatedAt: '2099-12-31T23:59:59.000Z' };
    await repo.update(tampered, t2);

    const persisted = await repo.getById('s-2');
    expect(persisted?.updatedAt).toBe(t2.toISOString());
  });
});

describe('SessionRepository.delete', () => {
  let db: OpenedDB;
  let repo: SessionRepository;

  beforeEach(async () => {
    const dbName = `exercise-tracker-test-${Date.now()}-${Math.random()}`;
    db = await openDB({ name: dbName });
    repo = createSessionRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  function makeSession(id: string, startedAt: string): Session {
    return {
      id,
      startedAt,
      createdAt: startedAt,
      updatedAt: startedAt,
      exercises: [],
    };
  }

  it('deletes the session by id; subsequent getById returns undefined', async () => {
    const session = makeSession('s-1', '2026-05-26T10:00:00.000Z');
    await repo.save(session);

    await repo.delete('s-1');

    expect(await repo.getById('s-1')).toBeUndefined();
  });

  it('list() does not include the deleted session and keeps the rest', async () => {
    const a = makeSession('s-a', '2026-03-01T08:00:00.000Z');
    const b = makeSession('s-b', '2026-04-15T18:30:00.000Z');
    const c = makeSession('s-c', '2026-05-26T10:00:00.000Z');
    await repo.save(a);
    await repo.save(b);
    await repo.save(c);

    await repo.delete('s-b');

    const result = await repo.list();
    expect(result.map((s) => s.id)).toEqual(['s-c', 's-a']);
  });

  it('deleting a non-existent id does not throw and leaves the rest intact', async () => {
    const session = makeSession('s-1', '2026-05-26T10:00:00.000Z');
    await repo.save(session);

    await expect(repo.delete('no-existe')).resolves.toBeUndefined();
    expect(await repo.getById('s-1')).toEqual(session);
  });
});

describe('SessionRepository.exportAll', () => {
  let db: OpenedDB;
  let repo: SessionRepository;

  beforeEach(async () => {
    const dbName = `exercise-tracker-test-${Date.now()}-${Math.random()}`;
    db = await openDB({ name: dbName });
    repo = createSessionRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  function makeSession(id: string, startedAt: string): Session {
    return {
      id,
      startedAt,
      createdAt: startedAt,
      updatedAt: startedAt,
      exercises: [],
    };
  }

  it('with an empty DB returns { version: 3, exportedAt, sessions: [], healthDays: [], profile: null, weightEntries: [] }', async () => {
    const now = new Date('2026-05-26T15:30:00.000Z');

    const payload = await repo.exportAll(now);

    expect(payload).toEqual<ExportPayload>({
      version: 3,
      exportedAt: now.toISOString(),
      sessions: [],
      healthDays: [],
      profile: null,
      weightEntries: [],
    });
  });

  it('returns sessions equal to list() (descending order by startedAt)', async () => {
    const a = makeSession('s-a', '2026-03-01T08:00:00.000Z');
    const b = makeSession('s-b', '2026-04-15T18:30:00.000Z');
    const c = makeSession('s-c', '2026-05-26T10:00:00.000Z');
    await repo.save(a);
    await repo.save(b);
    await repo.save(c);

    const now = new Date('2026-05-26T15:30:00.000Z');
    const payload = await repo.exportAll(now);
    const listed = await repo.list();

    expect(payload.version).toBe(3);
    expect(payload.exportedAt).toBe(now.toISOString());
    expect(payload.sessions).toEqual(listed);
    expect(payload.sessions.map((s) => s.id)).toEqual(['s-c', 's-b', 's-a']);
  });
});

describe('SessionRepository.importAll', () => {
  let db: OpenedDB;
  let repo: SessionRepository;

  beforeEach(async () => {
    const dbName = `exercise-tracker-test-${Date.now()}-${Math.random()}`;
    db = await openDB({ name: dbName });
    repo = createSessionRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  function makeSession(id: string, startedAt: string): Session {
    return {
      id,
      startedAt,
      createdAt: startedAt,
      updatedAt: startedAt,
      exercises: [],
    };
  }

  it('replaces the current contents with the sessions from the payload', async () => {
    const existing = makeSession('s-old', '2026-01-01T08:00:00.000Z');
    await repo.save(existing);

    const incoming = [
      makeSession('s-new-a', '2026-03-01T10:00:00.000Z'),
      makeSession('s-new-b', '2026-05-15T18:30:00.000Z'),
    ];
    const payload = {
      version: 1,
      exportedAt: '2026-05-26T15:30:00.000Z',
      sessions: incoming,
    };

    await repo.importAll(payload);

    expect(await repo.getById('s-old')).toBeUndefined();
    const listed = await repo.list();
    expect(listed.map((s) => s.id)).toEqual(['s-new-b', 's-new-a']);
  });

  it('throws UnsupportedImportVersionError when version is not 1 or 2', async () => {
    const payload = {
      version: 999,
      exportedAt: '2026-05-26T15:30:00.000Z',
      sessions: [],
    };

    await expect(repo.importAll(payload)).rejects.toBeInstanceOf(UnsupportedImportVersionError);
  });

  it('throws InvalidImportPayloadError when the "sessions" field is missing', async () => {
    const payload = {
      version: 1,
      exportedAt: '2026-05-26T15:30:00.000Z',
    };

    await expect(repo.importAll(payload)).rejects.toBeInstanceOf(InvalidImportPayloadError);
  });

  it('throws InvalidImportPayloadError when the payload is not an object', async () => {
    await expect(repo.importAll(null)).rejects.toBeInstanceOf(InvalidImportPayloadError);
    await expect(repo.importAll('not-an-object')).rejects.toBeInstanceOf(InvalidImportPayloadError);
  });
});

describe('SessionRepository backup v2 (F4-T006)', () => {
  let db: OpenedDB;
  let repo: SessionRepository;

  beforeEach(async () => {
    const dbName = `exercise-tracker-test-${Date.now()}-${Math.random()}`;
    db = await openDB({ name: dbName });
    repo = createSessionRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  function makeSession(id: string, startedAt: string): Session {
    return { id, startedAt, createdAt: startedAt, updatedAt: startedAt, exercises: [] };
  }

  it('exportAll includes healthDays from the store', async () => {
    await repo.upsertHealthDays([{ date: '2026-05-25', steps: 8423, distanceKm: 6.21 }]);

    const payload = await repo.exportAll(new Date('2026-05-26T15:30:00.000Z'));

    expect(payload.healthDays).toEqual([{ date: '2026-05-25', steps: 8423, distanceKm: 6.21 }]);
  });

  it('importAll v2 replaces sessions and health days', async () => {
    await repo.save(makeSession('s-old', '2026-01-01T08:00:00.000Z'));
    await repo.upsertHealthDays([{ date: '2026-01-01', steps: 1, distanceKm: 0.1 }]);

    await repo.importAll({
      version: 2,
      exportedAt: '2026-05-26T15:30:00.000Z',
      sessions: [makeSession('s-new', '2026-05-01T10:00:00.000Z')],
      healthDays: [{ date: '2026-05-01', steps: 9000, distanceKm: 7 }],
    });

    expect((await repo.list()).map((s) => s.id)).toEqual(['s-new']);
    expect(await repo.listHealthDays()).toEqual([
      { date: '2026-05-01', steps: 9000, distanceKm: 7 },
    ]);
  });

  it('importAll still accepts a v1 payload (sessions only) without error', async () => {
    await repo.importAll({
      version: 1,
      exportedAt: '2026-05-26T15:30:00.000Z',
      sessions: [makeSession('s-1', '2026-05-01T10:00:00.000Z')],
    });

    expect((await repo.list()).map((s) => s.id)).toEqual(['s-1']);
  });

  it('importAll v2 throws when healthDays is missing or not an array', async () => {
    await expect(
      repo.importAll({ version: 2, exportedAt: '', sessions: [] }),
    ).rejects.toBeInstanceOf(InvalidImportPayloadError);
    await expect(
      repo.importAll({ version: 2, exportedAt: '', sessions: [], healthDays: 'nope' }),
    ).rejects.toBeInstanceOf(InvalidImportPayloadError);
  });
});

describe('SessionRepository health days (F4-T002)', () => {
  let db: OpenedDB;
  let repo: SessionRepository;

  beforeEach(async () => {
    const dbName = `exercise-tracker-test-${Date.now()}-${Math.random()}`;
    db = await openDB({ name: dbName });
    repo = createSessionRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('stores and lists health days sorted by date ascending', async () => {
    await repo.upsertHealthDays([
      { date: '2026-05-26', steps: 100, distanceKm: 1 },
      { date: '2026-05-24', steps: 50, distanceKm: 0.5 },
    ]);

    const days = await repo.listHealthDays();
    expect(days.map((d) => d.date)).toEqual(['2026-05-24', '2026-05-26']);
  });

  it('upserts: re-importing the same date overwrites instead of duplicating', async () => {
    await repo.upsertHealthDays([{ date: '2026-05-26', steps: 100, distanceKm: 1 }]);
    await repo.upsertHealthDays([{ date: '2026-05-26', steps: 9000, distanceKm: 7 }]);

    const days = await repo.listHealthDays();
    expect(days).toHaveLength(1);
    expect(days[0].steps).toBe(9000);
  });

  it('clearHealthDays empties the store without touching sessions', async () => {
    await repo.save({
      id: 's1',
      startedAt: '2026-05-26T10:00:00.000Z',
      createdAt: '2026-05-26T10:00:00.000Z',
      updatedAt: '2026-05-26T10:00:00.000Z',
      exercises: [],
    });
    await repo.upsertHealthDays([{ date: '2026-05-26', steps: 100, distanceKm: 1 }]);

    await repo.clearHealthDays();

    expect(await repo.listHealthDays()).toEqual([]);
    expect(await repo.list()).toHaveLength(1);
  });

  it('opens cleanly upgrading from a v1 database (sessions preserved)', async () => {
    const name = `exercise-tracker-test-${Date.now()}-${Math.random()}`;
    const v1 = await idbOpenDB(name, 1, {
      upgrade(database) {
        const store = database.createObjectStore('sessions', { keyPath: 'id' });
        store.createIndex('startedAt', 'startedAt');
      },
    });
    await v1.put('sessions', {
      id: 's1',
      startedAt: '2026-05-26T10:00:00.000Z',
      createdAt: '2026-05-26T10:00:00.000Z',
      updatedAt: '2026-05-26T10:00:00.000Z',
      exercises: [],
    });
    v1.close();

    const upgraded = await openDB({ name });
    expect(upgraded.objectStoreNames.contains('healthDays')).toBe(true);
    const upgradedRepo = createSessionRepository(upgraded);
    expect(await upgradedRepo.list()).toHaveLength(1);
    upgraded.close();
  });
});

describe('SessionRepository user profile (F6-T006)', () => {
  let db: OpenedDB;
  let repo: SessionRepository;

  beforeEach(async () => {
    const dbName = `exercise-tracker-test-${Date.now()}-${Math.random()}`;
    db = await openDB({ name: dbName });
    repo = createSessionRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('returns null when no profile is stored', async () => {
    expect(await repo.getProfile()).toBeNull();
  });

  it('stores and reads back a profile (without exposing the internal id)', async () => {
    await repo.setProfile({ heightCm: 175, birthdate: '1990-05-26', sex: 'male' });
    const stored = await repo.getProfile();
    expect(stored).toEqual({ heightCm: 175, birthdate: '1990-05-26', sex: 'male' });
    expect(stored && 'id' in stored).toBe(false);
  });

  it('setProfile overwrites the existing profile', async () => {
    await repo.setProfile({ heightCm: 175, birthdate: '1990-05-26', sex: 'male' });
    await repo.setProfile({ heightCm: 180, birthdate: '1985-01-01', sex: 'female' });
    expect(await repo.getProfile()).toEqual({
      heightCm: 180,
      birthdate: '1985-01-01',
      sex: 'female',
    });
  });

  it('clearProfile removes the stored profile', async () => {
    await repo.setProfile({ heightCm: 175, birthdate: '1990-05-26', sex: 'male' });
    await repo.clearProfile();
    expect(await repo.getProfile()).toBeNull();
  });

  it('upgrades cleanly from v2 keeping sessions and healthDays intact', async () => {
    const name = `exercise-tracker-test-${Date.now()}-${Math.random()}`;
    const v2 = await idbOpenDB(name, 2, {
      upgrade(database) {
        const sessions = database.createObjectStore('sessions', { keyPath: 'id' });
        sessions.createIndex('startedAt', 'startedAt');
        database.createObjectStore('healthDays', { keyPath: 'date' });
      },
    });
    await v2.put('sessions', {
      id: 's1',
      startedAt: '2026-05-26T10:00:00.000Z',
      createdAt: '2026-05-26T10:00:00.000Z',
      updatedAt: '2026-05-26T10:00:00.000Z',
      exercises: [],
    });
    await v2.put('healthDays', { date: '2026-05-26', steps: 100, distanceKm: 1 });
    v2.close();

    const upgraded = await openDB({ name });
    expect(upgraded.objectStoreNames.contains('userProfile')).toBe(true);
    const upgradedRepo = createSessionRepository(upgraded);
    expect(await upgradedRepo.list()).toHaveLength(1);
    expect(await upgradedRepo.listHealthDays()).toHaveLength(1);
    expect(await upgradedRepo.getProfile()).toBeNull();
    upgraded.close();
  });
});

describe('SessionRepository backup v3 (F6-T008)', () => {
  let db: OpenedDB;
  let repo: SessionRepository;

  beforeEach(async () => {
    const dbName = `exercise-tracker-test-${Date.now()}-${Math.random()}`;
    db = await openDB({ name: dbName });
    repo = createSessionRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  function makeSession(id: string, startedAt: string): Session {
    return { id, startedAt, createdAt: startedAt, updatedAt: startedAt, exercises: [] };
  }

  it('exportAll returns version 3 including profile and weightEntries', async () => {
    await repo.setProfile({ heightCm: 175, birthdate: '1990-05-26', sex: 'male' });
    await repo.addWeightEntry({ id: 'w1', recordedAt: '2026-05-28T08:00:00', weightKg: 75 });

    const payload = await repo.exportAll(new Date('2026-05-28T15:30:00.000Z'));

    expect(payload.version).toBe(3);
    expect(payload.profile).toEqual({ heightCm: 175, birthdate: '1990-05-26', sex: 'male' });
    expect(payload.weightEntries).toEqual([
      { id: 'w1', recordedAt: '2026-05-28T08:00:00', weightKg: 75 },
    ]);
  });

  it('importAll v3 replaces sessions, health days, profile and weights', async () => {
    await repo.save(makeSession('s-old', '2026-01-01T08:00:00.000Z'));
    await repo.upsertHealthDays([{ date: '2026-01-01', steps: 1, distanceKm: 0.1 }]);
    await repo.setProfile({ heightCm: 170, birthdate: '1985-01-01', sex: 'female' });
    await repo.addWeightEntry({ id: 'old', recordedAt: '2026-01-01T08:00:00', weightKg: 70 });

    await repo.importAll({
      version: 3,
      exportedAt: '2026-05-28T15:30:00.000Z',
      sessions: [makeSession('s-new', '2026-05-01T10:00:00.000Z')],
      healthDays: [{ date: '2026-05-01', steps: 9000, distanceKm: 7 }],
      profile: { heightCm: 175, birthdate: '1990-05-26', sex: 'male' },
      weightEntries: [{ id: 'new', recordedAt: '2026-05-28T08:00:00', weightKg: 75 }],
    });

    expect((await repo.list()).map((s) => s.id)).toEqual(['s-new']);
    expect(await repo.listHealthDays()).toEqual([
      { date: '2026-05-01', steps: 9000, distanceKm: 7 },
    ]);
    expect(await repo.getProfile()).toEqual({
      heightCm: 175,
      birthdate: '1990-05-26',
      sex: 'male',
    });
    expect(await repo.listWeightEntries()).toEqual([
      { id: 'new', recordedAt: '2026-05-28T08:00:00', weightKg: 75 },
    ]);
  });

  it('importAll v3 with profile=null clears the stored profile', async () => {
    await repo.setProfile({ heightCm: 175, birthdate: '1990-05-26', sex: 'male' });

    await repo.importAll({
      version: 3,
      exportedAt: '',
      sessions: [],
      healthDays: [],
      profile: null,
      weightEntries: [],
    });

    expect(await repo.getProfile()).toBeNull();
  });

  it('importAll still accepts a v2 payload without touching profile/weights', async () => {
    await repo.setProfile({ heightCm: 175, birthdate: '1990-05-26', sex: 'male' });
    await repo.addWeightEntry({ id: 'w1', recordedAt: '2026-05-28T08:00:00', weightKg: 75 });

    await repo.importAll({
      version: 2,
      exportedAt: '',
      sessions: [],
      healthDays: [{ date: '2026-05-01', steps: 9000, distanceKm: 7 }],
    });

    expect(await repo.getProfile()).toEqual({
      heightCm: 175,
      birthdate: '1990-05-26',
      sex: 'male',
    });
    expect(await repo.listWeightEntries()).toHaveLength(1);
  });

  it('importAll still accepts a v1 payload without touching profile/weights', async () => {
    await repo.setProfile({ heightCm: 175, birthdate: '1990-05-26', sex: 'male' });
    await repo.addWeightEntry({ id: 'w1', recordedAt: '2026-05-28T08:00:00', weightKg: 75 });

    await repo.importAll({
      version: 1,
      exportedAt: '',
      sessions: [],
    });

    expect(await repo.getProfile()).toEqual({
      heightCm: 175,
      birthdate: '1990-05-26',
      sex: 'male',
    });
    expect(await repo.listWeightEntries()).toHaveLength(1);
  });

  it('importAll v3 throws when weightEntries is missing or not an array', async () => {
    const base = {
      version: 3,
      exportedAt: '',
      sessions: [],
      healthDays: [],
      profile: null,
    };
    await expect(repo.importAll(base)).rejects.toBeInstanceOf(InvalidImportPayloadError);
    await expect(repo.importAll({ ...base, weightEntries: 'nope' })).rejects.toBeInstanceOf(
      InvalidImportPayloadError,
    );
  });

  it('importAll v3 throws when profile is neither null nor a valid object', async () => {
    const base = {
      version: 3,
      exportedAt: '',
      sessions: [],
      healthDays: [],
      weightEntries: [],
    };
    await expect(repo.importAll({ ...base, profile: 'invalid' })).rejects.toBeInstanceOf(
      InvalidImportPayloadError,
    );
    await expect(repo.importAll({ ...base, profile: 123 })).rejects.toBeInstanceOf(
      InvalidImportPayloadError,
    );
  });

  it('rejects an unsupported version (e.g. 99)', async () => {
    await expect(
      repo.importAll({ version: 99, exportedAt: '', sessions: [] }),
    ).rejects.toBeInstanceOf(UnsupportedImportVersionError);
  });
});

describe('SessionRepository weight entries (F6-T007)', () => {
  let db: OpenedDB;
  let repo: SessionRepository;

  beforeEach(async () => {
    const dbName = `exercise-tracker-test-${Date.now()}-${Math.random()}`;
    db = await openDB({ name: dbName });
    repo = createSessionRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('returns an empty list when no weight entries exist', async () => {
    expect(await repo.listWeightEntries()).toEqual([]);
  });

  it('addWeightEntry persists and listWeightEntries returns them sorted by recordedAt asc', async () => {
    await repo.addWeightEntry({ id: 'b', recordedAt: '2026-05-28T20:00:00', weightKg: 75.5 });
    await repo.addWeightEntry({ id: 'a', recordedAt: '2026-05-28T08:00:00', weightKg: 75.0 });
    await repo.addWeightEntry({ id: 'c', recordedAt: '2026-05-29T08:00:00', weightKg: 76.0 });

    const entries = await repo.listWeightEntries();
    expect(entries.map((e) => e.id)).toEqual(['a', 'b', 'c']);
  });

  it('addWeightEntry with an existing id overwrites (put semantics)', async () => {
    await repo.addWeightEntry({ id: 'a', recordedAt: '2026-05-28T08:00:00', weightKg: 75.0 });
    await repo.addWeightEntry({ id: 'a', recordedAt: '2026-05-28T08:00:00', weightKg: 80.0 });

    const entries = await repo.listWeightEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].weightKg).toBe(80.0);
  });

  it('updateWeightEntry changes recordedAt and weightKg while preserving id', async () => {
    await repo.addWeightEntry({ id: 'a', recordedAt: '2026-05-28T08:00:00', weightKg: 75.0 });
    await repo.updateWeightEntry('a', { recordedAt: '2026-05-29T09:00:00', weightKg: 76.2 });

    const entries = await repo.listWeightEntries();
    expect(entries).toEqual([{ id: 'a', recordedAt: '2026-05-29T09:00:00', weightKg: 76.2 }]);
  });

  it('updateWeightEntry throws when the id does not exist', async () => {
    await expect(
      repo.updateWeightEntry('missing', { recordedAt: '2026-05-28T08:00:00', weightKg: 75 }),
    ).rejects.toThrow();
  });

  it('deleteWeightEntry removes the entry', async () => {
    await repo.addWeightEntry({ id: 'a', recordedAt: '2026-05-28T08:00:00', weightKg: 75.0 });
    await repo.deleteWeightEntry('a');
    expect(await repo.listWeightEntries()).toEqual([]);
  });

  it('deleteWeightEntry is a no-op for an unknown id', async () => {
    await expect(repo.deleteWeightEntry('missing')).resolves.toBeUndefined();
  });

  it('allows multiple entries on the same local day', async () => {
    await repo.addWeightEntry({ id: 'a', recordedAt: '2026-05-28T08:00:00', weightKg: 75.0 });
    await repo.addWeightEntry({ id: 'b', recordedAt: '2026-05-28T20:00:00', weightKg: 76.0 });

    const entries = await repo.listWeightEntries();
    expect(entries).toHaveLength(2);
  });
});

describe('openDB when IndexedDB is unavailable', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('throws IndexedDBUnavailableError if globalThis.indexedDB is undefined', async () => {
    vi.stubGlobal('indexedDB', undefined);

    await expect(openDB({ name: 'irrelevant' })).rejects.toBeInstanceOf(IndexedDBUnavailableError);
  });
});
