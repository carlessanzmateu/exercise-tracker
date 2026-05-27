import { personalRecords } from '@/domain/metrics/personalRecords';
import { formatSessionDate } from '@/features/feed/formatSessionDate';
import type { Session } from '@/domain/types';

export function PersonalRecordsPanel({ sessions }: { sessions: Session[] }) {
  const records = personalRecords(sessions);

  if (records.length === 0) {
    return <p className="chart-empty">Aún no hay records con peso registrados.</p>;
  }

  const round = (n: number) => Math.round(n);

  return (
    <ul className="pr-list">
      {records.map((pr) => (
        <li key={pr.typeId} data-pr={pr.typeId} className="card pr-card">
          <h4 className="pr-card__name">{pr.name}</h4>
          <p className="pr-card__line">
            Mejor peso: {round(pr.bestWeightKg)} kg · {formatSessionDate(pr.bestWeightAt)}
          </p>
          <p className="pr-card__line">
            Mejor 1RM est.: {round(pr.bestOneRepMax)} kg · {formatSessionDate(pr.bestOneRepMaxAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
