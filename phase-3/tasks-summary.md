# Exercise Tracker — Fase 3: Métricas, gráficas y proyecciones

## Qué es la Fase 3

Las Fases 1 (funcionalidad) y 2 (rediseño visual estética Apple) están completas. La Fase 3 añade una **nueva vista "Progreso"** con métricas, gráficas y proyecciones a partir de los entrenamientos registrados en IndexedDB.

Todo el cómputo es **en cliente, offline, sin backend**. Las gráficas se dibujan con **D3.js** usado como motor de cálculo (escalas, ejes, generadores de línea/área) mientras **React renderiza el SVG** — así mantenemos control del estilo Apple, el modo claro/oscuro automático y la testabilidad con React Testing Library.

### Decisiones de diseño acordadas con el usuario

| Decisión | Elección |
|---|---|
| Motor de gráficas | D3.js (submódulos `d3-scale`, `d3-shape`, `d3-array`, `d3-time`, `d3-time-format`) + React para el SVG |
| Métrica principal de progreso | **1RM estimado** (fórmula **Epley**), con toggles a peso máx / volumen / reps |
| Proyección | **Regresión lineal** sobre el 1RM estimado, ~4 semanas vista, **mín. 3 sesiones**, con rango = **intervalo de predicción al 80 %** |
| Frecuencia | Barras de nº de sesiones por periodo + **línea de media**, selector **Mes / Trimestre / Año** |
| Métricas extra | Records personales (PRs), volumen por grupo muscular, resumen cardio, tonelaje total |
| Navegación | **Nueva pestaña "Progreso"** (4º ícono en el tab bar, entre Entrenamientos y Ajustes), ruta `/progress` |
| Qué cuenta | **Toda sesión = 1 día** de entrenamiento (gimnasio, autocarga o cardio) |
| Ejercicios sin peso | Métrica adecuada por tipo: 1RM (con peso), reps (autocarga sin peso), segundos (plancha), distancia/duración (cardio) |
| Volumen / tonelaje | Solo suman las series **con peso** (kg). Autocarga sin peso no aporta kg |

---

## Fórmulas de referencia

### 1RM estimado (por serie) — Epley
```
reps = 1        → 1RM = weightKg
reps en 2..12   → 1RM = weightKg · (1 + reps / 30)
reps > 12       → no fiable; la serie se ignora para 1RM
```
Por sesión se toma el **mejor 1RM estimado** entre las series del ejercicio → un punto por fecha.

### Proyección — regresión lineal (mínimos cuadrados) + intervalo de predicción
Puntos `(tᵢ, yᵢ)`: `tᵢ` = días desde la primera sesión, `yᵢ` = 1RM estimado.
```
b = Σ(tᵢ−t̄)(yᵢ−ȳ) / Σ(tᵢ−t̄)²          (pendiente)
a = ȳ − b·t̄                              (intercepto)
ŷ(t) = a + b·t                            (predicción)

s = √( Σ(yᵢ − ŷᵢ)² / (n−2) )             (error estándar de la regresión)
margen(t₀) = t* · s · √( 1 + 1/n + (t₀−t̄)² / Σ(tᵢ−t̄)² )
rango = [ ŷ(t₀) − margen , ŷ(t₀) + margen ]   (intervalo de predicción 80 %)
```
`t₀ = t_última + 28 días`. `t*` = valor crítico de la t de Student con `n−2` g.l. al 80 % (dos colas). Solo se calcula con `n ≥ 3`; el resultado se clampa a valores no negativos.

---

## Estructura de tareas

```
phase-3/
├── tasks-summary.md              ← este archivo (índice y estado)
├── A-metrics-domain/             ← Sub-fase A: cálculo puro (sin React)
│   ├── F3-T001-one-rep-max.md
│   ├── F3-T002-linear-regression.md
│   ├── F3-T003-frequency-aggregation.md
│   ├── F3-T004-volume-tonnage.md
│   ├── F3-T005-cardio-totals.md
│   ├── F3-T006-personal-records.md
│   └── F3-T007-exercise-progress-series.md
├── B-chart-primitives/           ← Sub-fase B: primitivas de gráficas D3 + React
│   ├── F3-T008-use-element-width.md
│   ├── F3-T009-line-chart.md
│   └── F3-T010-bar-chart.md
├── C-navigation-shell/           ← Sub-fase C: navegación y shell de Progreso
│   ├── F3-T011-progress-tab-route.md
│   ├── F3-T012-progress-page-shell.md
│   └── F3-T013-segmented-control.md
└── D-panels/                     ← Sub-fase D: paneles de la vista Progreso
    ├── F3-T014-frequency-panel.md
    ├── F3-T015-exercise-progress-panel.md
    ├── F3-T016-projection-overlay.md
    ├── F3-T017-personal-records-panel.md
    ├── F3-T018-muscle-volume-panel.md
    ├── F3-T019-cardio-panel.md
    └── F3-T020-tonnage-panel.md
```

---

## Estado de las tareas

### Sub-fase A — Métricas (dominio puro)

| ID | Título | Estado |
|---|---|---|
| F3-T001 | Estimated 1RM (Epley) | `done` |
| F3-T002 | Linear regression + prediction interval | `done` |
| F3-T003 | Training frequency aggregation | `done` |
| F3-T004 | Volume by muscle group + total tonnage | `done` |
| F3-T005 | Cardio totals | `done` |
| F3-T006 | Personal records (PRs) | `done` |
| F3-T007 | Per-exercise progress series builder | `done` |

### Sub-fase B — Primitivas de gráficas

| ID | Título | Estado |
|---|---|---|
| F3-T008 | useElementWidth hook (responsive) | `done` |
| F3-T009 | LineChart primitive | `done` |
| F3-T010 | BarChart primitive | `done` |

### Sub-fase C — Navegación + shell de Progreso

| ID | Título | Estado |
|---|---|---|
| F3-T011 | "Progreso" tab + /progress route | `done` |
| F3-T012 | Progress page shell + empty state | `done` |
| F3-T013 | Segmented control component | `done` |

### Sub-fase D — Paneles

| ID | Título | Estado |
|---|---|---|
| F3-T014 | Frequency panel | `done` |
| F3-T015 | Exercise progress panel | `done` |
| F3-T016 | Projection overlay | `done` |
| F3-T017 | Personal records panel | `done` |
| F3-T018 | Muscle-group volume panel | `done` |
| F3-T019 | Cardio summary panel | `done` |
| F3-T020 | Total tonnage panel | `done` |

---

## Estado de la fase

**Fase 3 COMPLETADA el 2026-05-27.** Todas las tareas (F3-T001 … F3-T020) están en `done`.

Entregado: vista "Progreso" (ruta `/progress`, 4ª pestaña del tab bar) con paneles de frecuencia,
progreso por ejercicio (1RM/peso/volumen/reps) con proyección a 4 semanas (regresión lineal +
intervalo de predicción 80%), records personales, volumen por grupo muscular, resumen de cardio y
tonelaje total. Gráficas con D3.js (cálculo) + React (SVG). Suite completa en verde (`npm run lint`,
`npm run format:check`, `npm test`, `npm run build`). No hay tareas pendientes en esta fase.

---

## Reglas globales (aplican a todas las tareas de la Fase 3)

Las mismas que en Fases 1 y 2 (ver `Requirements.md` §10):

1. **TDD obligatorio**: escribir el test primero (rojo), luego el código mínimo (verde), luego refactorizar.
2. **Antes de marcar una tarea como `done`**, ejecutar y que todos terminen con código de salida 0:
   ```
   npm run lint
   npm run format:check
   npm test
   npm run build
   ```
3. **Descripciones de tests en inglés** (`describe` / `it`); el código y la UI siguen en español.
4. Actualizar el campo `status` del `.md` de la tarea al empezar (`in-progress`) y al terminar (`done`).
5. Actualizar la tabla de estado en **este archivo** al completar cada tarea.
6. Mover el puntero "Próxima tarea" a la siguiente.

### Convenciones específicas de la Fase 3

- **Dominio sin React**: las Sub-fases A viven en `src/domain/metrics/` como funciones puras, testeadas con Vitest. D3 **no** se usa para los cálculos clave (1RM, regresión, agregaciones): esos van a mano para que sean triviales de testear. D3 solo para escalas/ejes/paths en la Sub-fase B.
- **Dependencias nuevas**: instalar los submódulos D3 al empezar la Sub-fase B (`npm i d3-scale d3-shape d3-array d3-time d3-time-format` y sus `@types`). No añadir `d3-regression` (la regresión es propia, F3-T002).
- **Responsive**: las gráficas usan `<svg>` con `viewBox` + `width: 100%`. Prioridad **iPhone 13 Pro Max** (≈430 pt, single-column); tablet/desktop reutilizan el contenedor centrado (`.app-shell`, max-width 600px). Áreas táctiles ≥44px; tooltips por tap y foco accesible por teclado.
- **Carga de datos**: la página Progreso lee las sesiones con `useSessionRepository().list()` (igual que el Feed).
