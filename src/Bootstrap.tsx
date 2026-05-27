import { useEffect, useState } from 'react';

import App from '@/App';
import { RepositoryProvider } from '@/data/RepositoryProvider';
import {
  createSessionRepository,
  IndexedDBUnavailableError,
  openDB,
  type SessionRepository,
} from '@/data/sessionRepository';

export function Bootstrap() {
  const [repo, setRepo] = useState<SessionRepository | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    openDB()
      .then((db) => setRepo(createSessionRepository(db)))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      });
  }, []);

  if (error) {
    const msg =
      error instanceof IndexedDBUnavailableError
        ? 'Tu navegador no soporta IndexedDB. Esta app necesita almacenamiento local para funcionar.'
        : `No se ha podido abrir el almacenamiento local: ${error.message}`;
    return (
      <main className="app-shell">
        <h1>Exercise Tracker</h1>
        <p role="alert">{msg}</p>
      </main>
    );
  }

  if (!repo) {
    return (
      <main className="app-shell" aria-busy="true">
        <h1>Exercise Tracker</h1>
        <p>Cargando…</p>
      </main>
    );
  }

  return (
    <RepositoryProvider repo={repo}>
      <App />
    </RepositoryProvider>
  );
}
