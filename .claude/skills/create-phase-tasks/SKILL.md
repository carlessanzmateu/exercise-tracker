---
name: create-phase-tasks
description: Iniciar una nueva fase del Exercise Tracker o generar los archivos de tareas tras el refinamiento, siguiendo la convención `phase-N/` ya establecida. Triggers automáticos cuando el usuario dice frases como "vamos a planificar la fase X", "vamos a iniciar la fase X", "vamos con la fase X", "crea las tareas de la fase X", "redacta las tareas de la fase X", "planifiquemos la fase X". También invocable explícitamente con /create-phase-tasks. Cubre tanto el refinamiento (Q&A) como la generación de archivos. NO usar para implementar tareas ya creadas (eso es trabajo normal de TDD).
---

# Crear tareas de nueva fase

Workflow para planificar una nueva fase del Exercise Tracker y generar los
archivos `phase-N/` siguiendo la convención del proyecto (ver `phase-4/` y
`phase-5/` como referencia canónica).

## Argumentos opcionales

- `<número de fase>` — si el usuario lo dice (p. ej. "fase 7"), usarlo. Si no,
  inferir contando carpetas `phase-N/` existentes y proponer N+1.

## Paso 0 — Detectar contexto

1. Determinar el número de fase. Si no es claro:
   ```bash
   ls /Users/carlessanzmateu/training/exercise-tracker | grep '^phase-' | sort
   ```
   Proponer al usuario el siguiente número.
2. Revisar el `CLAUDE.md` del proyecto y `Requirements.md` para el contexto
   global (no leerlos en bloque si ya están cargados en el contexto).

## Paso 1 — Refinamiento (si todavía no se ha hecho)

Si la conversación actual no contiene aún las decisiones de diseño de esta
fase, conducir Q&A con `AskUserQuestion` hasta que estén cerradas.

**Áreas típicas a cerrar** (no todas aplican siempre):

- Modelo de datos nuevo (tipos, validaciones, decimales/enteros, unicidad).
- Persistencia: nuevos object stores, subir `DB_VERSION`, índices.
- Backup: subir `EXPORT_VERSION`, qué nuevos campos incluye, retro-compat
  con versiones anteriores.
- UI / navegación: ¿nueva ruta? ¿tab? ¿panel dentro de Progreso? ¿bloqueo si
  faltan datos?
- Filtros temporales y agregaciones (semana/mes/trimestre/etc.).
- Charts: reutilizar `LineChart`/`BarChart`, projection band, overlays.
- Edición y borrado: cómo se llega a una entrada, confirmaciones.
- Responsive: comportamiento en móvil vs tablet+ (umbral 640px).
- Cómo encaja con la siguiente fase prevista (escalabilidad / abstracciones).
- Importación/exportación: si hay nuevo formato, versión y tutorial.

**Reglas de Q&A**:

- Máximo 4 preguntas por bloque de `AskUserQuestion`.
- Cada pregunta tiene 2-4 opciones concretas y mutuamente excluyentes.
- Si el usuario interrumpe una pregunta para dar una respuesta libre, anotar
  esa respuesta y volver a preguntar SOLO las restantes.
- Mantener un resumen en cabeza ("Decisiones cerradas: ..."). Cuando el
  usuario diga que ya está bien, pasar al Paso 2.

## Paso 2 — Plan formal (recomendado)

1. Llamar a `EnterPlanMode`.
2. Hacer una exploración rápida del repo (con `Agent`/`Explore` o lecturas
   directas) para confirmar las APIs reutilizables que mencionarás (rutas
   exactas, firmas, etc.).
3. Escribir el plan al fichero indicado por el sistema (NO al repo). El plan
   debe incluir:
   - **Contexto** y motivación de la fase.
   - **Decisiones cerradas** (tabla).
   - **Reutilizable** (qué helpers/componentes existentes encajan, con rutas).
   - **Estructura `phase-N/`** (árbol de archivos a crear).
   - **Resumen de cada tarea** (1-2 líneas por tarea).
   - **Verificación end-to-end** (cómo se prueba la fase completa).
4. Llamar a `ExitPlanMode` para pedir aprobación.

## Paso 3 — Lectura de referencia

Antes de escribir los archivos, leer:
- `phase-N-1/tasks-summary.md` (la fase anterior) para mimar formato.
- Un par de tareas de la fase anterior (una de dominio puro, una de UI).

Esto garantiza coherencia visual con el resto del proyecto.

## Paso 4 — Creación de archivos

Crear estructura con `mkdir -p`:
```bash
mkdir -p /Users/carlessanzmateu/training/exercise-tracker/phase-N/A-...
mkdir -p /Users/carlessanzmateu/training/exercise-tracker/phase-N/B-...
# etc.
```

### `phase-N/tasks-summary.md` — secciones obligatorias

```markdown
# Exercise Tracker — Fase N: <título corto>

## Qué es la Fase N
<contexto + bullets de qué incluye>

### Decisiones acordadas con el usuario
<tabla decisión / elección>

### Diseño técnico clave
<puntos clave que diferencian esta fase>

---

## Reutilizable (ya en el repo)
<tabla recurso / ubicación / uso>

---

## Formatos de referencia
<JSON schemas / ejemplos si aplican>

---

## Estructura de tareas
<árbol de archivos>

---

## Estado de las tareas

### Sub-fase A — ...
| ID | Título | Estado |
|---|---|---|
| FN-T001 | ... | `todo` |

(repetir por subfase)

---

## Próxima tarea
**FN-T001** — ...

---

## Reglas globales (aplican a todas las tareas de la Fase N)
1. TDD obligatorio: test primero (rojo) → código mínimo (verde) → refactor.
2. Antes de marcar `done`, ejecutar:
   ```
   npm run lint
   npm run format:check
   npm test
   npm run build
   ```
3. Descripciones de tests en inglés; código y UI en español.
4. Actualizar `status` del `.md` de la tarea al empezar/terminar.
5. Actualizar la tabla en este archivo al completar cada tarea.
6. Mover el puntero "Próxima tarea".

### Convenciones específicas de la Fase N
<lo que sea específico>
```

### `phase-N/{X}-{slug}/F{N}-T{NNN}-{slug}.md` — formato canónico

```markdown
---
id: FN-T0NN
status: todo
title: <título corto en inglés>
sub-phase: X-slug
depends-on: [FN-T0NM, ...]
---

## Goal
<1 párrafo: qué se consigue y por qué importa>

## Context
<archivos a crear/editar con rutas absolutas o relativas a src/;
firmas TypeScript de las funciones nuevas;
reglas de comportamiento concretas>

## Tests (write first — RED)
<lista de `it('...')` y `describe('...')` en inglés;
nombres descriptivos al estilo "X does Y" o "throws when Z">

## Implementation
1. <paso 1>
2. <paso 2>
...

## Done when
- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F{N}-T{NNN+1}.
```

## Reglas de granularidad de tareas (críticas)

Cada tarea DEBE ser:

- **Atómica**: empezable y terminable en una sesión (~30-60 min de trabajo
  real). Si una tarea necesita "y también X", X probablemente es otra tarea.
- **Autoconclusiva**: al terminar deja el repo en verde (lint + format +
  tests + build).
- **Con dependencias explícitas**: `depends-on` enumera las tareas previas
  necesarias. Permite paralelizar las que no se bloquean entre sí.
- **TDD-explícito**: la sección "Tests" lista las pruebas concretas que se
  escribirán PRIMERO, en inglés.
- **Concreta**: rutas de archivo + firmas de funciones + comportamientos
  específicos. NO prosa vaga tipo "implementar la lógica".

### Organización típica de subfases

- `A-domain/` o `A-{tema}/` — dominio puro (sin React, sin IndexedDB).
  Suele tener 4-6 tareas: tipos, normalizadores, funciones puras.
- `B-persistence/` — cambios en IndexedDB + backup. 2-3 tareas: stores
  nuevos, métodos del repositorio, bump de versión de backup.
- `C-{tema}/` — integraciones específicas (Ajustes, perfil, etc.). 1-3
  tareas.
- `D-{tema}/` — UI feature completa. 4-7 tareas: componentes, rutas, formularios,
  listas, charts, headers.

## Paso 5 — Cierre

1. Listar la estructura final:
   ```bash
   find phase-N -type f | sort
   ```
2. Resumir al usuario qué se ha creado.
3. Recordarle que la implementación arranca con la primera tarea (FN-T001)
   en un turno separado, con TDD. NO empezar a implementar como parte de
   esta skill.

## Gates que toda tarea debe pasar antes de marcarse `done`

```
npm run lint
npm run format:check
npm test
npm run build
```

Los cuatro en código de salida 0. Si alguno falla, la tarea sigue
`in-progress`.

## Qué NO hace esta skill

- NO implementa las tareas (eso es trabajo TDD posterior).
- NO modifica `CLAUDE.md` automáticamente — solo lo hace si el usuario pide
  marcar la fase como en curso. La actualización al cerrar la fase se hace
  en la última tarea (`Fase N completa`).
- NO ejecuta `git commit` ni push.
- NO entra en detalles de fases muy lejanas (fase 7+); solo prepara la
  abstracción si las decisiones lo requieren.
