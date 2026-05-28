---
id: F6-T005
status: done
title: BMR Mifflin-St Jeor (pure function)
sub-phase: A-domain
depends-on: [F6-T001]
---

## Goal

Implementar el cálculo de la **tasa metabólica basal (BMR)** con la fórmula
**Mifflin-St Jeor** como **función pura** desacoplada de la UI. Esta función
es el cimiento del cabecero de la vista de Peso (F6-T016) y será **reutilizada
intacta por la fase 7** (balance energético: TDEE + ingesta).

## Context

Crear `src/domain/metabolism/bmr.ts`.

Fórmula Mifflin-St Jeor (kcal/día):
- Hombres: `BMR = 10*weightKg + 6.25*heightCm − 5*ageYears + 5`
- Mujeres: `BMR = 10*weightKg + 6.25*heightCm − 5*ageYears − 161`

```ts
import type { Sex, UserProfile } from '@/domain/profile/userProfile';
import { computeAgeYears } from '@/domain/profile/userProfile';

export interface BmrInput {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex: Sex;
}

// Función pura. Devuelve kcal/día (sin redondear). El llamante decide redondeo.
export function computeBmrMifflinStJeor(input: BmrInput): number;

// Compositor que toma perfil + último peso conocido + reloj.
// Devuelve null si falta cualquier dato.
export function computeTodaysBmr(args: {
  profile: UserProfile | null;
  latestWeightKg: number | null;
  today?: Date;
}): number | null;
```

Reglas:
- `computeBmrMifflinStJeor`: SIN side-effects, SIN dependencias de React ni
  Date. Solo lee `input` y devuelve un número. Lanza `RangeError` si algún
  valor es no-finito o no-positivo (defensivo; el llamante normaliza).
- `computeTodaysBmr`:
  - Si `profile === null` o `latestWeightKg === null` → `null`.
  - Calcula `ageYears = computeAgeYears(profile.birthdate, today)` y delega
    en `computeBmrMifflinStJeor`.
  - Devuelve el valor **sin redondear** (el componente UI redondea al entero
    para mostrarlo).

### Por qué esta separación

Fase 7 (balance energético) podrá implementar, sin tocar nada de fase 6:
```ts
// Futuro, fase 7:
const bmr = computeBmrMifflinStJeor(input);
const activityKcal = estimateActivityKcal(steps, distance, sessions);
const tdee = bmr + activityKcal;
const balance = tdee - foodIntakeKcal;
```

## Tests (write first — RED)

Crear `src/domain/metabolism/bmr.test.ts`.

```
describe('computeBmrMifflinStJeor')
  it('matches the textbook value for a male example (75 kg, 175 cm, 35 y)')
  it('matches the textbook value for a female example (65 kg, 165 cm, 30 y)')
  it('throws RangeError for non-finite or non-positive inputs')
  it('is a pure function (same inputs → same output, no side effects)')

describe('computeTodaysBmr')
  it('returns null when profile is null')
  it('returns null when latestWeightKg is null')
  it('returns the BMR using profile + latest weight + today')
  it('uses computeAgeYears with the provided today')
```

Valores de referencia (verificar a mano):
- Hombre 75 kg / 175 cm / 35 años → 10·75 + 6.25·175 − 5·35 + 5 = 750 + 1093.75 − 175 + 5 = **1673.75 kcal/día**.
- Mujer 65 kg / 165 cm / 30 años → 10·65 + 6.25·165 − 5·30 − 161 = 650 + 1031.25 − 150 − 161 = **1370.25 kcal/día**.

## Implementation

1. Implementar `computeBmrMifflinStJeor` con la fórmula directa.
2. Implementar `computeTodaysBmr` componiendo perfil + edad + peso.
3. Documentar arriba del archivo un breve párrafo: "Función pura. Diseñada
   para ser reutilizada por fase 7 (TDEE/balance energético) sin modificar."

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada. Sub-fase A completa; puntero a F6-T006.
