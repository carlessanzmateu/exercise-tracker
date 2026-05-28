import { Link, useLocation } from 'react-router-dom';

function ListIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M3 6h18 M3 12h18 M3 18h18" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M12 5v14 M5 12h14" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="3" strokeWidth="2" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path d="M4 20V10 M10 20V4 M16 20v-7 M22 20H3" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        d="M6 4h12 M12 4v3 M5 7h14l-2 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 7z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TabBar() {
  const { pathname } = useLocation();

  const feedActive = pathname === '/' || pathname.startsWith('/session/');
  const progressActive = pathname === '/progress';
  const weightActive = pathname === '/weight';
  const settingsActive = pathname === '/settings';

  return (
    <nav className="tab-bar" aria-label="Navegación principal">
      <Link
        to="/"
        className={`tab-bar__item${feedActive ? ' tab-bar__item--active' : ''}`}
        aria-current={feedActive ? 'page' : undefined}
      >
        <ListIcon />
        <span>Entrenamientos</span>
      </Link>
      <Link
        to="/new"
        className="tab-bar__item tab-bar__item--add"
        aria-label="Añadir entrenamiento"
      >
        <PlusIcon />
      </Link>
      <Link
        to="/progress"
        className={`tab-bar__item${progressActive ? ' tab-bar__item--active' : ''}`}
        aria-current={progressActive ? 'page' : undefined}
      >
        <ChartIcon />
        <span>Progreso</span>
      </Link>
      <Link
        to="/weight"
        className={`tab-bar__item${weightActive ? ' tab-bar__item--active' : ''}`}
        aria-current={weightActive ? 'page' : undefined}
      >
        <ScaleIcon />
        <span>Peso</span>
      </Link>
      <Link
        to="/settings"
        className={`tab-bar__item${settingsActive ? ' tab-bar__item--active' : ''}`}
        aria-current={settingsActive ? 'page' : undefined}
      >
        <SettingsIcon />
        <span>Ajustes</span>
      </Link>
    </nav>
  );
}
