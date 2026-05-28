import { vi } from 'vitest';

import type { SessionRepository } from '@/data/sessionRepository';

export function createMockRepo(overrides: Partial<SessionRepository> = {}): SessionRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    getById: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    exportAll: vi.fn().mockResolvedValue({
      version: 3,
      exportedAt: '',
      sessions: [],
      healthDays: [],
      profile: null,
      weightEntries: [],
    }),
    importAll: vi.fn().mockResolvedValue(undefined),
    listHealthDays: vi.fn().mockResolvedValue([]),
    upsertHealthDays: vi.fn().mockResolvedValue(undefined),
    clearHealthDays: vi.fn().mockResolvedValue(undefined),
    getProfile: vi.fn().mockResolvedValue(null),
    setProfile: vi.fn().mockResolvedValue(undefined),
    clearProfile: vi.fn().mockResolvedValue(undefined),
    listWeightEntries: vi.fn().mockResolvedValue([]),
    addWeightEntry: vi.fn().mockResolvedValue(undefined),
    updateWeightEntry: vi.fn().mockResolvedValue(undefined),
    deleteWeightEntry: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}
