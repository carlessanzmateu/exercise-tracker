# Exercise Tracker — Fase 4: Importar datos de Salud (Apple Health)

## Qué es la Fase 4

Las Fases 1 (funcionalidad), 2 (rediseño Apple) y 3 (métricas/gráficas) están completas. La Fase 4
permite **importar datos de la app Salud del iPhone** (pasos y distancia diarios) y visualizarlos
en un nuevo panel **"Actividad"** dentro de la vista Progreso.

Cumple la integración con Apple Salud que `Requirements.md` §11 había aplazado.

### Contexto técnico (importante)

Safari **no expone HealthKit** a una PWA, y mantenemos las restricciones del proyecto (PWA pura,
sin backend, sin wrapper nativo). Por tanto, los datos entran **por fichero** que el usuario genera
en el iPhone con un **Atajo de Apple (Shortcuts)** que lee Pasos y Distancia (caminar+correr) y
guarda un JSON. Ese JSON se importa desde Ajustes.

### Decisiones acordadas con el usuario

| Decisión | Elección |
|---|---|
| Vía de entrada | **Atajo de Apple → fichero JSON** que se importa en el PWA (no HealthKit) |
| Formato del fichero | **JSON versionado**: `{ version: 1, days: [{ date, steps, distanceKm }] }` |
| Control de importación | En **Ajustes**, junto a exportar/importar backup |
| Persistencia | Nuevo object store IndexedDB **`healthDays`** (un registro por día), separado de las sesiones |
| Estrategia de import | **Fusión por día (upsert)**: idempotente, reimportar rangos solapados no duplica |
| Backup | El backup JSON pasa a **`version: 2`** incluyendo `healthDays` (lectura compatible de v1) |
| Ubicación visual | Nuevo panel **"Actividad"** en la vista Progreso |
| Métricas del panel | Pasos y distancia **diarios** (gráfica) + **media móvil de 7 días** + **totales y media por periodo** (selector Mes/Trimestre/Año) |
| No incluido | Objetivo de pasos; no se mezcla la distancia de Salud con la distancia de cardio registrado (fuentes separadas) |

---

## Formatos de referencia

### Fichero de importación de Salud (lo produce el Atajo)
```json
{
  "version": 1,
  "days": [
    { "date": "2026-05-25", "steps": 8423, "distanceKm": 6.21 },
    { "date": "2026-05-26", "steps": 11050, "distanceKm": 8.04 }
  ]
}
```
- `date`: `YYYY-MM-DD` (día local). `steps`: entero ≥ 0. `distanceKm`: número ≥ 0.

### Backup v2 (export/import de la app)
```json
{
  "version": 2,
  "exportedAt": "2026-05-27T10:30:00.000+02:00",
  "sessions": [ /* … */ ],
  "healthDays": [ { "date": "2026-05-25", "steps": 8423, "distanceKm": 6.21 } ]
}
```
- Al importar: `version: 1` (sin `healthDays`) sigue siendo válido; `version: 2` añade Salud.

---

## Estructura de tareas

```
phase-4/
├── tasks-summary.md                 ← este archivo (índice y estado)
├── A-health-data/                   ← Sub-fase A: modelo y persistencia
│   ├── F4-T001-health-data-model.md
│   └── F4-T002-health-repository.md
├── B-import-metrics/                ← Sub-fase B: parser y métricas (dominio puro)
│   ├── F4-T003-health-import-parser.md
│   ├── F4-T004-moving-average.md
│   └── F4-T005-activity-series.md
├── C-integration/                   ← Sub-fase C: backup y ajustes
│   ├── F4-T006-backup-v2.md
│   └── F4-T007-settings-health-import.md
└── D-ui-docs/                       ← Sub-fase D: panel Actividad y documentación
    ├── F4-T008-activity-panel.md
    └── F4-T009-shortcut-instructions.md
```

---

## Estado de las tareas

### Sub-fase A — Datos de Salud (modelo + persistencia)

| ID | Título | Estado |
|---|---|---|
| F4-T001 | Health data model & normalization | `done` |
| F4-T002 | Health repository (IndexedDB `healthDays`) | `done` |

### Sub-fase B — Importación y métricas (dominio puro)

| ID | Título | Estado |
|---|---|---|
| F4-T003 | Health import parser (JSON) | `done` |
| F4-T004 | Moving average helper | `done` |
| F4-T005 | Activity series + aggregates | `done` |

### Sub-fase C — Integración (backup + ajustes)

| ID | Título | Estado |
|---|---|---|
| F4-T006 | Backup v2 (incluye healthDays) | `done` |
| F4-T007 | Settings: importar datos de Salud | `done` |

### Sub-fase D — UI Actividad + documentación

| ID | Título | Estado |
|---|---|---|
| F4-T008 | Activity panel (Progreso) | `done` |
| F4-T009 | Instrucciones del Atajo | `done` |

---

## Estado de la fase

**Fase 4 COMPLETADA el 2026-05-27.** Todas las tareas (F4-T001 … F4-T009) están en `done`.

Entregado: importación de datos de Salud (pasos y distancia diarios) vía Atajo de Apple → fichero
JSON, con persistencia en IndexedDB (`healthDays`, upsert por día), backup v2 que incluye Salud,
acción de importación en Ajustes con ayuda del formato, y panel "Actividad" en Progreso (gráficas
diarias de pasos y distancia, media móvil de 7 días, totales y media por periodo). Suite completa
en verde (`npm run lint`, `npm run format:check`, `npm test`, `npm run build`).

---

## Reglas globales (aplican a todas las tareas de la Fase 4)

Las mismas que en fases anteriores (ver `Requirements.md` §10):

1. **TDD obligatorio**: test primero (rojo) → código mínimo (verde) → refactor.
2. **Antes de marcar `done`**, ejecutar y que terminen con código de salida 0:
   ```
   npm run lint
   npm run format:check
   npm test
   npm run build
   ```
3. **Descripciones de tests en inglés** (`describe`/`it`); código y UI en español.
4. Actualizar `status` del `.md` de la tarea al empezar (`in-progress`) y al terminar (`done`).
5. Actualizar la tabla de estado en **este archivo** al completar cada tarea.
6. Mover el puntero "Próxima tarea" a la siguiente.

### Convenciones específicas de la Fase 4

- **Dominio sin React** en `src/domain/health/` (tipos, parser, métricas) y `src/domain/metrics/`
  (media móvil, series de actividad), todo testeado con Vitest.
- **Persistencia**: la base IndexedDB sube a **versión 2** añadiendo el store `healthDays`
  (keyPath `date`). El `upgrade` debe crear el store sin tocar `sessions` (usuarios existentes).
- **Repositorio**: se extiende `SessionRepository` (`src/data/sessionRepository.ts`) con métodos de
  Salud (`listHealthDays`, `upsertHealthDays`, `clearHealthDays`) y se actualiza
  `createSessionRepository` y el mock `src/test/createMockRepo.ts`.
- **Reutilizar** los componentes de la Fase 3: `LineChart`, `BarChart`, `SegmentedControl`, y los
  helpers de periodo (`Granularity`, `periodIndex`, `bucketKeyLabel`).
- **Responsive**: prioridad iPhone 13 Pro Max; tablet/desktop reutilizan `.app-shell`.
