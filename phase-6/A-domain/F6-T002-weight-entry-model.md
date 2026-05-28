---
id: F6-T002
status: done
title: Weight entry model & normalization
sub-phase: A-domain
depends-on: []
---

## Goal

Definir el tipo de dominio `WeightEntry` (una entrada de peso con id, fecha y
valor en kg) y una función pura de normalización. Permitir **varias entradas
por día**. Es la base de la agregación diaria (F6-T003) y del repositorio
(F6-T007).

## Context

Crear `src/domain/weight/weightEntry.ts`.

```ts
export interface WeightEntry {
  id: string;          // UUID v4
  recordedAt: string;  // ISO 8601 local con minutos: 'YYYY-MM-DDTHH:mm:ss' (o con segundos)
  weightKg: number;    // > 0, finito, hasta 1 decimal
}

// Devuelve un WeightEntry normalizado o null si la entrada es inválida.
// Si `id` falta en el input, se genera con crypto.randomUUID().
export function normalizeWeightEntry(input: unknown): WeightEntry | null;
```

Reglas de `normalizeWeightEntry`:
- `weightKg`: número finito > 0. Se **redondea a 1 decimal** (`Math.round(x*10)/10`).
- `recordedAt`: string parseable por `new Date(...)`. Valor inválido (`NaN`) → `null`.
  Acepta tanto `'YYYY-MM-DDTHH:mm:ss'` como variantes con segundos / con `Z`.
- `id`: si viene string no-vacío, se respeta. Si falta o está vacío, se genera
  con `crypto.randomUUID()`.
- No lanza; devuelve `null` ante cualquier campo crítico inválido (`recordedAt`
  o `weightKg`).

## Tests (write first — RED)

Crear `src/domain/weight/weightEntry.test.ts`.

```
it('normalizes a valid entry')
it('rounds weightKg to 1 decimal')
it('returns null when weightKg is missing, <= 0, or non-finite')
it('returns null when recordedAt is missing or unparseable')
it('keeps a provided id when non-empty')
it('generates a UUID when id is missing or empty')
```

## Implementation

1. Implementar `normalizeWeightEntry` con redondeo a 1 decimal y validación de
   `recordedAt` vía `new Date(...).getTime()` (no NaN).
2. Generar `id` con `crypto.randomUUID()` cuando falte.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F6-T003.
