---
id: F4-T002
status: done
title: Health repository (IndexedDB healthDays)
sub-phase: A-health-data
depends-on: [F4-T001]
---

## Goal

Persistir los datos de Salud en IndexedDB con **fusión por día (upsert)**. Sube la base a versión 2
añadiendo el store `healthDays` y extiende el repositorio con métodos de Salud.

## Context

Editar `src/data/sessionRepository.ts`. Patrón actual: una `IDBPDatabase`, `SessionRepository`
con métodos sobre el store `sessions`, mock en `src/test/createMockRepo.ts`.

Cambios:
- `DB_VERSION` → `2`. En `upgrade`, crear el store `healthDays` con `keyPath: 'date'` si no existe
  (sin tocar `sessions`, para no romper a usuarios existentes que vienen de v1).
- Añadir `healthDays` al `SessionsSchema` (`key: string; value: HealthDay`).
- Extender la interfaz `SessionRepository`:
  ```ts
  listHealthDays(): Promise<HealthDay[]>;          // ordenados por date asc
  upsertHealthDays(days: HealthDay[]): Promise<void>; // put por date (idempotente)
  clearHealthDays(): Promise<void>;
  ```
- Implementarlos en `createSessionRepository`.
- Actualizar `createMockRepo` con los tres métodos nuevos (`listHealthDays` → `[]` por defecto).

## Tests (write first — RED)

Ampliar `src/data/sessionRepository.test.ts` (usa `fake-indexeddb`, ya configurado).

```
it('stores and lists health days sorted by date ascending')
it('upserts: re-importing the same date overwrites instead of duplicating')
it('clearHealthDays empties the store without touching sessions')
it('opens cleanly upgrading from a v1 database (sessions preserved)')
```

## Implementation

1. Subir versión y crear el store en `upgrade`.
2. Implementar los tres métodos y exportarlos en `createSessionRepository`.
3. Actualizar `createMockRepo`.

## Done when

- [ ] Todos los tests pasan (incl. los previos de repositorio/sesiones).
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada. Sub-fase A completa; puntero a F4-T003.
