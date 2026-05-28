---
id: F6-T010
status: todo
title: TabBar entry + /weight route + block-when-no-profile
sub-phase: D-weight-view
depends-on: [F6-T006, F6-T009]
---

## Goal

Crear el nuevo **tab "Peso"** en la barra inferior y la **ruta `/weight`** con
un componente `Weight` shell que carga el perfil. Si no hay perfil, **bloquea**
la vista con un CTA al deep-link `/settings#perfil`. Si hay perfil, deja un
placeholder al que se le añadirán las piezas en F6-T011 … F6-T016.

## Context

Editar `src/components/TabBar.tsx`: añadir el 5º `<Link>` "Peso" con icono
adecuado (balance/scale) hacia `/weight`. Mantener el orden:
1. `/` Diario  2. `/new` Nuevo  3. `/progress` Progreso  4. `/weight` Peso
5. `/settings` Ajustes. Verificar que el layout caben los 5 en móvil.

Crear `src/features/weight/Weight.tsx`:

```tsx
export function Weight() {
  // 1. repo.getProfile() en useEffect → 'loading' | UserProfile | null
  // 2. Si 'loading' → spinner
  // 3. Si null → bloqueo con CTA
  // 4. Si UserProfile → placeholder "Vista de Peso (próximamente)"
}
```

Bloqueo (sin perfil):
```tsx
<section data-testid="route-weight">
  <h2 className="page-title">Peso</h2>
  <p>Configura tu perfil para empezar a registrar tu peso y ver tu BMR.</p>
  <Link to="/settings#perfil" className="btn btn-primary feed-cta">
    Configurar perfil
  </Link>
</section>
```

Editar `src/App.tsx` (o el router donde estén las rutas) para registrar
`/weight` → `<Weight />`.

## Tests (write first — RED)

Crear `src/features/weight/Weight.test.tsx`.

```
describe('<Weight /> shell')
  it('shows a loading state while fetching the profile')
  it('shows a block CTA to /settings#perfil when no profile is stored')
  it('renders the weight view placeholder when a profile is stored')
```

Ampliar `src/components/TabBar.test.tsx`:

```
it('includes a "Peso" tab linking to /weight in the expected order')
```

Ampliar `src/App.test.tsx`:

```
it('renders the Weight route at /weight')
```

## Implementation

1. Añadir el `<Link>` "Peso" a `TabBar.tsx`.
2. Crear `Weight.tsx` con la carga de perfil y los tres estados.
3. Registrar la ruta `/weight` en el router.
4. Actualizar los tests del TabBar y de la App.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F6-T011.
