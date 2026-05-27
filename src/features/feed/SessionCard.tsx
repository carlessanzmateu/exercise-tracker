import type { Session } from '@/domain/types';

import { formatSessionDate } from './formatSessionDate';

function pluralize(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

export function SessionCard({ session }: { session: Session }) {
  const exerciseLabel = pluralize(session.exercises.length, 'ejercicio', 'ejercicios');
  return (
    <article className="card card--interactive session-card-inner">
      <time dateTime={session.startedAt}>{formatSessionDate(session.startedAt)}</time>
      <p className="session-card-meta">{exerciseLabel}</p>
    </article>
  );
}
