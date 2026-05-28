---
id: F6-T007
status: done
title: Weight repository (IndexedDB weightEntries)
sub-phase: B-persistence
depends-on: [F6-T002, F6-T006]
---

## Goal

Persistir las entradas de peso en IndexedDB con CRUD completo (varias por día
permitidas). Aprovecha la subida de versión a 3 hecha en F6-T006 para añadir
también el store `weightEntries`.

## Context

Editar `src/data/sessionRepository.ts`. La versión ya está en 3 (F6-T006).

Cambios:
- En el `upgrade` callback (idempotente), añadir el store `weightEntries`
  con `keyPath: 'id'` si no existe; crear índice `by-recordedAt` sobre
  `recordedAt` para consultas ordenadas eficientes.
- Añadir `weightEntries` al `SessionsSchema`:
  `{ key: string; value: WeightEntry; indexes: { 'by-recordedAt': string } }`.
- Extender la interfaz `SessionRepository`:
  ```ts
  listWeightEntries(): Promise<WeightEntry[]>;                                // ordenado por recordedAt asc
  addWeightEntry(entry: WeightEntry): Promise<void>;                          // put (idempotente por id)
  updateWeightEntry(
    id: string,
    partial: Pick<WeightEntry, 'recordedAt' | 'weightKg'>,
  ): Promise<void>;                                                           // throws si id no existe
  deleteWeightEntry(id: string): Promise<void>;                               // no-op si no existe
  ```
- Implementarlos en `createSessionRepository` usando el índice `by-recordedAt`
  para `listWeightEntries` (`getAllFromIndex`).
- `updateWeightEntry`: lee la entrada, lanza `Error` si no existe, hace `put`
  con los campos actualizados manteniendo el `id`.
- Actualizar `createMockRepo` con los 4 métodos nuevos: `listWeightEntries` →
  `[]`, los demás `vi.fn().mockResolvedValue(undefined)`.

## Tests (write first — RED)

Ampliar `src/data/sessionRepository.test.ts`.

```
it('returns an empty list when no weight entries exist')
it('addWeightEntry persists and listWeightEntries returns them sorted by recordedAt asc')
it('addWeightEntry with an existing id overwrites (put semantics)')
it('updateWeightEntry changes recordedAt and weightKg while preserving id')
it('updateWeightEntry throws when the id does not exist')
it('deleteWeightEntry removes the entry')
it('deleteWeightEntry is a no-op for an unknown id')
it('allows multiple entries on the same local day')
```

## Implementation

1. Añadir el store + índice en el `upgrade` callback.
2. Implementar los 4 métodos en `createSessionRepository`.
3. Actualizar `createMockRepo`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F6-T008.
