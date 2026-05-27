---
id: F4-T001
status: done
title: Health data model & normalization
sub-phase: A-health-data
depends-on: []
---

## Goal

Definir el tipo de dominio `HealthDay` (totales diarios de Salud) y una función pura para
validar/normalizar un día suelto. Es la base del parser (F4-T003), el repositorio (F4-T002) y las
métricas de actividad (F4-T005).

## Context

Crear `src/domain/health/healthDay.ts`.

```ts
export interface HealthDay {
  date: string;       // 'YYYY-MM-DD' (día local)
  steps: number;      // entero >= 0
  distanceKm: number; // >= 0
}

// Devuelve un HealthDay normalizado, o null si el registro no es válido.
export function normalizeHealthDay(input: unknown): HealthDay | null;
```

Reglas de `normalizeHealthDay`:
- `input` debe ser objeto con `date` string que cumpla `^\d{4}-\d{2}-\d{2}$`.
- `steps`: número finito ≥ 0 → se redondea a entero. Si falta o es inválido → inválido (null).
- `distanceKm`: número finito ≥ 0. Si falta o es inválido → inválido (null).
- No lanza; devuelve `null` ante cualquier campo inválido (el parser decidirá qué hacer).

## Tests (write first — RED)

Crear `src/domain/health/healthDay.test.ts`.

```
it('normalizes a valid day')
it('rounds steps to an integer')
it('returns null when date is missing or malformed')
it('returns null when steps or distance are negative or non-numeric')
```

## Implementation

1. Implementar `HealthDay` y `normalizeHealthDay` en `healthDay.ts`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F4-T002.
