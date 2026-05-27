import { useContext } from 'react';

import { RepositoryContext } from '@/data/repositoryContext';
import type { SessionRepository } from '@/data/sessionRepository';

export function useSessionRepository(): SessionRepository {
  const repo = useContext(RepositoryContext);
  if (!repo) {
    throw new Error('useSessionRepository debe usarse dentro de <RepositoryProvider>');
  }
  return repo;
}
