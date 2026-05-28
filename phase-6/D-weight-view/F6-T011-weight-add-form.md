---
id: F6-T011
status: done
title: Weight add form (inline)
sub-phase: D-weight-view
depends-on: [F6-T002, F6-T007, F6-T010]
---

## Goal

Añadir un formulario inline a la vista `Weight` para registrar una nueva
entrada de peso. Campos: **peso (kg con 1 decimal)** y **fecha y hora**
(`<input type="datetime-local">`, default = ahora). Al enviar, crea la entrada
vía `repo.addWeightEntry` y recarga la lista.

## Context

Editar `src/features/weight/Weight.tsx`. Solo se monta cuando hay perfil
(estado normal, no bloqueo).

Estructura mínima del formulario:

```tsx
<form className="weight-form" onSubmit={handleSubmit}>
  <label htmlFor="weight-kg">Peso (kg)</label>
  <input
    id="weight-kg"
    type="number"
    inputMode="decimal"
    step="0.1"
    min="20"
    max="400"
    value={kg}
    onChange={(e) => setKg(e.target.value)}
    required
  />

  <label htmlFor="weight-when">Fecha y hora</label>
  <input
    id="weight-when"
    type="datetime-local"
    value={when}
    onChange={(e) => setWhen(e.target.value)}
    required
  />

  <button type="submit" className="btn btn-primary">Guardar peso</button>
</form>
```

Comportamiento:
- `when` default = ahora en formato local (`'YYYY-MM-DDTHH:mm'`). Helper
  `formatLocalDateTimeInput(now)`.
- En submit:
  - Construir `candidate = { recordedAt: when + ':00', weightKg: Number(kg), id: '' }`
    (con segundos a 00).
  - Pasar por `normalizeWeightEntry(candidate)`; si `null`, mostrar error.
  - Llamar a `repo.addWeightEntry(entry)`.
  - Limpiar el form (mantener `when` en el último valor para añadir varios
    seguidos del mismo día).
  - Re-fetch `repo.listWeightEntries()` para refrescar la lista (que vendrá
    en F6-T012).
- Lift de estado: la lista de entradas la maneja el componente `Weight`
  (estado `entries: WeightEntry[]`); este formulario notifica `onAdded()`
  para que `Weight` refetch o actualice optimista.

## Tests (write first — RED)

Ampliar `src/features/weight/Weight.test.tsx`.

```
describe('<Weight /> add form (F6-T011)')
  it('renders an inline form with weight and datetime fields')
  it('prefills the datetime with the current local time')
  it('saves a valid entry via repo.addWeightEntry')
  it('shows an error when weight is non-positive')
  it('refreshes the list after a successful add')
```

## Implementation

1. Añadir `formatLocalDateTimeInput(date)` (helper local en el archivo o en
   un `weight/utils.ts`).
2. Implementar el formulario controlado con submit.
3. Lift de estado de `entries` en `Weight`; pasar `onAdded` al form.
4. Llamada a `addWeightEntry` y refetch.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F6-T012.
