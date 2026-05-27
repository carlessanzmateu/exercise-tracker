---
id: F3-T012
status: done
title: Progress page shell + empty state
sub-phase: C-navigation-shell
depends-on: [F3-T011]
---

## Goal

Convertir `Progress.tsx` en el **shell de la vista**: carga las sesiones desde el repositorio, muestra un **estado vacío** claro cuando no hay datos y, cuando los hay, renderiza los contenedores (secciones) donde luego se montan los paneles de la Sub-fase D.

## Context

- `src/features/progress/Progress.tsx`. Cargar con `useSessionRepository().list()` (patrón idéntico a `Feed.tsx`: estado `null` mientras carga, luego array).
- Estado de carga: `<p>Cargando…</p>` con `aria-busy`.
- Estado vacío (`sessions.length === 0`): mensaje breve ("Aún no hay datos para mostrar. Registra entrenamientos para ver tus métricas.") + CTA `<Link to="/new" className="btn btn-primary">Añadir entrenamiento</Link>`.
- Con datos: renderizar secciones con encabezado (`<h3>`) como **placeholders** para cada panel (Frecuencia, Progreso por ejercicio, Records, Volumen muscular, Cardio, Tonelaje). Los paneles reales llegan en F3-T014..T020; aquí basta dejar las secciones con su título y un contenedor identificable (p. ej. `data-panel="frequency"`).
- Pasar las `sessions` cargadas a los paneles vía props (los paneles serán componentes puros que reciben `sessions`).

## Tests (write first — RED)

En `src/features/progress/Progress.test.tsx` (render con `RepositoryProvider` + `MemoryRouter` + `createMockRepo`, como en `Feed.test.tsx`):

```
it('shows a loading state initially')
it('shows an empty state with a CTA to /new when there are no sessions')
it('renders the panel sections when sessions exist')   // comprobar headings / data-panel
```

## Implementation

1. Implementar carga + estados (cargando / vacío / con datos) en `Progress.tsx`.
2. Maquetar las secciones placeholder con sus títulos y contenedores.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F3-T013.
