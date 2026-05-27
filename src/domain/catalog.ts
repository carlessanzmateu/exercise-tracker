import type { ExerciseType } from './types';

export function getExerciseTypeById(id: string): ExerciseType | undefined {
  return EXERCISE_CATALOG.find((t) => t.id === id);
}

export function getCatalogGroupedByCategory(): Map<string, ExerciseType[]> {
  const groups = new Map<string, ExerciseType[]>();
  for (const type of EXERCISE_CATALOG) {
    const existing = groups.get(type.category);
    if (existing) {
      existing.push(type);
    } else {
      groups.set(type.category, [type]);
    }
  }
  return groups;
}

export const EXERCISE_CATALOG: ExerciseType[] = [
  // Pecho (strength)
  { id: 'press-banca', name: 'Press banca (barra)', category: 'Pecho', shape: 'strength' },
  {
    id: 'press-pecho-maquina',
    name: 'Press pecho máquina',
    category: 'Pecho',
    shape: 'strength',
  },
  {
    id: 'aperturas-pec-deck',
    name: 'Aperturas / Pec deck',
    category: 'Pecho',
    shape: 'strength',
  },

  // Espalda (strength)
  {
    id: 'jalon-al-pecho',
    name: 'Jalón al pecho (polea alta)',
    category: 'Espalda',
    shape: 'strength',
  },
  {
    id: 'remo-sentado-maquina',
    name: 'Remo sentado en máquina',
    category: 'Espalda',
    shape: 'strength',
  },
  {
    id: 'pullover-remo-barra-t',
    name: 'Pull-over / Remo con barra T',
    category: 'Espalda',
    shape: 'strength',
  },

  // Hombros (strength)
  {
    id: 'press-militar',
    name: 'Press militar / Press hombros máquina',
    category: 'Hombros',
    shape: 'strength',
  },

  // Piernas (strength)
  { id: 'prensa-piernas', name: 'Prensa de piernas', category: 'Piernas', shape: 'strength' },
  {
    id: 'extensiones-cuadriceps',
    name: 'Extensiones de cuádriceps',
    category: 'Piernas',
    shape: 'strength',
  },
  { id: 'curl-femoral', name: 'Curl femoral', category: 'Piernas', shape: 'strength' },
  {
    id: 'sentadilla-smith-hack',
    name: 'Sentadilla en multipower (Smith) o Hack',
    category: 'Piernas',
    shape: 'strength',
  },
  {
    id: 'elevacion-gemelos',
    name: 'Elevación de gemelos',
    category: 'Piernas',
    shape: 'strength',
  },

  // Brazos (strength)
  {
    id: 'curl-biceps',
    name: 'Curl de bíceps (polea o mancuerna)',
    category: 'Brazos',
    shape: 'strength',
  },
  {
    id: 'extension-triceps',
    name: 'Extensión de tríceps (polea o press francés)',
    category: 'Brazos',
    shape: 'strength',
  },

  // Core (strength)
  {
    id: 'maquina-abdominales',
    name: 'Máquina de abdominales',
    category: 'Core',
    shape: 'strength',
  },

  // Autocarga (bodyweight, excepto Plancha que es time)
  { id: 'flexiones', name: 'Flexiones', category: 'Autocarga', shape: 'bodyweight' },
  {
    id: 'sentadillas-sin-peso',
    name: 'Sentadillas sin peso',
    category: 'Autocarga',
    shape: 'bodyweight',
  },
  { id: 'abdominales', name: 'Abdominales / crunches', category: 'Autocarga', shape: 'bodyweight' },
  { id: 'dominadas', name: 'Dominadas', category: 'Autocarga', shape: 'bodyweight' },
  {
    id: 'fondos-paralelas',
    name: 'Fondos en paralelas',
    category: 'Autocarga',
    shape: 'bodyweight',
  },
  { id: 'zancadas', name: 'Zancadas', category: 'Autocarga', shape: 'bodyweight' },
  { id: 'plancha', name: 'Plancha', category: 'Autocarga', shape: 'time' },

  // Cardio (cardio)
  { id: 'caminar', name: 'Caminar', category: 'Cardio', shape: 'cardio' },
  { id: 'correr', name: 'Correr', category: 'Cardio', shape: 'cardio' },
];
