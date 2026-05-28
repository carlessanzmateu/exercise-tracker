---
id: F6-T012
status: done
title: Weight entries list (edit + delete)
sub-phase: D-weight-view
depends-on: [F6-T007, F6-T011]
---

## Goal

Mostrar las entradas de peso ordenadas por **fecha descendente** (más recientes
arriba) debajo de la gráfica. Cada entrada permite **editar** (fecha y peso)
y **borrar** (con confirmación).

## Context

Crear `src/features/weight/WeightEntriesList.tsx` (subcomponente de `Weight`).

Props:
```ts
interface WeightEntriesListProps {
  entries: WeightEntry[];          // ya ordenadas desc por recordedAt; el padre lo garantiza
  onUpdate: (id: string, partial: { recordedAt: string; weightKg: number }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}
```

Estructura visual:
- Cabecera "Entradas".
- Estado vacío: "Aún no has registrado pesos.".
- Lista de items. Cada item muestra:
  - Fecha amigable ("Lun 25 may · 08:30").
  - Peso con 1 decimal: "75.3 kg".
  - Botón "Editar" y botón "Borrar".

Edit (inline o modal — preferencia: inline expand del item):
- Al pulsar "Editar", el item se expande con los mismos inputs que el
  formulario (F6-T011), prellenados.
- Botones "Guardar" / "Cancelar".
- Submit → `onUpdate(id, { recordedAt, weightKg })` con normalización previa.

Delete:
- Al pulsar "Borrar", `window.confirm('¿Eliminar esta entrada de peso?')`
  (mismo patrón que el resto de la app para destructivos).
- Si OK → `onDelete(id)`.

En `Weight.tsx`:
- Pasa `entries` ordenadas desc al componente.
- Implementa `handleUpdate` (llama `repo.updateWeightEntry` y refetch) y
  `handleDelete` (llama `repo.deleteWeightEntry` y refetch).

## Tests (write first — RED)

Crear `src/features/weight/WeightEntriesList.test.tsx`.

```
it('renders an empty state when there are no entries')
it('lists entries ordered as provided (descending by date)')
it('shows weight with 1 decimal and a human-readable date label')
it('enters edit mode on "Editar" and prefills the inputs')
it('calls onUpdate with the new values when saving an edit')
it('cancels the edit without calling onUpdate')
it('confirms before delete and calls onDelete only on confirmation')
it('does not call onDelete when the confirm is cancelled')
```

Para los tests de `confirm`: `vi.spyOn(window, 'confirm')`.

Ampliar `Weight.test.tsx`:

```
it('renders the entries list with the latest entry first')
it('refreshes after editing an entry')
it('refreshes after deleting an entry')
```

## Implementation

1. Crear `WeightEntriesList.tsx` con la UI y el estado local del item en
   edición.
2. Implementar helper de formato de fecha (reutilizar
   `formatSessionDate.ts` si encaja, o crear `formatEntryDateTime.ts`).
3. En `Weight.tsx`, ordenar entries desc y conectar handlers a `repo`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F6-T013.
