import { describe, it, expect } from 'vitest';

import type { Session } from '@/domain/types';

import { groupSessionsByMonth } from './groupByMonth';

function makeSession(id: string, startedAt: string): Session {
  return {
    id,
    startedAt,
    createdAt: startedAt,
    updatedAt: startedAt,
    exercises: [],
  };
}

describe('groupSessionsByMonth', () => {
  it('returns [] when there are no sessions', () => {
    expect(groupSessionsByMonth([])).toEqual([]);
  });

  it('groups sessions from the same month into a single group, preserving input order', () => {
    const sessions = [
      makeSession('s-1', '2026-05-26T10:00:00.000Z'),
      makeSession('s-2', '2026-05-10T18:30:00.000Z'),
      makeSession('s-3', '2026-05-01T08:00:00.000Z'),
    ];

    const groups = groupSessionsByMonth(sessions);
    expect(groups).toHaveLength(1);
    expect(groups[0]!.sessions.map((s) => s.id)).toEqual(['s-1', 's-2', 's-3']);
  });

  it('keeps groups in order of first appearance (descending input → newest month first)', () => {
    const sessions = [
      makeSession('s-may-1', '2026-05-26T10:00:00.000Z'),
      makeSession('s-may-2', '2026-05-10T10:00:00.000Z'),
      makeSession('s-apr-1', '2026-04-15T10:00:00.000Z'),
      makeSession('s-apr-2', '2026-04-01T10:00:00.000Z'),
    ];

    const groups = groupSessionsByMonth(sessions);
    expect(groups).toHaveLength(2);
    expect(groups[0]!.monthKey).toBe('2026-05');
    expect(groups[0]!.sessions.map((s) => s.id)).toEqual(['s-may-1', 's-may-2']);
    expect(groups[1]!.monthKey).toBe('2026-04');
    expect(groups[1]!.sessions.map((s) => s.id)).toEqual(['s-apr-1', 's-apr-2']);
  });

  it('formats the label with the capitalised Spanish month and year ("Mayo 2026")', () => {
    const groups = groupSessionsByMonth([makeSession('s-1', '2026-05-26T10:00:00.000Z')]);
    expect(groups[0]!.label).toBe('Mayo 2026');
  });

  it('distinguishes months with the same number but different year', () => {
    const sessions = [
      makeSession('s-2026', '2026-05-26T10:00:00.000Z'),
      makeSession('s-2025', '2025-05-26T10:00:00.000Z'),
    ];

    const groups = groupSessionsByMonth(sessions);
    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.label)).toEqual(['Mayo 2026', 'Mayo 2025']);
  });
});
