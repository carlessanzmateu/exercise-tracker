import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useSessionRepository } from '@/data/useSessionRepository';
import type { Session } from '@/domain/types';

import { ActivityPanel } from './ActivityPanel';
import { CardioPanel } from './CardioPanel';
import { ExerciseProgressPanel } from './ExerciseProgressPanel';
import { FrequencyPanel } from './FrequencyPanel';
import { MuscleVolumePanel } from './MuscleVolumePanel';
import { PersonalRecordsPanel } from './PersonalRecordsPanel';
import { TonnagePanel } from './TonnagePanel';

interface PanelDef {
  id: string;
  title: string;
}

const PANELS: PanelDef[] = [
  { id: 'frequency', title: 'Frecuencia' },
  { id: 'exercise', title: 'Progreso por ejercicio' },
  { id: 'prs', title: 'Records personales' },
  { id: 'muscle-volume', title: 'Volumen por grupo muscular' },
  { id: 'cardio', title: 'Cardio' },
  { id: 'tonnage', title: 'Tonelaje total' },
  { id: 'activity', title: 'Actividad' },
];

export function Progress() {
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
      <section data-testid="route-progress" aria-busy="true">
        <h2 className="page-title">Progreso</h2>
        <p>Cargando…</p>
      </section>
    );
  }

  if (sessions.length === 0) {
    return (
      <section data-testid="route-progress">
        <h2 className="page-title">Progreso</h2>
        <p>Aún no hay datos para mostrar. Registra entrenamientos para ver tus métricas.</p>
        <Link to="/new" className="btn btn-primary feed-cta">
          Añadir entrenamiento
        </Link>
      </section>
    );
  }

  return (
    <section data-testid="route-progress">
      <h2 className="page-title">Progreso</h2>
      {PANELS.map((panel) => (
        <section key={panel.id} className="progress-panel" data-panel={panel.id}>
          <h3 className="progress-panel__title">{panel.title}</h3>
          {panel.id === 'frequency' && <FrequencyPanel sessions={sessions} />}
          {panel.id === 'exercise' && <ExerciseProgressPanel sessions={sessions} />}
          {panel.id === 'prs' && <PersonalRecordsPanel sessions={sessions} />}
          {panel.id === 'muscle-volume' && <MuscleVolumePanel sessions={sessions} />}
          {panel.id === 'cardio' && <CardioPanel sessions={sessions} />}
          {panel.id === 'tonnage' && <TonnagePanel sessions={sessions} />}
          {panel.id === 'activity' && <ActivityPanel />}
        </section>
      ))}
    </section>
  );
}
