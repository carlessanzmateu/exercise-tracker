import { createContext } from 'react';

import type { SessionRepository } from '@/data/sessionRepository';

export const RepositoryContext = createContext<SessionRepository | null>(null);
