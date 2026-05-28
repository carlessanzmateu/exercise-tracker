import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import type { UserProfile } from '@/domain/profile/userProfile';
import type { WeightEntry } from '@/domain/weight/weightEntry';

import { BmrHeader } from './BmrHeader';

const PROFILE: UserProfile = {
  heightCm: 175,
  birthdate: '1990-05-26',
  sex: 'male',
};

const TODAY = () => new Date(2026, 4, 28); // 28 may 2026

describe('<BmrHeader />', () => {
  it('renders nothing when there are no entries', () => {
    const { container } = render(<BmrHeader profile={PROFILE} entries={[]} now={TODAY} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the BMR rounded to the nearest integer when there is at least one entry', () => {
    const entries: WeightEntry[] = [{ id: 'a', recordedAt: '2026-05-28T08:00:00', weightKg: 75 }];
    // Age on 28-may-2026 for birthdate 1990-05-26 = 36.
    // 10*75 + 6.25*175 - 5*36 + 5 = 1668.75 → display 1669.
    render(<BmrHeader profile={PROFILE} entries={entries} now={TODAY} />);
    expect(screen.getByText(/1669/)).toBeInTheDocument();
    expect(screen.getByText(/kcal\/d[ií]a/i)).toBeInTheDocument();
  });

  it('uses the most recent entry as the latest weight', () => {
    const entries: WeightEntry[] = [
      { id: 'old', recordedAt: '2026-05-20T08:00:00', weightKg: 80 },
      { id: 'new', recordedAt: '2026-05-28T08:00:00', weightKg: 75 },
    ];
    render(<BmrHeader profile={PROFILE} entries={entries} now={TODAY} />);
    // Must use 75 (the most recent) → 1669 as above.
    expect(screen.getByText(/1669/)).toBeInTheDocument();
  });

  it('shows the latest weight as a hint', () => {
    const entries: WeightEntry[] = [{ id: 'a', recordedAt: '2026-05-28T08:00:00', weightKg: 75.3 }];
    render(<BmrHeader profile={PROFILE} entries={entries} now={TODAY} />);
    expect(screen.getByText(/75\.3 kg/)).toBeInTheDocument();
  });

  it('uses the injected now() for the age calculation', () => {
    // On 2026-05-25 the birthday (26-may) has NOT yet happened → age=35.
    // 10*75 + 6.25*175 - 5*35 + 5 = 1673.75 → 1674.
    const before = () => new Date(2026, 4, 25);
    const entries: WeightEntry[] = [{ id: 'a', recordedAt: '2026-05-25T08:00:00', weightKg: 75 }];
    render(<BmrHeader profile={PROFILE} entries={entries} now={before} />);
    expect(screen.getByText(/1674/)).toBeInTheDocument();
  });
});
