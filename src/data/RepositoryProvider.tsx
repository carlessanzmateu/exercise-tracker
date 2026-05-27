import type { ReactNode } from 'react';

import { RepositoryContext } from '@/data/repositoryContext';
import type { SessionRepository } from '@/data/sessionRepository';

export function RepositoryProvider({
  repo,
  children,
}: {
  repo: SessionRepository;
  children: ReactNode;
}) {
  return <RepositoryContext.Provider value={repo}>{children}</RepositoryContext.Provider>;
}
