---
id: F4-T006
status: done
title: Backup v2 (incluye healthDays)
sub-phase: C-integration
depends-on: [F4-T002]
---

## Goal

Extender el backup JSON para incluir los datos de Salud, subiendo el formato a `version: 2` y
manteniendo la **lectura compatible** de backups `version: 1` (solo sesiones).

## Context

Editar `src/data/sessionRepository.ts`.

- `EXPORT_VERSION` → `2`. Tipo:
  ```ts
  export interface ExportPayload {
    version: 2;
    exportedAt: string;
    sessions: Session[];
    healthDays: HealthDay[];
  }
  ```
- `exportAll(now)`: incluir `healthDays` (de `listHealthDays()`).
- `importAll(payload)`:
  - `version === 1`: válido; importa `sessions` (clear + put) y **no toca** `healthDays`. (O los
    deja vacíos; mantener el comportamiento actual de reemplazo de sesiones.)
  - `version === 2`: importa `sessions` y `healthDays` (clear + put de ambos stores).
  - Otra versión → `UnsupportedImportVersionError` (ya existe).
  - `healthDays` ausente/!array en v2 → `InvalidImportPayloadError`.
- Actualizar `createMockRepo`: `exportAll` por defecto devuelve `{ version: 2, exportedAt: '',
  sessions: [], healthDays: [] }`. Revisar y ajustar tests de Settings/export que comprueben la
  versión o el contenido del payload.

## Tests (write first — RED)

Ampliar `src/data/sessionRepository.test.ts`.

```
it('exportAll returns version 2 including healthDays')
it('importAll v2 replaces sessions and health days')
it('importAll still accepts a v1 payload (sessions only) without error')
it('importAll v2 throws when healthDays is missing or not an array')
```

## Implementation

1. Subir `EXPORT_VERSION`, actualizar tipos y `exportAll`/`importAll`.
2. Actualizar `createMockRepo` y los tests afectados (Settings export/import).

## Done when

- [ ] Todos los tests pasan (incl. los de Settings de fases previas).
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F4-T007.
