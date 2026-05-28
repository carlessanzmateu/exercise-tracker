import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useSessionRepository } from '@/data/useSessionRepository';
import type { HealthDay } from '@/domain/health/healthDay';
import type { Session } from '@/domain/types';

import { ActivityPanel } from './ActivityPanel';
import { CardioPanel } from './CardioPanel';
import { ExerciseProgressPanel } from './ExerciseProgressPanel';
import { FrequencyPanel } from './FrequencyPanel';
import { MuscleVolumePanel } from './MuscleVolumePanel';
import { PersonalRecordsPanel } from './PersonalRecordsPanel';
import { TonnagePanel } from './TonnagePanel';

type PanelSource = 'sessions' | 'health';

interface PanelDef {
  id: string;
  title: string;
  source: PanelSource;
}

const PANELS: PanelDef[] = [
  { id: 'frequency', title: 'Frecuencia', source: 'sessions' },
  { id: 'exercise', title: 'Progreso por ejercicio', source: 'sessions' },
  { id: 'prs', title: 'Records personales', source: 'sessions' },
  { id: 'muscle-volume', title: 'Volumen por grupo muscular', source: 'sessions' },
  { id: 'cardio', title: 'Cardio', source: 'sessions' },
  { id: 'tonnage', title: 'Tonelaje total', source: 'sessions' },
  { id: 'activity', title: 'Actividad', source: 'health' },
];

export function Progress() {
  const repo = useSessionRepository();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [healthDays, setHealthDays] = useState<HealthDay[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([repo.list(), repo.listHealthDays()]).then(([items, days]) => {
      if (cancelled) return;
      setSessions(items);
      setHealthDays(days);
    });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  if (sessions === null || healthDays === null) {
    return (
      <section data-testid="route-progress" aria-busy="true">
        <h2 className="page-title">Progreso</h2>
        <p>Cargando…</p>
      </section>
    );
  }

  const hasSessions = sessions.length > 0;
  const hasHealth = healthDays.length > 0;

  if (!hasSessions && !hasHealth) {
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

  const visiblePanels = PANELS.filter((p) => (p.source === 'sessions' ? hasSessions : hasHealth));

  return (
    <section data-testid="route-progress">
      <h2 className="page-title">Progreso</h2>
      {visiblePanels.map((panel) => (
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
