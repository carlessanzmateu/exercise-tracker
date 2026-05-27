import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { RepositoryProvider } from '@/data/RepositoryProvider';
import { createMockRepo } from '@/test/createMockRepo';

import App from './App';

function renderAt(path: string, repo = createMockRepo()) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <RepositoryProvider repo={repo}>
        <App />
      </RepositoryProvider>
    </MemoryRouter>,
  );
}

describe('<App />', () => {
  it('renders the "Exercise Tracker" heading', () => {
    renderAt('/');
    expect(
      screen.getByRole('heading', { level: 1, name: /exercise tracker/i }),
    ).toBeInTheDocument();
  });

  it('renders a <main> landmark wrapping the primary content', () => {
    renderAt('/');
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders the TabBar navigation', () => {
    renderAt('/');
    expect(screen.getByRole('navigation', { name: /navegación principal/i })).toBeInTheDocument();
  });

  it('the h1 "Exercise Tracker" is present in the DOM (accessible) but visually hidden', () => {
    renderAt('/');
    const h1 = screen.getByRole('heading', { level: 1, name: /exercise tracker/i });
    expect(h1.className).toContain('sr-only');
  });
});

describe('<App /> routing', () => {
  it('at "/" renders the Feed screen', async () => {
    renderAt('/');
    expect(await screen.findByTestId('route-feed')).toBeInTheDocument();
  });

  it('at "/new" renders the New Session screen', () => {
    renderAt('/new');
    expect(screen.getByTestId('route-new-session')).toBeInTheDocument();
  });

  it('at "/session/:id" renders the Session Detail screen', async () => {
    renderAt('/session/abc-123');
    expect(await screen.findByTestId('route-session-detail')).toBeInTheDocument();
  });

  it('at "/settings" renders the Settings screen', () => {
    renderAt('/settings');
    expect(screen.getByTestId('route-settings')).toBeInTheDocument();
  });

  it('at "/progress" renders the Progress screen', async () => {
    renderAt('/progress');
    expect(await screen.findByTestId('route-progress')).toBeInTheDocument();
  });
});
