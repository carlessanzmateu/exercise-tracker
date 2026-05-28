import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { RepositoryProvider } from '@/data/RepositoryProvider';
import type { SessionRepository } from '@/data/sessionRepository';
import { createMockRepo } from '@/test/createMockRepo';

import { Settings } from './Settings';

function renderSettings(repo: SessionRepository = createMockRepo(), now?: () => Date) {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <RepositoryProvider repo={repo}>
        <Settings now={now} />
      </RepositoryProvider>
    </MemoryRouter>,
  );
}

function renderSettingsWithRoutes(repo: SessionRepository) {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <RepositoryProvider repo={repo}>
        <Routes>
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<div data-testid="feed-route">FEED</div>} />
        </Routes>
      </RepositoryProvider>
    </MemoryRouter>,
  );
}

function makeJsonFile(content: string, name = 'backup.json'): File {
  return new File([content], name, { type: 'application/json' });
}

describe('<Settings />', () => {
  it('renders the "Ajustes" heading', () => {
    renderSettings();
    expect(screen.getByRole('heading', { level: 2, name: /ajustes/i })).toBeInTheDocument();
  });

  it('shows an "Exportar" button', () => {
    renderSettings();
    expect(screen.getByRole('button', { name: /exportar/i })).toBeInTheDocument();
  });

  it('shows an "Importar" control (button or file input)', () => {
    renderSettings();
    expect(screen.getByText(/^importar$/i)).toBeInTheDocument();
  });

  it('shows a notice about local persistence (data only on this device)', () => {
    renderSettings();
    const region = screen.getByTestId('route-settings');
    expect(region.textContent).toMatch(/este dispositivo/i);
    expect(region.textContent).toMatch(/exporta/i);
  });

  it('the notice recommends exporting periodically (T053)', () => {
    renderSettings();
    const region = screen.getByTestId('route-settings');
    expect(region.textContent).toMatch(/periódicamente|periodicamente/i);
  });
});

describe('<Settings /> export JSON (T049)', () => {
  let clickedAnchors: HTMLAnchorElement[];
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    clickedAnchors = [];
    createObjectURLSpy = vi.fn(() => 'blob:mock-url');
    revokeObjectURLSpy = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: createObjectURLSpy,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: revokeObjectURLSpy,
    });
    clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function mockedClick(this: HTMLAnchorElement) {
        clickedAnchors.push(this);
      });
  });

  afterEach(() => {
    clickSpy.mockRestore();
  });

  it('calls repo.exportAll with the injected clock when "Exportar" is clicked', async () => {
    const fixedNow = new Date('2026-05-26T15:30:00');
    const payload = { version: 1 as const, exportedAt: fixedNow.toISOString(), sessions: [] };
    const exportAll = vi.fn().mockResolvedValue(payload);
    const repo = createMockRepo({ exportAll });

    renderSettings(repo, () => fixedNow);
    fireEvent.click(screen.getByRole('button', { name: /exportar/i }));

    await new Promise((r) => setTimeout(r, 0));

    expect(exportAll).toHaveBeenCalledTimes(1);
    expect(exportAll.mock.calls[0]![0]).toEqual(fixedNow);
  });

  it('produces a file named "exercise-tracker-backup-YYYYMMDD-HHmm.json"', async () => {
    const fixedNow = new Date('2026-05-26T15:30:00');
    const payload = { version: 1 as const, exportedAt: fixedNow.toISOString(), sessions: [] };
    const exportAll = vi.fn().mockResolvedValue(payload);
    const repo = createMockRepo({ exportAll });

    renderSettings(repo, () => fixedNow);
    fireEvent.click(screen.getByRole('button', { name: /exportar/i }));

    await new Promise((r) => setTimeout(r, 0));

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    expect(createObjectURLSpy.mock.calls[0]![0]).toBeInstanceOf(Blob);

    expect(clickedAnchors).toHaveLength(1);
    expect(clickedAnchors[0]!.download).toBe('exercise-tracker-backup-20260526-1530.json');
    expect(clickedAnchors[0]!.href).toContain('blob:mock-url');
  });

  it('revokes the Blob URL after triggering the download', async () => {
    const fixedNow = new Date('2026-05-26T15:30:00');
    const repo = createMockRepo({
      exportAll: vi.fn().mockResolvedValue({ version: 1, exportedAt: '', sessions: [] }),
    });

    renderSettings(repo, () => fixedNow);
    fireEvent.click(screen.getByRole('button', { name: /exportar/i }));

    await new Promise((r) => setTimeout(r, 0));

    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });
});

describe('<Settings /> import JSON (T050)', () => {
  const validPayload = JSON.stringify({
    version: 1,
    exportedAt: '2026-05-26T15:30:00.000Z',
    sessions: [
      {
        id: 's-1',
        startedAt: '2026-05-01T10:00:00.000Z',
        createdAt: '2026-05-01T10:00:00.000Z',
        updatedAt: '2026-05-01T10:00:00.000Z',
        exercises: [],
      },
    ],
  });

  it('on confirm with a valid JSON, calls repo.importAll with the payload and navigates to the feed', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const importAll = vi.fn().mockResolvedValue(undefined);
    const repo = createMockRepo({ importAll });
    renderSettingsWithRoutes(repo);

    const input = screen.getByLabelText(/^importar$/i) as HTMLInputElement;
    const file = makeJsonFile(validPayload);
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByTestId('feed-route')).toBeInTheDocument();

    expect(confirmSpy).toHaveBeenCalled();
    expect(importAll).toHaveBeenCalledTimes(1);
    const arg = importAll.mock.calls[0]![0];
    expect(arg).toMatchObject({ version: 1, sessions: [{ id: 's-1' }] });

    confirmSpy.mockRestore();
  });

  it('cancelling the dialog does not call repo.importAll', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const importAll = vi.fn().mockResolvedValue(undefined);
    const repo = createMockRepo({ importAll });
    renderSettingsWithRoutes(repo);

    const input = screen.getByLabelText(/^importar$/i) as HTMLInputElement;
    const file = makeJsonFile(validPayload);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(confirmSpy).toHaveBeenCalled());

    expect(importAll).not.toHaveBeenCalled();
    expect(screen.queryByTestId('feed-route')).not.toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it('a malformed JSON shows an error message and does NOT call repo.importAll', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const importAll = vi.fn().mockResolvedValue(undefined);
    const repo = createMockRepo({ importAll });
    renderSettings(repo);

    const input = screen.getByLabelText(/^importar$/i) as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [makeJsonFile('{ this is not json')] },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(/json/i);
    expect(importAll).not.toHaveBeenCalled();
    expect(confirmSpy).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('a payload with unknown version shows a typed error and does not touch the data', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const importAll = vi.fn().mockRejectedValue(
      Object.assign(new Error('Versión de importación no soportada: 999'), {
        name: 'UnsupportedImportVersionError',
      }),
    );
    const repo = createMockRepo({ importAll });
    renderSettings(repo);

    const input = screen.getByLabelText(/^importar$/i) as HTMLInputElement;
    const payload = JSON.stringify({ version: 999, exportedAt: '', sessions: [] });
    fireEvent.change(input, { target: { files: [makeJsonFile(payload)] } });

    expect(await screen.findByRole('alert')).toHaveTextContent(/versión|no soportada/i);

    confirmSpy.mockRestore();
  });
});

describe('<Settings /> button classes (F2-T003)', () => {
  it('"Exportar" button has class btn-primary', () => {
    render(
      <MemoryRouter>
        <RepositoryProvider repo={createMockRepo()}>
          <Settings />
        </RepositoryProvider>
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /exportar/i })).toHaveClass('btn-primary');
  });

  it('"Importar" label has class btn-secondary', () => {
    render(
      <MemoryRouter>
        <RepositoryProvider repo={createMockRepo()}>
          <Settings />
        </RepositoryProvider>
      </MemoryRouter>,
    );
    const importLabel = screen.getByText(/^importar$/i).closest('label');
    expect(importLabel).toHaveClass('btn-secondary');
  });
});

describe('<Settings /> styling (F2-T011)', () => {
  it('page heading has class "page-title"', () => {
    renderSettings();
    expect(screen.getByRole('heading', { level: 2, name: /ajustes/i })).toHaveClass('page-title');
  });

  it('notice paragraph has class "notice"', () => {
    renderSettings();
    const notice = screen.getByText(/este dispositivo/i);
    expect(notice).toHaveClass('notice');
  });

  it('error message has class "alert-error" when present', async () => {
    renderSettings();
    const input = document.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [makeJsonFile('this is not json')] } });
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveClass('alert-error');
  });
});

describe('<Settings /> health import (F4-T007)', () => {
  function healthInput(): HTMLInputElement {
    const label = screen.getByText(/^importar datos de salud$/i).closest('label')!;
    return label.querySelector('input[type="file"]')!;
  }

  const validHealthJson = JSON.stringify({
    version: 1,
    days: [
      { date: '2026-05-25', steps: 8423, distanceKm: 6.21 },
      { date: '2026-05-26', steps: 9000, distanceKm: 7 },
    ],
  });

  it('imports a valid health JSON and calls upsertHealthDays with the parsed days', async () => {
    const upsertHealthDays = vi.fn().mockResolvedValue(undefined);
    renderSettings(createMockRepo({ upsertHealthDays }));

    fireEvent.change(healthInput(), { target: { files: [makeJsonFile(validHealthJson)] } });

    await waitFor(() => expect(upsertHealthDays).toHaveBeenCalledTimes(1));
    expect(upsertHealthDays).toHaveBeenCalledWith([
      { date: '2026-05-25', steps: 8423, distanceKm: 6.21 },
      { date: '2026-05-26', steps: 9000, distanceKm: 7 },
    ]);
  });

  it('shows a success message with the number of imported days', async () => {
    renderSettings();
    fireEvent.change(healthInput(), { target: { files: [makeJsonFile(validHealthJson)] } });
    expect(await screen.findByText(/2 días/i)).toBeInTheDocument();
  });

  it('shows an alert-error when the file is not valid JSON', async () => {
    renderSettings();
    fireEvent.change(healthInput(), { target: { files: [makeJsonFile('not json')] } });
    expect(await screen.findByRole('alert')).toHaveClass('alert-error');
  });

  it('includes the JSON parse error detail and a content preview when parsing fails', async () => {
    renderSettings();
    const badContent = 'esto no es {json valido}';
    fireEvent.change(healthInput(), { target: { files: [makeJsonFile(badContent)] } });
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/JSON/i);
    expect(alert.textContent).toMatch(/esto no es/);
  });

  it('includes the end of the file and its length when parsing fails on a long file', async () => {
    renderSettings();
    const head = '{"version":2,"samples":[';
    const middle = '{"metric":"steps","date":"2026-05-25","value":62},'.repeat(20);
    const broken = '{"metric":"distance","date":"2026-05-25","value":0.92 km}]';
    const badContent = head + middle + broken;
    fireEvent.change(healthInput(), { target: { files: [makeJsonFile(badContent)] } });
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/0\.92 km/);
    expect(alert.textContent).toMatch(new RegExp(String(badContent.length)));
  });

  it('shows an alert-error when the health payload is invalid', async () => {
    renderSettings();
    fireEvent.change(healthInput(), {
      target: { files: [makeJsonFile(JSON.stringify({ version: 1, days: 'nope' }))] },
    });
    expect(await screen.findByRole('alert')).toHaveClass('alert-error');
  });
});

describe('<Settings /> health import help (F5-T003)', () => {
  it('shows help describing the v2 raw-samples import format', () => {
    renderSettings();
    expect(screen.getAllByText(/"version"\s*:\s*2/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/"samples"/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/"steps"/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/"distance"/).length).toBeGreaterThan(0);
  });

  it('includes a beginner step-by-step Shortcuts tutorial', () => {
    renderSettings();
    expect(screen.getAllByText(/Buscar muestras médicas/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Repetir con cada/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Preguntar dónde guardar/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Elemento de repetición/i).length).toBeGreaterThan(0);
  });

  it('accepts both .json and .txt files in the health import input', () => {
    renderSettings();
    const label = screen.getByText(/^importar datos de salud$/i).closest('label')!;
    const input = label.querySelector('input[type="file"]') as HTMLInputElement;
    const accept = input.getAttribute('accept') ?? '';
    expect(accept).toMatch(/\.json/);
    expect(accept).toMatch(/\.txt/);
  });
});
