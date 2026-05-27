import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useSessionRepository } from '@/data/useSessionRepository';
import type { Session } from '@/domain/types';

import { groupSessionsByMonth } from './groupByMonth';
import { SessionCard } from './SessionCard';

export function Feed() {
  const repo = useSessionRepository();
  const [sessions, setSessions] = useState<Session[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    repo.list().then((items) => {
      if (!cancelled) setSessions(items);
    });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  if (sessions === null) {
    return (
      <section data-testid="route-feed" aria-busy="true">
        <p>Cargando…</p>
      </section>
    );
  }

  const groups = groupSessionsByMonth(sessions);

  return (
    <section data-testid="route-feed">
      <h2 className="feed-title">Entrenamientos</h2>
      <Link to="/new" className="btn btn-primary feed-cta">
        Añadir entrenamiento
      </Link>
      {groups.length === 0 ? (
        <p>Aún no hay entrenamientos.</p>
      ) : (
        groups.map((group) => (
          <section key={group.monthKey} className="month-group" data-month-key={group.monthKey}>
            <h3 className="month-heading">{group.label}</h3>
            <ol className="session-list">
              {group.sessions.map((session) => (
                <li key={session.id} data-session-id={session.id} className="session-card">
                  <Link to={`/session/${session.id}`} className="session-card__link">
                    <SessionCard session={session} />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))
      )}
    </section>
  );
}
