const MAX_RELIABLE_REPS = 12;

// Estima el 1RM (peso máximo para 1 repetición) con la fórmula de Epley.
// Devuelve null cuando la estimación no es fiable o los datos no son válidos.
export function estimateOneRepMax(weightKg: number, reps: number): number | null {
  if (weightKg <= 0 || reps <= 0 || reps > MAX_RELIABLE_REPS) return null;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}
