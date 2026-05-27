import type { Session } from '@/domain/types';

export interface SessionGroup {
  monthKey: string;
  label: string;
  sessions: Session[];
}

const MONTH_FORMATTER = new Intl.DateTimeFormat('es-ES', { month: 'long' });

function monthKeyOf(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function monthLabelOf(date: Date): string {
  const month = MONTH_FORMATTER.format(date);
  const capitalized = month.charAt(0).toUpperCase() + month.slice(1);
  return `${capitalized} ${date.getFullYear()}`;
}

export function groupSessionsByMonth(sessions: Session[]): SessionGroup[] {
  const groups: SessionGroup[] = [];
  const byKey = new Map<string, SessionGroup>();

  for (const session of sessions) {
    const date = new Date(session.startedAt);
    const key = monthKeyOf(date);

    let group = byKey.get(key);
    if (!group) {
      group = { monthKey: key, label: monthLabelOf(date), sessions: [] };
      byKey.set(key, group);
      groups.push(group);
    }
    group.sessions.push(session);
  }

  return groups;
}
