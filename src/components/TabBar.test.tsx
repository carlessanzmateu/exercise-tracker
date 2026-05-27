import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { TabBar } from './TabBar';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <TabBar />
    </MemoryRouter>,
  );
}

describe('<TabBar />', () => {
  it('renders a link to the feed (/) with text "Entrenamientos"', () => {
    renderAt('/');
    const link = screen.getByRole('link', { name: /entrenamientos/i });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders a link to /new for adding a session', () => {
    renderAt('/');
    const link = screen.getByRole('link', { name: /añadir entrenamiento/i });
    expect(link).toHaveAttribute('href', '/new');
  });

  it('renders a link to /settings with text "Ajustes"', () => {
    renderAt('/');
    const link = screen.getByRole('link', { name: /ajustes/i });
    expect(link).toHaveAttribute('href', '/settings');
  });

  it('marks the feed tab as active (aria-current="page") when at /', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: /entrenamientos/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('does not mark the settings tab as active when at /', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: /ajustes/i })).not.toHaveAttribute('aria-current');
  });

  it('marks the settings tab as active when at /settings', () => {
    renderAt('/settings');
    expect(screen.getByRole('link', { name: /ajustes/i })).toHaveAttribute('aria-current', 'page');
  });

  it('marks the feed tab as active when drilling into a session (/session/:id)', () => {
    renderAt('/session/abc-123');
    expect(screen.getByRole('link', { name: /entrenamientos/i })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('the add (+) tab has no aria-current at any route', () => {
    for (const path of ['/', '/new', '/settings', '/session/abc-123', '/progress']) {
      const { unmount } = renderAt(path);
      expect(screen.getByRole('link', { name: /añadir entrenamiento/i })).not.toHaveAttribute(
        'aria-current',
      );
      unmount();
    }
  });
});

describe('<TabBar /> progress tab (F3-T011)', () => {
  it('renders a link to /progress with text "Progreso"', () => {
    renderAt('/');
    const link = screen.getByRole('link', { name: /progreso/i });
    expect(link).toHaveAttribute('href', '/progress');
  });

  it('marks the progress tab as active when at /progress', () => {
    renderAt('/progress');
    expect(screen.getByRole('link', { name: /progreso/i })).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark the progress tab as active at /', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: /progreso/i })).not.toHaveAttribute('aria-current');
  });
});
