import { describe, it, expect } from 'vitest';

import { formatSessionDate } from './formatSessionDate';

describe('formatSessionDate', () => {
  it('produces the canonical format for a known date: "Lun 25 may · 10:30"', () => {
    // ISO without offset → parsed as local time; Monday 25 May 2026 at 10:30.
    expect(formatSessionDate('2026-05-25T10:30:00')).toBe('Lun 25 may · 10:30');
  });

  it('capitalises only the weekday (month stays lowercase)', () => {
    const out = formatSessionDate('2026-05-25T10:30:00');
    expect(out.charAt(0)).toBe(out.charAt(0).toUpperCase());
    expect(out).toContain(' may ');
    expect(out).not.toContain(' May ');
  });

  it('uses 24h format with no AM/PM and no seconds', () => {
    const out = formatSessionDate('2026-05-25T18:05:00');
    expect(out).toContain('18:05');
    expect(out).not.toMatch(/am|pm/i);
  });

  it('uses "·" as the separator between date and time', () => {
    const out = formatSessionDate('2026-05-25T10:30:00');
    expect(out).toMatch(/\s·\s/);
  });

  it('formats a different weekday correctly (Tuesday 26 → "Mar 26 may · 09:00")', () => {
    expect(formatSessionDate('2026-05-26T09:00:00')).toBe('Mar 26 may · 09:00');
  });
});
