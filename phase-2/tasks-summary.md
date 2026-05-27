# Exercise Tracker — Fase 2: Rediseño Visual

## Qué es la Fase 2

La Fase 1 entregó la aplicación completamente funcional: CRUD de sesiones, ejercicios y series, backup export/import, PWA instalable. Sin embargo, la UI es puro HTML sin estilos más allá de un reset mínimo.

La Fase 2 transforma esa base funcional en una app visualmente pulida con estética **Apple product-page** (iPhone.com), inspirada en la claridad y el refinamiento del sistema de diseño de Apple.

### Decisiones de diseño acordadas con el usuario

| Decisión | Elección |
|---|---|
| Paleta de color | Apple: `#f5f5f7` fondo, `#1d1d1f` texto, `#0071e3` acento azul |
| Modo oscuro | Automático (`prefers-color-scheme`), paleta Apple dark |
| Navegación | Tab bar fijo en la parte inferior (estilo iOS nativo) |
| Ejercicios | Filtro de búsqueda en el picker **ya implementado** (ver nota al pie) |

---

## Estructura de tareas

Las tareas se organizan en tres sub-fases secuenciales. Cada una es pre-requisito de la siguiente.

```
phase-2/
├── tasks-summary.md              ← este archivo (índice y estado)
├── A-design-system/              ← Sub-fase A: Tokens y primitivas CSS
│   ├── F2-T001-apple-palette.md
│   ├── F2-T002-typography-tokens.md
│   ├── F2-T003-button-system.md
│   ├── F2-T004-input-system.md
│   └── F2-T005-card-component.md
├── B-navigation/                 ← Sub-fase B: Navegación con tab bar
│   ├── F2-T006-tab-bar.md
│   └── F2-T007-app-shell.md
└── C-pages/                      ← Sub-fase C: Estilado de páginas
    ├── F2-T008-feed-styling.md
    ├── F2-T009-new-session-styling.md
    ├── F2-T010-session-detail-styling.md
    ├── F2-T011-settings-styling.md
    └── F2-T012-exercise-picker-styling.md
```

---

## Estado de las tareas

### Sub-fase A — Design System (fundación)

| ID | Título | Estado |
|---|---|---|
| F2-T001 | Apple color palette | `done` |
| F2-T002 | Typography & spacing tokens | `done` |
| F2-T003 | Button system | `done` |
| F2-T004 | Input / form field system | `done` |
| F2-T005 | Card component | `done` |

### Sub-fase B — Navigation Shell

| ID | Título | Estado |
|---|---|---|
| F2-T006 | Tab bar component | `done` |
| F2-T007 | App shell layout update | `done` |

### Sub-fase C — Feature Pages

| ID | Título | Estado |
|---|---|---|
| F2-T008 | Feed page styling | `done` |
| F2-T009 | New Session page styling | `done` |
| F2-T010 | Session Detail page styling | `done` |
| F2-T011 | Settings page styling | `done` |
| F2-T012 | Exercise Picker styling | `done` |

---

## Próxima tarea

**Fase 2 completa.** Todas las tareas (F2-T001 … F2-T012) están en `done`.

---

## Reglas globales (aplican a todas las tareas de la Fase 2)

Las mismas que en la Fase 1 (ver `Requirements.md` §10):

1. **TDD obligatorio**: escribir el test primero (rojo), luego el código mínimo (verde), luego refactorizar.
2. **Antes de marcar una tarea como `done`**, ejecutar:
   ```
   npm run lint
   npm run format:check
   npm test
   npm run build
   ```
   Todos deben terminar con código de salida 0.
3. **Descripciones de tests en inglés** (`describe` / `it`).
4. Actualizar el campo `status` del archivo `.md` de la tarea al empezar (`in-progress`) y al terminar (`done`).
5. Actualizar la tabla de estado en **este archivo** (`tasks-summary.md`) al completar cada tarea.
6. Mover el puntero "Próxima tarea" a la siguiente.

---

> **Nota — ExercisePicker filter**: El filtro de búsqueda del selector de ejercicios fue implementado durante la sesión de inicio de la Fase 2, antes de formalizar el sistema de tareas. Los tests están en `src/features/session-new/ExercisePicker.test.tsx`. No tiene número de tarea F2 asignado; se considera trabajo preparatorio de F2-T012.
