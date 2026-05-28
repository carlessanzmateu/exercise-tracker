---
id: F6-T001
status: todo
title: User profile model & normalization
sub-phase: A-domain
depends-on: []
---

## Goal

Definir el tipo de dominio `UserProfile` (altura, fecha de nacimiento, sexo) y
funciones puras para normalizar entradas y calcular la edad. Es la base del
formulario de Ajustes (F6-T009), del repositorio (F6-T006) y del cálculo de BMR
(F6-T005).

## Context

Crear `src/domain/profile/userProfile.ts`.

```ts
export type Sex = 'male' | 'female';

export interface UserProfile {
  heightCm: number;     // > 0, finito
  birthdate: string;    // 'YYYY-MM-DD' (no futuro, edad >= 5)
  sex: Sex;
}

// Devuelve un UserProfile normalizado, o null si la entrada no es válida.
export function normalizeUserProfile(input: unknown, today?: Date): UserProfile | null;

// Edad en años completos a la fecha `today` (default: new Date()).
export function computeAgeYears(birthdate: string, today?: Date): number;
```

Reglas de `normalizeUserProfile`:
- `input` debe ser objeto con todos los campos presentes.
- `heightCm`: número finito > 0. Si no, → `null`.
- `birthdate`: string `^\d{4}-\d{2}-\d{2}$`, parseable, no futuro, edad >= 5
  a la fecha `today` (default: `new Date()`). Si no, → `null`.
- `sex`: literal `'male'` o `'female'`. Si no, → `null`.
- No lanza; devuelve `null` ante cualquier campo inválido.

Reglas de `computeAgeYears`:
- Edad en años completos respetando mes y día (no solo años de calendario).
- Si `birthdate` está en el futuro respecto a `today` → 0.

## Tests (write first — RED)

Crear `src/domain/profile/userProfile.test.ts`.

```
it('normalizes a valid profile')
it('returns null when heightCm is missing, non-positive, or non-finite')
it('returns null when birthdate is malformed or in the future')
it('returns null when birthdate implies age < 5')
it('returns null when sex is not "male" or "female"')
it('computeAgeYears returns full years respecting month and day')
it('computeAgeYears returns 0 when birthdate is in the future')
```

## Implementation

1. Implementar `normalizeUserProfile` con validaciones campo a campo.
2. Implementar `computeAgeYears` con la lógica de año/mes/día.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F6-T002.
