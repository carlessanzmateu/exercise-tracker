import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSessionRepository } from '@/data/useSessionRepository';
import { parseHealthImport } from '@/domain/health/parseHealthImport';

import { buildBackupFilename } from './buildBackupFilename';

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
    reader.readAsText(file);
  });
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function Settings({ now = () => new Date() }: { now?: () => Date } = {}) {
  const repo = useSessionRepository();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [healthMessage, setHealthMessage] = useState<string | null>(null);

  async function handleExport() {
    const stamp = now();
    const payload = await repo.exportAll(stamp);
    downloadJson(buildBackupFilename(stamp), payload);
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    let text: string;
    try {
      text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
        reader.readAsText(file);
      });
    } catch (err) {
      setError(`No se pudo leer el fichero: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      setError('El fichero no es un JSON válido.');
      return;
    }

    if (
      !window.confirm(
        '¿Reemplazar todos los datos actuales con este backup? Esta acción no se puede deshacer.',
      )
    ) {
      event.target.value = '';
      return;
    }

    try {
      await repo.importAll(payload);
      navigate('/');
    } catch (err) {
      setError(`No se pudo importar: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function handleHealthImport(event: ChangeEvent<HTMLInputElement>) {
    setError(null);
    setHealthMessage(null);
    const file = event.target.files?.[0];
    if (!file) return;

    let text: string;
    try {
      text = await readFileText(file);
    } catch (err) {
      setError(`No se pudo leer el fichero: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      setError('El fichero no es un JSON válido.');
      return;
    }

    try {
      const days = parseHealthImport(payload);
      await repo.upsertHealthDays(days);
      setHealthMessage(
        `Importados ${days.length} ${days.length === 1 ? 'día' : 'días'} de actividad.`,
      );
    } catch (err) {
      setError(
        `No se pudieron importar los datos de Salud: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return (
    <section data-testid="route-settings">
      <h2 className="page-title">Ajustes</h2>

      <p className="notice">
        Tus entrenamientos se guardan solo en este dispositivo. Exporta una copia periódicamente
        para no perder tu historial.
      </p>

      <div className="settings-actions">
        <button type="button" className="btn btn-primary btn-full" onClick={handleExport}>
          Exportar
        </button>
        <label className="btn btn-secondary btn-full settings-import">
          <span>Importar</span>
          <input type="file" accept="application/json" onChange={handleImport} />
        </label>
      </div>

      <h3 className="settings-section-title">Datos de Salud</h3>
      <p className="notice">
        Importa pasos y distancia diaria desde la app Salud del iPhone (vía un Atajo que genera un
        JSON). Se fusionan por día: reimportar no duplica.
      </p>
      <div className="settings-actions">
        <label className="btn btn-secondary btn-full settings-import">
          <span>Importar datos de Salud</span>
          <input type="file" accept="application/json" onChange={handleHealthImport} />
        </label>
      </div>

      <details className="health-help">
        <summary>¿Cómo genero el fichero?</summary>
        <ol>
          <li>Abre la app Atajos y crea un atajo.</li>
          <li>
            Usa &laquo;Buscar muestras médicas&raquo; con tipo &laquo;Pasos&raquo; y otra acción con
            &laquo;Distancia a pie y en carrera&raquo; (sin agrupar).
          </li>
          <li>
            Recorre cada lista con &laquo;Repetir con cada&raquo; y añade a una variable de texto un
            objeto por muestra con su <code>metric</code>, <code>date</code> (fecha de inicio) y
            <code>value</code>. No hace falta sumar nada: la app agrupa por día al importar.
          </li>
          <li>Envuélvelo en este formato y guárdalo como JSON:</li>
        </ol>
        <pre>
          <code>
            {
              '{ "version": 2, "samples": [ { "metric": "steps", "date": "2026-05-25T08:13:00", "value": 1200 }, { "metric": "distance", "date": "2026-05-25T08:13:00", "value": 0.92 } ] }'
            }
          </code>
        </pre>
        <p>
          <code>metric</code>: <code>&quot;steps&quot;</code> (conteo) o{' '}
          <code>&quot;distance&quot;</code> (kilómetros). <code>date</code>: ISO local de la muestra
          o <code>YYYY-MM-DD</code>.
        </p>
        <p>Después selecciónalo en &laquo;Importar datos de Salud&raquo;.</p>
      </details>

      {healthMessage ? (
        <p role="status" className="settings-success">
          {healthMessage}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="alert-error">
          {error}
        </p>
      ) : null}
    </section>
  );
}
