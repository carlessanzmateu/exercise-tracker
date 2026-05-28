import { computeTodaysBmr } from '@/domain/metabolism/bmr';
import type { UserProfile } from '@/domain/profile/userProfile';
import type { WeightEntry } from '@/domain/weight/weightEntry';

interface BmrHeaderProps {
  profile: UserProfile;
  entries: WeightEntry[];
  now?: () => Date;
}

const MONTH_NAMES_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

function formatDateHint(recordedAt: string): string {
  const d = new Date(recordedAt);
  if (Number.isNaN(d.getTime())) return recordedAt;
  return `${d.getDate()} ${MONTH_NAMES_SHORT[d.getMonth()]}`;
}

function findLatestEntry(entries: WeightEntry[]): WeightEntry | null {
  if (entries.length === 0) return null;
  let latest = entries[0];
  for (const entry of entries) {
    if (entry.recordedAt > latest.recordedAt) latest = entry;
  }
  return latest;
}

export function BmrHeader({ profile, entries, now = () => new Date() }: BmrHeaderProps) {
  const latest = findLatestEntry(entries);
  if (!latest) return null;

  const bmr = computeTodaysBmr({
    profile,
    latestWeightKg: latest.weightKg,
    today: now(),
  });
  if (bmr === null) return null;

  return (
    <header className="bmr-header">
      <p className="bmr-header__label">Tu BMR de hoy</p>
      <p className="bmr-header__value">
        <span className="bmr-header__number">{Math.round(bmr)}</span>
        <span className="bmr-header__unit"> kcal/día</span>
      </p>
      <p className="bmr-header__hint">
        Basado en tu último peso ({latest.weightKg.toFixed(1)} kg,{' '}
        {formatDateHint(latest.recordedAt)})
      </p>
    </header>
  );
}
