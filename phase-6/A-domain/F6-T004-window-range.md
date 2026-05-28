---
id: F6-T004
status: todo
title: Window range per filter
sub-phase: A-domain
depends-on: []
---

## Goal

Funciones puras que calculan el **rango de fechas** correspondiente a una
ventana del filtro temporal y a un desplazamiento (`offsetUnits`) hacia el
pasado. Es la base del scroll lateral de la gráfica (F6-T014): cada cambio de
filtro o de offset produce un nuevo rango sobre el que se filtran los datos.

## Context

Crear `src/domain/weight/window.ts`.

```ts
export type WeightFilter = 'week' | 'month' | 'quarter' | 'semester' | 'year' | 'ytd';

export interface WindowRange {
  from: string;  // 'YYYY-MM-DD' (incluido)
  to: string;    // 'YYYY-MM-DD' (incluido)
}

// Calcula el rango cerrado para una ventana del filtro relativa a `anchor`.
// offsetUnits = 0 → ventana actual (la que contiene a `anchor`).
// offsetUnits = -1 → ventana inmediatamente anterior. Etc.
// YTD: solo offsetUnits === 0 está soportado; cualquier otro → mismo rango YTD.
export function computeWindowRange(
  filter: WeightFilter,
  anchor: Date,
  offsetUnits: number,
): WindowRange;

// True si el rango contiene a `today` (es la ventana "más reciente").
export function isLatestWindow(range: WindowRange, today: Date): boolean;
```

Definiciones (días locales):

| Filtro | Ventana actual (offset 0) | Scroll (offset −1) |
|---|---|---|
| `week` | lunes a domingo de la semana que contiene `anchor` | semana anterior |
| `month` | día 1 al último día del mes de `anchor` | mes anterior |
| `quarter` | trimestre natural (1-3 / 4-6 / 7-9 / 10-12) que contiene `anchor` | trimestre anterior |
| `semester` | semestre natural (1-6 / 7-12) que contiene `anchor` | semestre anterior |
| `year` | 1 enero a 31 diciembre del año de `anchor` | año anterior |
| `ytd` | 1 enero a `anchor` (inclusive) | no scrollea (siempre = offset 0) |

Notas:
- "Semana ISO" para `week`: lunes como primer día.
- `isLatestWindow`: `from <= today.date <= to` (`today.date` en local YYYY-MM-DD).

## Tests (write first — RED)

Crear `src/domain/weight/window.test.ts`.

```
describe('week filter')
  it('returns Monday to Sunday of the anchor week (offset 0)')
  it('returns the previous Monday-Sunday window (offset -1)')

describe('month filter')
  it('returns the full calendar month of the anchor (offset 0)')
  it('returns the previous calendar month (offset -1)')

describe('quarter filter')
  it('returns the natural quarter containing the anchor (offset 0)')
  it('returns the previous quarter (offset -1)')

describe('semester filter')
  it('returns Jan-Jun or Jul-Dec containing the anchor (offset 0)')
  it('returns the previous semester (offset -1)')

describe('year filter')
  it('returns Jan 1 to Dec 31 of the anchor year (offset 0)')
  it('returns the previous year (offset -1)')

describe('ytd filter')
  it('returns Jan 1 to anchor (inclusive)')
  it('ignores offsetUnits and always returns YTD')

describe('isLatestWindow')
  it('returns true when today is within the range')
  it('returns false when today is after the range')
```

## Implementation

1. Implementar un dispatch por `filter` con cada cálculo en su propia función
   privada (`computeWeekRange`, `computeMonthRange`, etc.).
2. Operar siempre en zona local (`getFullYear/getMonth/getDate`).
3. Helper `formatLocalDate(d)` → `'YYYY-MM-DD'`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F6-T005.
