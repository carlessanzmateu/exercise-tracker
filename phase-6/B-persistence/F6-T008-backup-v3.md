---
id: F6-T008
status: done
title: Backup v3 (profile + weightEntries)
sub-phase: B-persistence
depends-on: [F6-T006, F6-T007]
---

## Goal

Extender el backup JSON para incluir el perfil y las entradas de peso, subiendo
el formato a `version: 3` y manteniendo la **lectura compatible** de backups
v1 (solo sesiones) y v2 (sesiones + salud).

## Context

Editar `src/data/sessionRepository.ts`.

- `EXPORT_VERSION` → `3`. Tipo:
  ```ts
  export interface ExportPayload {
    version: 3;
    exportedAt: string;
    sessions: Session[];
    healthDays: HealthDay[];
    profile: UserProfile | null;        // null si no configurado
    weightEntries: WeightEntry[];
  }
  ```
- `exportAll(now)`: incluir `profile` (de `getProfile()`) y `weightEntries`
  (de `listWeightEntries()`).
- `importAll(payload)` acepta v1, v2 y v3 con esta semántica:
  - `version === 1`: importa `sessions`. `healthDays`, `profile`, `weightEntries`
    no se tocan (comportamiento existente, sin regresión).
  - `version === 2`: importa `sessions` + `healthDays`. `profile` y `weightEntries`
    no se tocan.
  - `version === 3`: importa `sessions` + `healthDays` + `profile` + `weightEntries`.
    - `profile === null` → `clearProfile`. `profile` objeto válido → `setProfile`.
    - `weightEntries` debe ser array; clear + bulk add (mantener ids).
  - Otra versión → `UnsupportedImportVersionError` (existente).
  - `profile` con forma inválida (no null y no objeto) → `InvalidImportPayloadError`.
  - `weightEntries` ausente/!array en v3 → `InvalidImportPayloadError`.
- Actualizar `createMockRepo`: `exportAll` por defecto devuelve
  `{ version: 3, exportedAt: '', sessions: [], healthDays: [], profile: null, weightEntries: [] }`.
  Ajustar tests de Settings/export que comprueben versión o contenido.

## Tests (write first — RED)

Ampliar `src/data/sessionRepository.test.ts`.

```
it('exportAll returns version 3 including profile and weightEntries')
it('importAll v3 replaces sessions, health days, profile and weights')
it('importAll v3 with profile=null clears the stored profile')
it('importAll still accepts a v2 payload without touching profile/weights')
it('importAll still accepts a v1 payload without touching profile/weights')
it('importAll v3 throws when weightEntries is missing or not an array')
it('importAll v3 throws when profile is neither null nor a valid object')
```

## Implementation

1. Subir `EXPORT_VERSION` a 3 y actualizar tipos.
2. Extender `exportAll` para incluir `profile` y `weightEntries`.
3. Refactorizar `importAll` para ramificar por versión (1/2/3).
4. Actualizar `createMockRepo` y los tests de Settings afectados.

## Done when

- [ ] Todos los tests pasan (incl. los de Settings de fases previas).
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada. Sub-fase B completa; puntero a F6-T009.
