---
id: F6-T016
status: todo
title: BMR header (today, single number)
sub-phase: D-weight-view
depends-on: [F6-T005, F6-T010, F6-T011]
---

## Goal

Renderizar la **cabecera con el BMR de hoy** arriba de la vista de Peso:
una cifra única (`kcal/día`, entera) calculada con el **último peso conocido**
+ perfil. **Oculta** si no hay perfil o no hay ninguna entrada de peso.

## Context

Crear `src/features/weight/BmrHeader.tsx` (subcomponente de `Weight`).

Props:
```ts
interface BmrHeaderProps {
  profile: UserProfile;             // siempre llega no-null (Weight bloquea sin perfil)
  entries: WeightEntry[];           // puede estar vacío
  now?: () => Date;                 // inyectable para tests
}
```

Lógica:
- Si `entries.length === 0` → no renderizar nada (`return null`).
- `latestEntry` = entrada con `recordedAt` máximo.
- `bmr = computeTodaysBmr({ profile, latestWeightKg: latestEntry.weightKg, today: now() })`.
- Si `bmr === null` → no renderizar (defensivo).
- Render:
  ```tsx
  <header className="bmr-header">
    <p className="bmr-header__label">Tu BMR de hoy</p>
    <p className="bmr-header__value">
      <span className="bmr-header__number">{Math.round(bmr)}</span>
      <span className="bmr-header__unit"> kcal/día</span>
    </p>
    <p className="bmr-header__hint">
      Basado en tu último peso ({latestEntry.weightKg.toFixed(1)} kg, {fecha amigable})
    </p>
  </header>
  ```
- Sin tooltips ni desglose en fase 6. Solo la cifra.

Integración en `Weight.tsx`:
- Renderiza `<BmrHeader profile={profile} entries={entries} />` antes del
  formulario y la gráfica.
- `BmrHeader` se autogestiona (muestra nada si no hay datos).

## Tests (write first — RED)

Crear `src/features/weight/BmrHeader.test.tsx`.

```
it('renders nothing when there are no entries')
it('renders the BMR rounded to the nearest integer when there is at least one entry')
it('uses the most recent entry as the latest weight')
it('shows the latest weight and date as a hint')
it('uses the injected now() for the calculation')
```

Test value reference: profile = `{ heightCm: 175, birthdate: '1990-05-26', sex: 'male' }`,
peso 75 kg, today = `2026-05-28` → edad 36 años (cumple 26 may de 2026) →
`BMR = 10*75 + 6.25*175 − 5*36 + 5 = 750 + 1093.75 − 180 + 5 = 1668.75` →
display = `1669`.

## Implementation

1. Implementar `BmrHeader.tsx` con la lógica descrita.
2. Helper para encontrar la entrada más reciente (por `recordedAt`).
3. Estilos: clases `.bmr-header`, `.bmr-header__number`, `.bmr-header__unit`,
   `.bmr-header__hint` (sobrias, jerarquía clara).
4. Montar en `Weight.tsx`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] **Fase 6 completa.** Actualizar `tasks-summary.md`:
      todas las tareas en `done`, "Próxima tarea: Fase 6 completa." y añadir
      una sección de cierre como en fase 4 (entregado / suite en verde).
- [ ] Actualizar `CLAUDE.md` para reflejar que la Fase 6 está terminada y que
      no hay próxima fase pendiente (fase 7 vendrá después como nueva fase).
