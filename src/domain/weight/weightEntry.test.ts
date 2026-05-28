import { describe, expect, it } from 'vitest';

import { normalizeWeightEntry } from './weightEntry';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('normalizeWeightEntry', () => {
  it('normalizes a valid entry', () => {
    const result = normalizeWeightEntry({
      id: '11111111-1111-1111-1111-111111111111',
      recordedAt: '2026-05-28T08:30:00',
      weightKg: 75.3,
    });
    expect(result).toEqual({
      id: '11111111-1111-1111-1111-111111111111',
      recordedAt: '2026-05-28T08:30:00',
      weightKg: 75.3,
    });
  });

  it('rounds weightKg to 1 decimal', () => {
    const result = normalizeWeightEntry({
      id: 'x',
      recordedAt: '2026-05-28T08:30:00',
      weightKg: 75.349,
    });
    expect(result?.weightKg).toBe(75.3);

    const result2 = normalizeWeightEntry({
      id: 'x',
      recordedAt: '2026-05-28T08:30:00',
      weightKg: 75.36,
    });
    expect(result2?.weightKg).toBe(75.4);
  });

  it('returns null when weightKg is missing, <= 0, or non-finite', () => {
    const base = { id: 'x', recordedAt: '2026-05-28T08:30:00' };
    expect(normalizeWeightEntry({ ...base })).toBeNull();
    expect(normalizeWeightEntry({ ...base, weightKg: 0 })).toBeNull();
    expect(normalizeWeightEntry({ ...base, weightKg: -1 })).toBeNull();
    expect(normalizeWeightEntry({ ...base, weightKg: Number.POSITIVE_INFINITY })).toBeNull();
    expect(normalizeWeightEntry({ ...base, weightKg: Number.NaN })).toBeNull();
    expect(normalizeWeightEntry({ ...base, weightKg: '75' })).toBeNull();
  });

  it('returns null when recordedAt is missing or unparseable', () => {
    const base = { id: 'x', weightKg: 75 };
    expect(normalizeWeightEntry({ ...base })).toBeNull();
    expect(normalizeWeightEntry({ ...base, recordedAt: 'not-a-date' })).toBeNull();
    expect(normalizeWeightEntry({ ...base, recordedAt: '' })).toBeNull();
    expect(normalizeWeightEntry({ ...base, recordedAt: 123 })).toBeNull();
  });

  it('keeps a provided id when non-empty', () => {
    const result = normalizeWeightEntry({
      id: 'my-custom-id',
      recordedAt: '2026-05-28T08:30:00',
      weightKg: 75,
    });
    expect(result?.id).toBe('my-custom-id');
  });

  it('generates a UUID when id is missing or empty', () => {
    const generated = normalizeWeightEntry({
      recordedAt: '2026-05-28T08:30:00',
      weightKg: 75,
    });
    expect(generated?.id).toMatch(UUID_RE);

    const empty = normalizeWeightEntry({
      id: '',
      recordedAt: '2026-05-28T08:30:00',
      weightKg: 75,
    });
    expect(empty?.id).toMatch(UUID_RE);
  });
});
