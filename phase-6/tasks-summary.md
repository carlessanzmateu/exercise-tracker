# Exercise Tracker — Fase 6: Peso corporal, perfil y BMR

## Qué es la Fase 6

Las Fases 1 (CRUD), 2 (rediseño Apple), 3 (métricas/gráficas), 4 (importar Salud
agregado por día) y 5 (importar Salud por muestras crudas) están completas. La
Fase 6 añade el **peso corporal** del usuario y su **tasa metabólica basal
(BMR)** como base para la fase 7 (balance energético: ingesta vs gasto).

Incluye:

- **Perfil de usuario** en Ajustes (altura, fecha de nacimiento, sexo) —
  necesario para Mifflin-St Jeor.
- **Nuevo tab "Peso"** con vista propia: registro de pesos por fecha, edición y
  borrado. **Varias entradas por día** permitidas; la gráfica colapsa por día
  con la media.
- **Gráfica peso/día** con 6 filtros (Sem/Mes/Trim/Sem(estre)/Año/YTD); ventana
  de **1 unidad** del filtro y **scroll lateral** acorde al filtro.
- **Tendencia + proyección**: regresión lineal de los datos visibles + banda de
  confianza extendida 1 unidad adelante **solo en la ventana actual**. En
  ventanas históricas se muestra solo la tendencia.
- **Cabecera con BMR de hoy** (cifra única, kcal/día), oculta hasta que existan
  perfil + ≥1 peso.
- **Backup v3** con `profile` + `weightEntries`; v1/v2 siguen siendo importables
  (sin esos campos → tratados como vacíos).
- **BMR aislado** como función pura reutilizable, lista para que fase 7 le sume
  gasto por actividad e ingesta calórica encima.

### Decisiones acordadas con el usuario

| Decisión | Elección |
|---|---|
| Perfil | `heightCm`, `birthdate` (date picker nativo `<input type="date">`), `sex: 'male' \| 'female'` (UI: "Hombre"/"Mujer") |
| Dónde vive el perfil | Sección "Perfil" en **Ajustes**, una sola vez. Persistente y backupeable. Anchor `#perfil` para deep-link |
| BMR cabecera | **Solo BMR** (cifra única, kcal/día). Sin TDEE ni desglose por actividad. Fase 7 añade lo demás encima |
| Entradas por día | **Varias** permitidas. La gráfica colapsa por día con la **media** |
| Filtros temporales | `week`, `month`, `quarter`, `semester`, `year`, `ytd`. Default = `month` |
| Ventana + scroll | **Ventana = 1 unidad del filtro; scroll = 1 unidad atrás**. YTD no scrollea |
| Proyección | 1 unidad del filtro adelante + banda de confianza, **solo en la ventana actual**. En ventanas pasadas se muestra solo la tendencia |
| Tendencia | **Regresión lineal de los datos visibles** (mismo modelo que la proyección). Reutiliza `linearRegression` + `predictionInterval` de fase 3 |
| Navegación | **Nuevo tab "Peso"** en la barra inferior (5 tabs en total) |
| Editar entradas | **Lista debajo de la gráfica** (orden desc por fecha). Tap → editar (fecha + peso) / borrar (con confirmación) |
| Sin perfil | **Bloquea** la vista de Peso con CTA → `/settings#perfil` |
| Scroll lateral | **Móvil** (< 640px): solo swipe. **Tablet+** (≥ 640px): swipe + botones ←/→ |
| UI del filtro | **Pills horizontales** con scroll horizontal si no caben |
| Validación nacimiento | No futura, edad ≥ 5 años |
| BMR redondeo | Entero (kcal/día) |
| Fase 7 (no se hace ahora) | Balance energético: ingesta + gasto por actividad sobre el BMR como base |

### Diseño técnico clave

- **`computeBmrMifflinStJeor`** se aísla en `src/domain/metabolism/bmr.ts` como
  función pura `({ weightKg, heightCm, ageYears, sex }) → number`. Sin React,
  sin dependencias. Fase 7 podrá envolverla en `computeTdee(bmr, activityKcal)`
  sin tocar nada de fase 6.
- **Scroll lateral** cambia datos (no es overflow del SVG): el componente
  redibuja la `LineChart` con la ventana correspondiente al `offsetUnits`. Más
  testeable y fiable que un scroll de DOM.
- **Edición de fecha sin conflicto**: como permitimos varias entradas por día,
  mover una entrada a otro día nunca colisiona.

---

## Reutilizable (ya en el repo)

| Recurso | Ubicación | Uso en fase 6 |
|---|---|---|
| Regresión lineal | `src/domain/metrics/regression.ts` (`linearRegression`, `predictionInterval`) | Tendencia + proyección |
| Patrón ProjectionBand | `src/features/progress/ExerciseProgressPanel.tsx:51-52` | Cómo se mapean `yHat/lower/upper` a `LinePoint[]` |
| `LineChart` con projection + overlay | `src/components/charts/LineChart.tsx` | Renderiza datos + tendencia + banda |
| Formato de eje X adaptativo | `LineChart.tsx` (esta sesión) | Funciona ya con cualquiera de los 6 filtros |
| Patrón IndexedDB upgrade idempotente | `src/data/sessionRepository.ts` (`!db.objectStoreNames.contains(...)`) | DB v2 → v3, añadiendo dos stores |
| Mock repo | `src/test/createMockRepo.ts` | Extender con los nuevos métodos para tests |
| `TabBar` | `src/components/TabBar.tsx` | Añadir el 5º `<Link>` "Peso" |

---

## Formatos de referencia

### Backup v3 (export/import de la app)
```json
{
  "version": 3,
  "exportedAt": "2026-05-28T10:30:00.000+02:00",
  "sessions": [ /* … */ ],
  "healthDays": [ /* … */ ],
  "profile": { "heightCm": 175, "birthdate": "1990-05-26", "sex": "male" },
  "weightEntries": [
    { "id": "uuid-1", "recordedAt": "2026-05-28T08:30:00", "weightKg": 75.3 }
  ]
}
```
- Al importar: `version: 1` (solo sesiones) y `version: 2` (sesiones+salud)
  siguen siendo válidos; `version: 3` añade perfil y pesos. Para v1/v2 los
  campos nuevos se tratan como vacíos.
- `profile` puede ser `null` (perfil no configurado todavía).

### Estructura de almacenamiento (IndexedDB v3)

| Store | keyPath | Índices | Notas |
|---|---|---|---|
| `sessions` | `id` | `startedAt` | Existente (fase 1) |
| `healthDays` | `date` | — | Existente (fase 4) |
| `userProfile` | `id` | — | Único registro con `id: 'me'` |
| `weightEntries` | `id` | `recordedAt` | UUID v4 por entrada |

---

## Estructura de tareas

```
phase-6/
├── tasks-summary.md                       ← este archivo (índice y estado)
├── A-domain/                              ← Sub-fase A: dominio puro
│   ├── F6-T001-user-profile-model.md
│   ├── F6-T002-weight-entry-model.md
│   ├── F6-T003-aggregate-weight-by-day.md
│   ├── F6-T004-window-range.md
│   └── F6-T005-bmr-mifflin-st-jeor.md
├── B-persistence/                         ← Sub-fase B: IndexedDB + backup
│   ├── F6-T006-profile-repository.md
│   ├── F6-T007-weight-repository.md
│   └── F6-T008-backup-v3.md
├── C-profile/                             ← Sub-fase C: Perfil en Ajustes
│   └── F6-T009-settings-profile-section.md
└── D-weight-view/                         ← Sub-fase D: vista Peso
    ├── F6-T010-tabbar-weight-route.md
    ├── F6-T011-weight-add-form.md
    ├── F6-T012-weight-entries-list.md
    ├── F6-T013-filter-pills.md
    ├── F6-T014-weight-chart-scroller.md
    ├── F6-T015-weight-trend-projection.md
    └── F6-T016-weight-bmr-header.md
```

---

## Estado de las tareas

### Sub-fase A — Dominio puro

| ID | Título | Estado |
|---|---|---|
| F6-T001 | User profile model & normalization | `done` |
| F6-T002 | Weight entry model & normalization | `done` |
| F6-T003 | Aggregate weight entries by day | `done` |
| F6-T004 | Window range per filter | `done` |
| F6-T005 | BMR Mifflin-St Jeor (pure) | `done` |

### Sub-fase B — Persistencia (IndexedDB + backup)

| ID | Título | Estado |
|---|---|---|
| F6-T006 | Profile repository (IndexedDB `userProfile`) | `done` |
| F6-T007 | Weight repository (IndexedDB `weightEntries`) | `done` |
| F6-T008 | Backup v3 (profile + weights) | `done` |

### Sub-fase C — Perfil en Ajustes

| ID | Título | Estado |
|---|---|---|
| F6-T009 | Settings: profile section | `done` |

### Sub-fase D — Vista de Peso

| ID | Título | Estado |
|---|---|---|
| F6-T010 | TabBar entry + `/weight` route + block-when-no-profile | `done` |
| F6-T011 | Weight add form (inline) | `done` |
| F6-T012 | Weight entries list (edit + delete) | `done` |
| F6-T013 | FilterPills component (generic) | `done` |
| F6-T014 | Weight chart scroller (window + lateral scroll) | `done` |
| F6-T015 | Trend + projection on weight chart | `done` |
| F6-T016 | BMR header (today, single number) | `done` |

---

## Próxima tarea

**Fase 6 completa.** No queda trabajo pendiente.

---

## Estado de la fase

**Fase 6 COMPLETADA el 2026-05-28.** Todas las tareas (F6-T001 … F6-T016) están en `done`.

Entregado:
- Dominio puro: `UserProfile`, `WeightEntry`, agregación diaria, ventanas de los 6 filtros, BMR Mifflin-St Jeor como función pura (preparada para fase 7).
- Persistencia: DB v3 con stores `userProfile` y `weightEntries`, repositorio con CRUD completo y backup v3 compatible con v1/v2.
- Perfil en Ajustes con anchor `#perfil` y validación.
- Nuevo tab "Peso" con bloqueo si no hay perfil, formulario inline para añadir peso, lista de entradas (editar/borrar con confirmación), gráfica con filtro de 6 ventanas (Sem/Mes/Trim/Sem/Año/YTD), scroll lateral (swipe móvil + botones tablet+), tendencia + proyección con banda de confianza solo en la ventana actual, y cabecera con BMR de hoy.
- Suite completa en verde (`npm run lint`, `npm run format:check`, `npm test`, `npm run build`).

---

## Reglas globales (aplican a todas las tareas de la Fase 6)

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
4. Actualizar `status` del `.md` de la tarea al empezar (`in-progress`) y al
   terminar (`done`).
5. Actualizar la tabla de estado en **este archivo** al completar cada tarea.
6. Mover el puntero "Próxima tarea" a la siguiente.

### Convenciones específicas de la Fase 6

- **Dominio sin React** en `src/domain/profile/`, `src/domain/weight/` y
  `src/domain/metabolism/`. Todo testeado con Vitest.
- **`computeBmrMifflinStJeor` debe ser una función pura** (entrada → salida,
  sin side-effects ni dependencias) para que fase 7 pueda envolverla en
  `computeTdee(...)` sin tocar fase 6.
- **Persistencia**: la base IndexedDB sube a **versión 3** añadiendo dos stores
  (`userProfile` y `weightEntries`). El `upgrade` debe crearlos sin tocar
  `sessions` ni `healthDays`.
- **Backup v3**: `EXPORT_VERSION = 3`. Import sigue aceptando v1 y v2 con
  perfil/pesos vacíos.
- **Reutilizar** lo de fase 3: `linearRegression`, `predictionInterval`,
  `LineChart` con `projection`/`overlay`, formato de eje X adaptativo.
- **Responsive**: prioridad iPhone 13 Pro Max; tablet/desktop reutilizan
  `.app-shell`. El scroll lateral cambia su mecánica en `≥ 640px`.
