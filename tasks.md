# Exercise Tracker — Tasks (Fase 1)

Plan de trabajo derivado de `Requirements.md`. Cada tarea cumple cuatro principios:

1. **TDD**: la tarea siempre empieza por uno o más tests que fallan; el código de producción se escribe únicamente para hacerlos pasar.
2. **Atómica**: el cambio es lo más pequeño posible manteniendo sentido propio.
3. **Autoconclusiva**: al terminarla el repositorio queda compilable, con todos los tests en verde, y un usuario o desarrollador puede verificarla sin trabajo extra.
4. **Aporta valor**: cada tarea entrega algo observable (un test que cubre un comportamiento, un componente visible, una capacidad nueva del usuario o una pieza necesaria para la siguiente).

---

## Notación y cómo navegar este documento

Cada tarea es un ítem con checkbox:

- `- [ ] **T###** — Título` → **pendiente**
- `- [~] **T###** — Título` → **en progreso**
- `- [x] **T###** — Título` → **completada**

Los IDs `T001`, `T002`, … son **estables**: no se renumeran. Si se añaden tareas nuevas a posteriori, se asignan el siguiente ID libre (aunque no estén al final del fichero); si se eliminan, el ID queda retirado y no se reutiliza.

**Cómo encontrar la siguiente tarea**:
- Mirar el bloque "Próxima tarea" justo debajo (puntero explícito).
- O bien `grep -n "^- \[ \]" tasks.md | head -1` para obtener el primer pendiente en orden de aparición.
- Cada tarea tiene un campo `Depende de:` que indica si hay bloqueos. Si la siguiente en orden tiene una dependencia no completada, saltar a la siguiente que no esté bloqueada.

**Cómo registrar el progreso**:
1. Antes de empezar: cambiar `[ ]` por `[~]` y actualizar "Próxima tarea" si era esta.
2. Al terminar: cambiar `[~]` por `[x]` y mover el puntero a la siguiente.
3. Tests en verde es condición necesaria para marcar `[x]`. Si quedan tests rojos, sigue `[~]`.

**Cómo añadir tareas nuevas**: usar el siguiente ID libre, colocarla en el hito que corresponda, declarar `Depende de:`.

---

## Próxima tarea

**T054** — Validación manual en dispositivos reales (iPhone, tablet, desktop) — requiere acción del usuario; ver `Verification.md`

---

## Convenciones generales (válidas para todas las tareas)

- Cada tarea incluye `Tests`, `Implementación`, `Hecho cuando`, `Depende de`.
- `Tests` describe el o los tests que se escriben **primero** (red).
- `Implementación` indica el cambio mínimo de producción para pasarlos (green).
- `Hecho cuando` es el criterio binario para marcar `[x]`.
- `Depende de` lista IDs `T###` que deben estar completados antes de empezar.
- **Descripciones de tests en inglés (obligatorio)**: los strings de `describe(...)` y `it(...)` se escriben siempre en inglés, en estilo "X does Y" / "throws when Z". El código de la app y la UI siguen siendo en español (copy, errores de dominio, etc.), pero la suite de tests es íntegramente en inglés. Ver `Requirements.md` §10.3.

### Requisitos globales que se aplican a TODA tarea para poder marcarla `[x]`

Estos requisitos son **adicionales** a lo que cada tarea declara en su bloque `Hecho cuando`, y aplican siempre que la herramienta correspondiente esté configurada en el proyecto:

1. **Todos los tests en verde** (`npm test`): cero tests rojos, cero `skip` nuevos.
2. **Lint impoluto** (`npm run lint`): **0 errores y 0 warnings**. El script de lint debe ejecutarse con `--max-warnings 0` para que un warning haga fallar el comando (ver T004). No se aceptan supresiones (`eslint-disable`) salvo que se justifiquen por escrito en el código y se acuerden explícitamente con el usuario.
3. **Formato consistente** (`npm run format:check`): 0 ficheros con formato pendiente.
4. **Build verde** (`npm run build`): el proyecto compila sin errores de TypeScript ni del bundler.

Si alguna herramienta todavía no está configurada (típicamente porque la tarea actual es precisamente la que la introduce), el requisito asociado queda vacuamente cumplido hasta que esa tarea se complete. A partir de T002, lint y formato son obligatorios para todas las tareas posteriores; a partir de T003, los tests lo son.

Antes de marcar una tarea como `[x]`, ejecutar localmente como mínimo:

```
npm run lint
npm run format:check
npm test
npm run build
```

Todos deben terminar con código de salida 0.

---

## Hito 0 — Setup del proyecto

Objetivo: tener un proyecto que compila, sirve, y corre tests vacíos en verde. Sin lógica de negocio aún.

- [x] **T001 — Inicializar proyecto Vite + React + TypeScript**
  - Tests: (bootstrap — el runner de tests llega en T003). La verificación se reduce a chequeos de build: `npm run build` termina con código 0 y `dist/index.html` referencia el bundle.
  - Implementación: estructura mínima de Vite + React + TS (`index.html`, `src/main.tsx`, `src/App.tsx`), `tsconfig.json` estricto, `vite.config.ts`, `package.json` con scripts `dev`, `build`, `preview`, `test` (placeholder hasta T003), `.gitignore`.
  - Hecho cuando: `npm run build` compila sin errores y `dist/` contiene el bundle.
  - Depende de: —

- [x] **T002 — Configurar ESLint + Prettier con tolerancia cero a warnings**
  - Tests:
    - `npm run lint` termina con código 0 y reporta **0 errores y 0 warnings** sobre el código actual.
    - `npm run format:check` termina con código 0.
    - Introducir intencionalmente un warning (p. ej. variable no usada) hace fallar `npm run lint` con código distinto de 0 (verifica que `--max-warnings 0` está activo).
  - Implementación:
    - Configuración ESLint en `eslint.config.js` (flat config, ESLint 9) — o `.eslintrc` con ESLint 8 si se prefiere — con reglas para React + TS (`typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`).
    - `.prettierrc` con estilo del proyecto y `eslint-config-prettier` para desactivar reglas de ESLint que choquen con Prettier.
    - Script `lint` en `package.json`: `eslint . --max-warnings 0` (en ESLint 9 con flat config el `--ext` se omite; con ESLint 8 sería `eslint . --ext .ts,.tsx --max-warnings 0`).
    - Scripts `format` (`prettier --write .`) y `format:check` (`prettier --check .`).
  - Hecho cuando: los tres tests pasan; el proyecto queda en estado lint-clean y format-clean.
  - Depende de: T001

- [x] **T003 — Configurar Vitest + React Testing Library + jsdom**
  - Tests: el smoke test de T001 corre bajo Vitest; un test trivial (`expect(1+1).toBe(2)`) también pasa.
  - Implementación: dependencias `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`; `vite.config.ts` con `test.environment = 'jsdom'`; `src/test/setup.ts` con `@testing-library/jest-dom`.
  - Hecho cuando: `npm test` corre los tests en jsdom y todos pasan; lint y format siguen impolutos.
  - Depende de: T001, T002

- [x] **T004 — Integrar fake-indexeddb en el setup global de tests**
  - Tests: un test que abre una `IDBDatabase` con `fake-indexeddb` y crea un object store sin errores.
  - Implementación: dependencia `fake-indexeddb`; importar el shim en `src/test/setup.ts` para que `indexedDB` esté disponible en Node.
  - Hecho cuando: el test descrito pasa sin necesidad de un navegador real; lint y format siguen impolutos.
  - Depende de: T003

- [x] **T005 — Alias de importación `@/` apuntando a `src/`**
  - Tests: un test importa un módulo usando `@/...` y resuelve correctamente.
  - Implementación: alias en `vite.config.ts` y en `tsconfig.json` (`paths`).
  - Hecho cuando: el test que usa `@/` compila y pasa.
  - Depende de: T003

- [x] **T006 — Configurar vite-plugin-pwa con manifest mínimo**
  - Tests: tras `npm run build` existe `dist/manifest.webmanifest` con `name = "Exercise Tracker"` y `display = "standalone"` (test puede ser un script Node que abre el JSON tras un build, o verificación en CI; alternativamente un test unitario sobre la configuración exportada).
  - Implementación: `vite-plugin-pwa` registrado; manifest con `name`, `short_name`, `description`, `start_url`, `display`, `theme_color`, `background_color`; iconos placeholder (`192`, `512`, `180`).
  - Hecho cuando: el manifest se genera con los campos esperados.
  - Depende de: T001

---

## Hito 1 — Modelo de dominio (tipos puros y catálogo)

Objetivo: las primitivas de dominio están definidas y testeadas. No tocan IndexedDB ni UI.

- [x] **T007 — Definir tipos del dominio**
  - Tests: tests de tipo (compilación) ejercitando que los tipos sean coherentes; un test de runtime puede validar shape de un objeto de ejemplo con `satisfies` o assertions.
  - Implementación: `src/domain/types.ts` con `ExerciseShape`, `ExerciseType`, `Session`, `Exercise`, `Set` (strength/bodyweight/time), `CardioData`.
  - Hecho cuando: los tipos compilan y se usan en al menos un test.
  - Depende de: T003, T005

- [x] **T008 — Catálogo de los 24 tipos de ejercicio**
  - Tests:
    - El catálogo tiene exactamente 24 entradas.
    - Todos los IDs son únicos.
    - Las categorías esperadas existen: Pecho, Espalda, Hombros, Piernas, Brazos, Core, Autocarga, Cardio.
    - Cada tipo tiene `shape` válido (`strength | bodyweight | time | cardio`).
    - "Plancha" tiene shape `time`; "Caminar" y "Correr" tienen shape `cardio`; las 15 máquinas tienen shape `strength`; los 6 ejercicios de autocarga (sin Plancha) tienen shape `bodyweight`.
  - Implementación: `src/domain/catalog.ts` con `EXERCISE_CATALOG: ExerciseType[]` cumpliendo las afirmaciones de los tests.
  - Hecho cuando: todos los tests pasan.
  - Depende de: T007

- [x] **T009 — Helper `getExerciseTypeById`**
  - Tests: devuelve el tipo cuando el id existe; devuelve `undefined` cuando no.
  - Implementación: función pura sobre `EXERCISE_CATALOG`.
  - Hecho cuando: ambos tests pasan.
  - Depende de: T008

- [x] **T010 — Helper `getCatalogGroupedByCategory`**
  - Tests: devuelve un objeto/Map con las 8 categorías como claves; el total de tipos sumados es 24; el orden de categorías es estable.
  - Implementación: función pura sobre `EXERCISE_CATALOG`.
  - Hecho cuando: los tests pasan.
  - Depende de: T008

- [x] **T011 — Factory `newSession`**
  - Tests: el objeto resultante tiene `id` UUID v4 válido, `startedAt` ISO 8601 igual al `now` inyectado, `createdAt === updatedAt === startedAt`, `exercises: []`.
  - Implementación: `src/domain/factories.ts` con `newSession({ now }: { now: Date })`. La función acepta un reloj inyectable para ser determinista en tests.
  - Hecho cuando: los tests pasan.
  - Depende de: T007

- [x] **T012 — Factories `newExercise`, `newSetForShape`, `newCardioBlock`**
  - Tests:
    - `newExercise(typeId, order)` valida que el `typeId` existe en catálogo; arroja si no.
    - `newSetForShape('strength', { reps, weightKg })` exige ambos; valida que sean números >= 0.
    - `newSetForShape('bodyweight', { reps, weightKg? })` permite `weightKg` ausente.
    - `newSetForShape('time', { reps, durationSeconds })` exige ambos > 0.
    - `newCardioBlock({ durationMinutes, distanceKm? })` exige `durationMinutes > 0`.
  - Implementación: extender `src/domain/factories.ts`.
  - Hecho cuando: los tests pasan.
  - Depende de: T008, T011

---

## Hito 2 — Repositorio (IndexedDB)

Objetivo: capa de persistencia aislada y mockeable, con tests que corren contra `fake-indexeddb`.

- [x] **T013 — `SessionRepository.openDB` con schema inicial**
  - Tests: tras `openDB()` existe el object store `sessions` con `keyPath = "id"` y un índice por `startedAt`.
  - Implementación: `src/data/sessionRepository.ts` con `openDB()` usando `idb`.
  - Hecho cuando: los tests pasan contra `fake-indexeddb`.
  - Depende de: T004, T007

- [x] **T014 — `SessionRepository.save` y `getById`**
  - Tests: guardar una sesión y recuperarla por id devuelve un objeto profundamente igual; recuperar un id inexistente devuelve `undefined`.
  - Implementación: métodos `save(session)` y `getById(id)`.
  - Hecho cuando: los tests pasan.
  - Depende de: T013, T011

- [x] **T015 — `SessionRepository.list` ordenado por `startedAt` descendente**
  - Tests: guardar 3 sesiones con fechas distintas; `list()` las devuelve con la más reciente primero.
  - Implementación: leer por el índice `startedAt` en reversa.
  - Hecho cuando: el test pasa.
  - Depende de: T014

- [x] **T016 — `SessionRepository.update` actualiza `updatedAt`**
  - Tests: actualizar una sesión modifica `updatedAt` (usando reloj inyectado), preserva `createdAt` y persiste cambios.
  - Implementación: método `update(session)` que reescribe el documento aplicando el reloj.
  - Hecho cuando: el test pasa.
  - Depende de: T014

- [x] **T017 — `SessionRepository.delete`**
  - Tests: borrar por id elimina la sesión; `getById` posterior devuelve `undefined`; `list` no la incluye.
  - Implementación: método `delete(id)`.
  - Hecho cuando: los tests pasan.
  - Depende de: T014

- [x] **T018 — `SessionRepository.exportAll`**
  - Tests: el objeto devuelto tiene `version: 1`, `exportedAt` ISO, y `sessions` igual a `list()`.
  - Implementación: método `exportAll(now)`.
  - Hecho cuando: el test pasa.
  - Depende de: T015

- [x] **T019 — `SessionRepository.importAll` (reemplazo total)**
  - Tests:
    - Importar un payload válido reemplaza el contenido actual.
    - Importar un payload con `version` desconocido arroja un error tipado.
    - Importar un payload malformado (sin `sessions`) arroja un error tipado.
  - Implementación: método `importAll(payload)` que valida y reemplaza tras truncar el store.
  - Hecho cuando: los tests pasan.
  - Depende de: T018

- [x] **T020 — Manejo de IndexedDB no disponible**
  - Tests: simular `indexedDB === undefined`; `openDB()` arroja `IndexedDBUnavailableError`.
  - Implementación: detección y error tipado.
  - Hecho cuando: el test pasa.
  - Depende de: T013

---

## Hito 3 — Shell UI y tema

Objetivo: estructura visual base. Sin lógica de negocio aún; solo el "esqueleto".

- [x] **T021 — App shell con layout mobile first**
  - Tests:
    - Render de `<App />` contiene un `<main>` y un encabezado con el texto "Exercise Tracker".
    - El layout base está pensado a partir del viewport móvil (375 px): test en jsdom que verifica que el contenedor principal no impone `min-width` y que su `box-sizing` permite escalar.
  - Implementación: `src/App.tsx` con layout básico, fuente del sistema (SF/system-ui), reset CSS mínimo. El responsive hacia tablet/desktop se entrega en T055.
  - Hecho cuando: los tests pasan.
  - Depende de: T003

- [x] **T055 — Responsive: tablet y desktop (mobile-first → contenedor centrado en viewports anchos)**
  - Tests:
    - En jsdom, simular viewport `>= 1024 px` (con `window.matchMedia` y/o ajustar `document.documentElement.clientWidth` mediante un helper) y comprobar que el contenedor principal aplica una clase/estilo con `max-width` y margen automático horizontal.
    - En viewport `< 640 px`, el contenedor ocupa el 100% del ancho disponible (sin `max-width` activo).
    - Un test verifica que el manifest declara `orientation: "any"` (o que no fuerza `portrait`).
    - Un test verifica que existe regla CSS `:focus-visible` aplicada a elementos interactivos (botones/enlaces); puede hacerse inspeccionando la hoja de estilos generada o la presencia de la regla en el CSS importado.
  - Implementación:
    - Estilos responsive con media queries para `>= 640 px` y `>= 1024 px` siguiendo §7.4 y §7.5 de `Requirements.md`.
    - Contenedor principal con `max-width: ~600 px` y `margin-inline: auto` en viewports anchos; padding lateral mayor en desktop.
    - Reglas `:hover` para elementos interactivos en `(hover: hover) and (pointer: fine)`.
    - Reglas `:focus-visible` para soporte de navegación por teclado.
    - Ajuste del manifest a `orientation: "any"` si T024 ya estuviera completo, o coordinación con T024 si todavía no.
  - Hecho cuando: los tests pasan; al ejecutar `npm run dev` y redimensionar el navegador entre 320 px, 768 px y 1280 px, la app es usable y bien presentada en los tres rangos.
  - Depende de: T021

- [x] **T022 — Tema claro/oscuro automático vía `prefers-color-scheme`**
  - Tests: snapshot/serialización de las CSS custom properties cambia cuando se simula `matchMedia('(prefers-color-scheme: dark)')`.
  - Implementación: variables CSS para colores, definidas en `:root` y `@media (prefers-color-scheme: dark)`.
  - Hecho cuando: el test pasa.
  - Depende de: T021

- [x] **T023 — Router básico con cuatro rutas**
  - Tests: navegar a `/`, `/new`, `/session/:id`, `/settings` renderiza el componente esperado (placeholder).
  - Implementación: React Router (o equivalente mínimo) con esos cuatro destinos.
  - Hecho cuando: los tests pasan.
  - Depende de: T021

- [x] **T024 — Manifest e iconos definitivos**
  - Tests: validar tras `build` que `manifest.webmanifest` contiene `name = "Exercise Tracker"`, iconos `192`, `512` y `apple-touch-icon` `180`, `theme_color` y `background_color` coherentes con el tema claro, y `orientation = "any"`.
  - Implementación: actualizar configuración de `vite-plugin-pwa` y assets de iconos.
  - Hecho cuando: el test pasa.
  - Depende de: T006

---

## Hito 4 — Feed (read path)

Objetivo: el usuario abre la app y ve sus sesiones (o un estado vacío).

- [x] **T025 — Estado vacío del feed con CTA**
  - Tests: si el repo devuelve `[]`, el componente muestra un mensaje vacío y un botón "Añadir entrenamiento".
  - Implementación: `src/features/feed/Feed.tsx` con dependencia inyectable del repositorio (para tests).
  - Hecho cuando: el test pasa.
  - Depende de: T015, T023

- [x] **T026 — Renderizar lista de sesiones**
  - Tests: con N sesiones mockeadas, el feed renderiza N tarjetas en el orden devuelto por el repo.
  - Implementación: render de tarjetas a partir de `list()`.
  - Hecho cuando: el test pasa.
  - Depende de: T025

- [x] **T027 — Agrupación por mes con encabezados**
  - Tests: con sesiones en abril y mayo de 2026, el feed muestra dos encabezados ("Mayo 2026" antes de "Abril 2026") y las tarjetas debajo de su mes.
  - Implementación: agrupador puro testeable + render con headers.
  - Hecho cuando: el test pasa.
  - Depende de: T026

- [x] **T028 — Tarjeta de sesión muestra fecha+hora y nº de ejercicios**
  - Tests: dada una sesión con 4 ejercicios, la tarjeta contiene la fecha+hora formateada y el texto "4 ejercicios"; con 1 ejercicio muestra "1 ejercicio".
  - Implementación: componente `SessionCard`.
  - Hecho cuando: los tests pasan.
  - Depende de: T026

- [x] **T029 — Formato de fecha en español**
  - Tests: helper `formatSessionDate(date)` devuelve "Lun 25 may · 10:30" para una fecha conocida.
  - Implementación: usar `Intl.DateTimeFormat('es-ES', …)` en un helper puro.
  - Hecho cuando: el test pasa.
  - Depende de: T028

---

## Hito 5 — Crear sesión con ejercicios y series

Objetivo: el usuario puede registrar una sesión completa con ejercicios de las cuatro formas.

- [x] **T030 — Pantalla "Nueva sesión" con fecha+hora editable**
  - Tests: al montar, el datetime se inicializa con `now` inyectado; editarlo actualiza el estado.
  - Implementación: `src/features/session-new/NewSession.tsx`.
  - Hecho cuando: el test pasa.
  - Depende de: T011, T023

- [x] **T031 — Guardar sesión vacía persiste en el repositorio**
  - Tests: pulsar "Guardar" llama a `repo.save(session)` con los campos esperados y navega al feed.
  - Implementación: handler de submit.
  - Hecho cuando: el test pasa.
  - Depende de: T030, T014

- [x] **T032 — Selector de tipo de ejercicio agrupado por categoría**
  - Tests: el selector muestra las 8 categorías y dentro de cada una sus tipos; seleccionar un tipo emite el `typeId` esperado.
  - Implementación: `ExercisePicker` reusando `getCatalogGroupedByCategory`.
  - Hecho cuando: el test pasa.
  - Depende de: T010

- [x] **T033 — Añadir ejercicio (vacío) a la sesión actual**
  - Tests: tras seleccionar un tipo, la sesión en estado pasa a tener un ejercicio con `order` correcto y `sets: []` / cardio vacío.
  - Implementación: reductor o función de estado.
  - Hecho cuando: el test pasa.
  - Depende de: T032, T012

- [x] **T034 — Formulario "Añadir serie" para forma `strength`**
  - Tests: requiere reps y peso (>0); pulsar "Añadir" agrega la serie al ejercicio y limpia el formulario; valores inválidos no se aceptan.
  - Implementación: `StrengthSetForm`.
  - Hecho cuando: los tests pasan.
  - Depende de: T033

- [x] **T035 — Formulario "Añadir serie" para forma `bodyweight`**
  - Tests: requiere reps (>0); peso opcional; añade la serie correctamente con y sin peso.
  - Implementación: `BodyweightSetForm`.
  - Hecho cuando: los tests pasan.
  - Depende de: T033

- [x] **T036 — Formulario "Añadir serie" para forma `time`**
  - Tests: requiere reps (>0) y tiempo en segundos (>0); añade la serie correctamente.
  - Implementación: `TimeSetForm`.
  - Hecho cuando: los tests pasan.
  - Depende de: T033

- [x] **T037 — Formulario "Bloque cardio" para forma `cardio`**
  - Tests: requiere duración (>0); distancia opcional; el ejercicio se guarda con `CardioData` (no con `sets`).
  - Implementación: `CardioForm`.
  - Hecho cuando: los tests pasan.
  - Depende de: T033

- [x] **T038 — Listado de series numeradas dentro de un ejercicio**
  - Tests: dado un ejercicio con 3 series, se muestran "Serie 1", "Serie 2", "Serie 3" con sus datos.
  - Implementación: componente `ExerciseSetsList`.
  - Hecho cuando: el test pasa.
  - Depende de: T034 (o T035/T036/T037 — cualquiera primero satisface el ejercicio mínimo)

- [x] **T039 — Persistir la sesión al pulsar "Guardar"**
  - Tests: al guardar con ejercicios y series añadidos, `repo.save` recibe el objeto completo y navega al feed; el feed posterior lo lista.
  - Implementación: conectar submit con repo.
  - Hecho cuando: el test pasa.
  - Depende de: T031, T038

- [x] **T040 — Validación numérica con teclado móvil**
  - Tests: los inputs de reps/peso/tiempo/duración tienen `inputmode="decimal"` o `numeric` según corresponda; no se aceptan valores negativos.
  - Implementación: ajustar atributos y validación.
  - Hecho cuando: el test pasa.
  - Depende de: T034, T035, T036, T037

---

## Hito 6 — Detalle, editar y eliminar

Objetivo: revisar y modificar entrenamientos existentes.

- [x] **T041 — Pantalla de detalle muestra una sesión**
  - Tests: navegar a `/session/:id` carga la sesión del repo y muestra fecha+hora + lista de ejercicios con sus series/bloques.
  - Implementación: `src/features/session-detail/SessionDetail.tsx`.
  - Hecho cuando: el test pasa.
  - Depende de: T014, T038

- [x] **T042 — Editar fecha+hora de la sesión**
  - Tests: cambiar el datetime y guardar llama a `repo.update`; el feed refleja el nuevo orden.
  - Implementación: control editable + handler.
  - Hecho cuando: el test pasa.
  - Depende de: T041, T016

- [x] **T043 — Editar una serie existente**
  - Tests: tap en una serie abre formulario con valores actuales; al confirmar, `repo.update` se llama con la serie modificada.
  - Implementación: reutilizar formularios del Hito 5 en modo edición.
  - Hecho cuando: el test pasa.
  - Depende de: T041

- [x] **T044 — Eliminar una serie con confirmación**
  - Tests: pulsar eliminar abre un diálogo; confirmar elimina la serie del ejercicio y persiste; cancelar no cambia nada.
  - Implementación: componente de confirmación reutilizable.
  - Hecho cuando: el test pasa.
  - Depende de: T043

- [x] **T045 — Eliminar un ejercicio con confirmación**
  - Tests: igual que T044 pero a nivel ejercicio; si el ejercicio era el único, la sesión queda con `exercises: []`.
  - Implementación: extender la lógica de eliminación.
  - Hecho cuando: el test pasa.
  - Depende de: T044

- [x] **T046 — Eliminar la sesión completa**
  - Tests: confirmar borra la sesión vía `repo.delete` y navega al feed; el feed ya no la lista.
  - Implementación: acción "Eliminar entrenamiento" en el detalle.
  - Hecho cuando: el test pasa.
  - Depende de: T041, T017

- [x] **T047 — El feed se actualiza tras editar/eliminar**
  - Tests: tras una mutación, al volver al feed la lista refleja el estado actual (sin caches obsoletos).
  - Implementación: invalidación/reload simple.
  - Hecho cuando: el test pasa.
  - Depende de: T042, T046

---

## Hito 7 — Backup (export e import)

Objetivo: el usuario puede salvar y restaurar todos sus datos.

- [x] **T048 — Pantalla "Ajustes" accesible desde el feed**
  - Tests: navegar a `/settings` muestra una pantalla con dos botones (Exportar e Importar) y un aviso sobre persistencia local.
  - Implementación: `src/features/settings/Settings.tsx`.
  - Hecho cuando: el test pasa.
  - Depende de: T023

- [x] **T049 — Exportar JSON**
  - Tests: pulsar "Exportar" llama a `repo.exportAll` y dispara la descarga del fichero con nombre `exercise-tracker-backup-YYYYMMDD-HHmm.json`.
  - Implementación: helper para nombrar y descargar Blob.
  - Hecho cuando: el test pasa (puede mockear `URL.createObjectURL` y `a.click`).
  - Depende de: T018, T048

- [x] **T050 — Importar JSON con confirmación y reemplazo**
  - Tests:
    - Selección de un JSON válido pide confirmación; al confirmar, `repo.importAll` se llama y el feed muestra el nuevo contenido.
    - JSON inválido muestra un mensaje de error y no toca los datos actuales.
    - Cancelar la confirmación no llama a `importAll`.
  - Implementación: input file + flujo de confirmación.
  - Hecho cuando: los tests pasan.
  - Depende de: T019, T048

---

## Hito 8 — PWA final y validación en dispositivo

Objetivo: instalable y usable offline en un iPhone real.

- [x] **T051 — Service worker offline-first del app shell**
  - Tests: configuración de Workbox/`vite-plugin-pwa` declara estrategia `CacheFirst` (o equivalente) para JS/CSS/HTML; test de configuración o tras `build` verifica que el SW se genera.
  - Implementación: ajustar `vite-plugin-pwa` runtime caching.
  - Hecho cuando: el test pasa y un build sirve la app offline tras la primera carga (validación manual aceptable).
  - Depende de: T024

- [x] **T052 — Set completo de iconos para iOS y Android**
  - Tests: tras `build`, los ficheros de iconos (`apple-touch-icon-180.png`, `icon-192.png`, `icon-512.png`) existen en `dist/`.
  - Implementación: añadir assets reales y referenciarlos en el manifest.
  - Hecho cuando: el test pasa.
  - Depende de: T024

- [x] **T053 — Aviso de persistencia local en Ajustes**
  - Tests: la pantalla de Ajustes contiene un texto que advierte que los datos solo viven en este dispositivo y recomienda exportar periódicamente.
  - Implementación: copy en `Settings.tsx`.
  - Hecho cuando: el test pasa.
  - Depende de: T048

- [~] **T054 — Validación manual en dispositivos reales (iPhone, tablet, desktop)**
  - Tests: checklist manual (no automatizable):
    - **iPhone (Safari)**: instalable desde "Añadir a pantalla de inicio". Icono y splash correctos. Funciona offline tras la primera carga. Flujo completo: crear sesión, añadir ejercicios y series de las 4 formas, ver detalle, editar, eliminar, exportar, importar.
    - **Tablet (iPad u otro)**: instalable como PWA; layout responsive correcto en portrait y landscape; flujo completo funciona.
    - **Desktop (Chrome / Edge / Safari)**: instalable como PWA desde la barra de URL; contenedor centrado con `max-width` correcto; hover states visibles; navegación por teclado funcional (`:focus-visible`); flujo completo funciona en ventana redimensionada entre 320 px y >1280 px.
    - Verificar que ningún viewport produce desbordamientos horizontales ni recortes.
  - Implementación: documentar resultados en este mismo documento (o en `Verification.md`) y corregir cualquier defecto encontrado.
  - Hecho cuando: el checklist está completo en los tres formatos y los defectos críticos corregidos.
  - Depende de: T050, T051, T052, T053, T055

---

## Bitácora de completados (opcional)

Cuando una tarea se marca `[x]`, opcional añadir una línea breve aquí con fecha y commit/PR:

```
- T001 — 2026-05-25 — Vite + React 18 + TS instalado; `npm run build` verde
- T002 — 2026-05-25 — ESLint 9 flat config + Prettier 3; `lint`, `format:check` y `build` verdes; verificado que un warning hace fallar `lint` con `--max-warnings 0`
- T003 — 2026-05-25 — Vitest 2 + RTL 16 + jest-dom 6 + jsdom 25; `src/sanity.test.ts` y `src/App.test.tsx` pasan; `npm test` mapea a `vitest run`
- T004 — 2026-05-25 — `fake-indexeddb@6` enchufado vía `import 'fake-indexeddb/auto'` en `src/test/setup.ts`; `src/test/indexeddb.test.ts` confirma que `indexedDB.open` + `createObjectStore` funcionan sin navegador
- T005 — 2026-05-25 — Alias `@/` → `src/` configurado en `vite.config.ts` (con `fileURLToPath`) y en `tsconfig.app.json` (`paths`); `src/test/alias.test.ts` verifica que `import App from '@/App'` resuelve
- T006 — 2026-05-25 — `vite-plugin-pwa@0.21` enchufado; manifest extraído a `src/pwa/manifest.config.ts` (testeable) y verificado con 3 tests; `public/pwa-icon.svg` como placeholder; `dist/manifest.webmanifest` se genera correctamente; `dist/sw.js` también
- T007 — 2026-05-25 — `src/domain/types.ts` con `ExerciseShape`, `ExerciseType`, `StrengthSet`/`BodyweightSet`/`TimeSet` (+ `ExerciseSet` union), `CardioData`, ejercicios variantes (union discriminada por `shape`: `StrengthExercise`/`BodyweightExercise`/`TimeExercise`/`CardioExercise`), `Session`. 8 tests en `types.test.ts` verifican coherencia y narrowing
- T008 — 2026-05-25 — `src/domain/catalog.ts` con `EXERCISE_CATALOG` de 24 tipos (15 strength + 6 bodyweight + 1 time + 2 cardio) en 8 categorías; 13 tests verifican conteos, IDs únicos, shapes válidos y casos específicos (Plancha, Caminar, Correr). Requirements.md §5 reconciliado: Plancha bajo Autocarga con shape `time`
- T009 — 2026-05-25 — `getExerciseTypeById(id)` añadido a `catalog.ts`; 5 tests cubren: id existente, una muestra por cada shape, id inexistente, cadena vacía, case-sensitivity
- T010 — 2026-05-25 — `getCatalogGroupedByCategory()` añadido a `catalog.ts`; devuelve `Map<string, ExerciseType[]>` con orden por primera aparición; 6 tests cubren: 8 claves, suma 24, coherencia categoría, orden de claves, estabilidad entre llamadas y conteo por categoría (3/3/1/5/2/1/7/2)
- T011 — 2026-05-25 — `newSession({ now })` en `src/domain/factories.ts`; usa `crypto.randomUUID()` para el id y `now.toISOString()` para los timestamps; 5 tests cubren UUID v4 válido, igualdad de timestamps, exercises vacío e ids únicos entre llamadas
- T012 — 2026-05-25 — `newExercise(typeId, order, cardio?)` (polimórfico por shape, valida catálogo y exige cardio para shape `cardio`), `newSetForShape(...)` con overloads por shape (strength/bodyweight/time con sus reglas de validación), `newCardioBlock({ durationMinutes, distanceKm? })`. 24 tests nuevos cubren caminos felices, opcionales y validaciones de cota
- T013 — 2026-05-26 — `idb@8` añadido como dependencia; `src/data/sessionRepository.ts` con `openDB({ name? })` (nombre inyectable para tests aislados) que crea el object store `sessions` con `keyPath: "id"` e índice por `startedAt`; 2 tests en `sessionRepository.test.ts` verifican store, keyPath e índice
- T014 — 2026-05-26 — `openDB` ahora devuelve `IDBPDatabase<SessionsSchema>` tipado (sin cast); añadidos `SessionRepository` (interface) y `createSessionRepository(db)` factory con `save(session)` (upsert vía `db.put`) y `getById(id)` (devuelve `Session | undefined`); 2 tests nuevos cubren round-trip con deep equality sobre fixture con ejercicios strength + cardio anidados, y el caso de id inexistente
- T015 — 2026-05-26 — `SessionRepository.list()` añadido; lee el object store por el índice `startedAt` con cursor en dirección `'prev'` (más reciente primero); 2 tests cubren el caso vacío y el caso con 3 sesiones insertadas fuera de orden cronológico
- T016 — 2026-05-26 — `SessionRepository.update(session, now)` añadido; sobreescribe siempre `updatedAt` con `now.toISOString()` y persiste el resto del agregado tal cual (createdAt y startedAt quedan a discreción del caller); 2 tests cubren el flujo normal (load → mutar exercises → update) y un caso defensivo de `updatedAt` manipulado por el caller que el repo debe ignorar
- T017 — 2026-05-26 — `SessionRepository.delete(id)` añadido vía `db.delete('sessions', id)`; 3 tests cubren: borrado simple (`getById` posterior `undefined`), borrado con varias sesiones en BD (`list` no la incluye, conserva el resto en orden), y borrado de un id inexistente (no lanza, deja el resto intacto)
- T018 — 2026-05-26 — `SessionRepository.exportAll(now)` añadido; devuelve `ExportPayload { version: 1, exportedAt: now.toISOString(), sessions }` reutilizando `list()` (orden descendente). Constante `EXPORT_VERSION = 1` e interfaz `ExportPayload` exportadas para reutilización en T019; 2 tests cubren BD vacía y BD con 3 sesiones
- T019 — 2026-05-26 — `SessionRepository.importAll(payload)` añadido con validación defensiva (`payload: unknown`); reemplaza el contenido en una transacción `readwrite` única (clear + put en bucle dentro del mismo `tx`). Errores tipados exportados: `InvalidImportPayloadError` (payload no objeto / sin "sessions") y `UnsupportedImportVersionError` (con la versión recibida en una prop pública). 4 tests cubren reemplazo, version desconocida, sessions ausente y payloads no-objeto (null, string)
- T020 — 2026-05-26 — `IndexedDBUnavailableError` exportada; `openDB()` chequea `typeof globalThis.indexedDB === 'undefined'` antes de invocar a `idb` y lanza el error tipado. Test con `vi.stubGlobal('indexedDB', undefined)` + `vi.unstubAllGlobals()` en afterEach. Hito 2 (repositorio IndexedDB) completo
- T021 — 2026-05-26 — `src/styles/main.css` con reset (`box-sizing: border-box` global), fuente system (`-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui`) y `.app-shell` mobile-first (width 100%, padding 16px, sin min-width ni max-width). `App.tsx` importa el CSS y usa la clase `app-shell` en `<main>`. Tests por inspección del CSS source (`fs.readFileSync` + regex) + assert de `<main>` por role. Auto-cleanup de RTL añadido a `src/test/setup.ts` (`afterEach(cleanup)`) — necesario porque la config no tiene `vitest.globals: true`
- T055 — 2026-05-26 — Media queries `@media (min-width: 640px)` (max-width 600px + margin-inline auto + padding-inline 24px) y `@media (min-width: 1024px)` (padding-inline 32px + tipografía 17px). `:focus-visible` con outline accent. `@media (hover: hover) and (pointer: fine)` para hover solo en dispositivos con puntero fino. 4 tests nuevos por inspección de CSS source verifican breakpoints, focus-visible y la guarda hover. Manifest `orientation: 'any'` ya cubierto por T006/T024
- T022 — 2026-05-26 — Custom properties de tema en `:root` (`--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-accent`) con paleta clara; bloque `@media (prefers-color-scheme: dark)` redefine las mismas variables con la paleta oscura. `body` usa `background: var(--color-bg)` y `color: var(--color-text)`. 4 tests verifican: existencia de variables, override en dark media query, valores distintos en `--color-bg` claro vs oscuro, y uso de variables en body
- T023 — 2026-05-26 — `react-router-dom@7.15.1` instalado; rutas declaradas en `App.tsx` con `<Routes>` para `/` → `Feed`, `/new` → `NewSession`, `/session/:id` → `SessionDetail`, `/settings` → `Settings`. Cuatro placeholders en `src/features/{feed,session-new,session-detail,settings}/` con `data-testid` distintivos. `main.tsx` envuelve en `BrowserRouter`; tests usan `MemoryRouter initialEntries` para cada ruta. `SessionDetail` muestra el `id` usando `useParams`
- T024 — 2026-05-26 — Manifest "definitivo": `theme_color` movido a `#111111` (accent oscuro), iconos con `src` dedicado por tamaño (`/apple-touch-icon.svg` 180, `/icon-192.svg` 192, `/icon-512.svg` 512) y purpose explícito; añadida variante `purpose: 'maskable'` 512 para Android adaptive. Tres SVG dedicados creados en `public/`. `index.html` enriquecido con `<link rel="apple-touch-icon">`, `<meta name="theme-color">` y meta tags `apple-mobile-web-app-*`. `src/vite-env.d.ts` añadido para tipar imports `?raw`/CSS de Vite. Hito 3 (shell UI y tema) completo
- T025 — 2026-05-26 — Inyección de dependencias del repositorio vía React Context: `src/data/repositoryContext.ts` (constante), `src/data/RepositoryProvider.tsx` (componente), `src/data/useSessionRepository.ts` (hook). Tres archivos separados por la regla `react-refresh/only-export-components`. `Feed.tsx` ahora carga `repo.list()` en `useEffect`; muestra estado vacío con CTA "Añadir entrenamiento" enlazando a `/new`. `src/Bootstrap.tsx` extraído (bootstrap async que abre IDB y provee el repo, con loading y error states); `main.tsx` queda como entry point puro. `src/test/createMockRepo.ts` helper para tests
- T026 — 2026-05-26 — `Feed.tsx` renderiza una `<ol>` de `<li>` cuando hay sesiones, preservando el orden devuelto por `repo.list()` (cada item con `data-session-id` para verificación de orden); CTA permanece visible. 2 tests nuevos verifican el orden y la persistencia del CTA
- T027 — 2026-05-26 — `src/features/feed/groupByMonth.ts` con `groupSessionsByMonth(sessions): SessionGroup[]` puro (clave `monthKey: "YYYY-MM"`, label "Mayo 2026" capitalizado). Feed renderiza un `<section data-month-key>` con `<h3>` por grupo. 5 tests de unit del agrupador + 2 de integración en Feed verifican headers, orden de aparición y pertenencia de cada tarjeta a su mes
- T028 — 2026-05-26 — `SessionCard.tsx` muestra `<time dateTime={ISO}>` con la fecha formateada y un `<p>` con `N ejercicios` (singular `1 ejercicio` / plural `N ejercicios` / cero `0 ejercicios`). 4 tests cubren pluralización (1/4/0) y el atributo `datetime`
- T029 — 2026-05-26 — `formatSessionDate(iso)` con `Intl.DateTimeFormat('es-ES', ...)` produce el formato canónico `"Lun 25 may · 10:30"` (día capitalizado, mes minúscula, hora 24h, separador `·`). 5 tests cubren formato exacto, casing diferenciado día/mes, 24h sin AM/PM, separador, y otro día de la semana. Hito 4 (feed read path) completo
- T030 — 2026-05-26 — `src/features/session-new/NewSession.tsx` con prop `now` inyectable; usa `<input type="datetime-local">` formateado en local (`YYYY-MM-DDTHH:MM`) y mantiene `startedAt` en ISO en el estado de la sesión (creada con `newSession({ now })`). 2 tests verifican inicialización con reloj inyectado y propagación de cambios
- T031 — 2026-05-26 — Botón "Guardar sesión" en NewSession llama a `repo.save(session)` y navega a `/` con `useNavigate`. 3 tests cubren: payload (id UUID, startedAt/createdAt/updatedAt = ahora inyectado, exercises vacío), preservación del startedAt editado vs el inicial, y navegación al feed (sentinel route)
- T032 — 2026-05-26 — `ExercisePicker.tsx` renderiza las 8 categorías como `<h4>` con listas de botones por tipo (24 botones totales), usando `getCatalogGroupedByCategory()`. `onSelect(typeId)` emite al click. 3 tests cubren conteo de categorías, presencia de tipos representativos y emisión del typeId correcto
- T033 — 2026-05-26 — Botón "Añadir ejercicio" abre el picker; al seleccionar un tipo añade un ejercicio vacío al estado de la sesión (con `order` correlativo, `sets: []` o `cardio: { durationMinutes: 0 }`) y cierra el picker. `buildEmptyExercise(typeId, order)` factory inline (no usa `newExercise` para permitir cardio inicial con duración 0). 3 tests verifican strength sets vacío + order 0, order incrementa en el segundo ejercicio, y cardio shape + cardio object
- T034 — 2026-05-26 — `StrengthSetForm.tsx`: form controlado con reps + peso, ambos `> 0`. Submit emite `newSetForShape('strength', ...)` vía callback y limpia inputs. 5 tests cubren happy path, limpieza, reps vacío, peso 0/-5 rechazados, inputmode numeric/decimal
- T035 — 2026-05-26 — `BodyweightSetForm.tsx`: form controlado con reps (`> 0`) y peso opcional (vacío → omite weightKg; >= 0 si presente). 6+2 tests cubren happy path con/sin peso, reps vacío/0/negativo, peso negativo, limpieza, inputmode + min=0
- T036 — 2026-05-26 — `TimeSetForm.tsx`: form con reps + durationSeconds, ambos `> 0`. 4+2 tests cubren happy path, limpieza, validación 0/empty/negativos, inputmode numeric + min=0
- T037 — 2026-05-26 — `CardioForm.tsx`: form con duración (`> 0`) + distancia opcional (`>= 0`), prop `initial?: CardioData` para precarga. Submit emite `newCardioBlock(...)` vía callback. 5+2 tests cubren submit con/sin distancia, validación duración (0/-1/empty), distancia negativa, precarga, inputmode + min=0
- T038 — 2026-05-26 — `ExerciseSetsList.tsx` recibe un `SetBasedExercise` y renderiza una `<ol>` con "Serie N" + datos (strength: `reps · kg`; bodyweight: `reps` ± `kg`; time: `reps · s`). 5 tests cubren numeración, datos por shape, peso opcional en bodyweight y caso vacío
- T039 — 2026-05-26 — `ExerciseItem` interno: orquesta por shape la unión `ExerciseSetsList` + form correspondiente (strength/bodyweight/time) o `CardioForm` (cardio). NewSession mantiene `handleExerciseChange` que reemplaza el ejercicio por id en el estado. 2 tests end-to-end cubren guardado con sets strength múltiples y guardado con bloque cardio
- T040 — 2026-05-26 — Validación numérica consolidada en los 4 forms: `inputMode="numeric"` (reps/seconds/duración), `inputMode="decimal"` (peso/distancia), `min="0"` en todos, y `parseValid` rechaza negativos. Tests específicos T040 añadidos a cada form file. Hito 5 (crear sesión con ejercicios y series) completo
- T041 — 2026-05-26 — `SessionDetail.tsx` con `useParams` + `repo.getById(id)`, estados loading/found/not-found. Muestra `<time dateTime>` con fecha formateada, ejercicios (reutilizando `ExerciseSetsList` para sets y un `CardioBlockSummary` para cardio). 5 tests + App.test.tsx ajustado a aserción async
- T042 — 2026-05-26 — `<input type="datetime-local">` editable en SessionDetail; on change → `persist()` (setSession local + `repo.update(session, new Date())`) inmediato. Test confirma payload con nuevo startedAt y `now` `Date`
- T043 — 2026-05-26 — Forms `StrengthSetForm`, `BodyweightSetForm`, `TimeSetForm` extendidos con `initial?` (precarga) y `onCancel?` (renderiza botón Cancelar). En modo edición, el botón submit dice "Guardar" y preservan `initial.id`. `EditableSet` interno en SessionDetail toggle entre vista (Editar/Eliminar) y form. 3 tests: precarga, guardado preservando id (otros sets intactos), cancelar cierra sin actualizar
- T044 — 2026-05-26 — Botón "Eliminar serie" por fila; `window.confirm('¿Eliminar serie?')` antes de filtrar el set. 2 tests con `vi.spyOn(window, 'confirm')` cubren confirm/cancel
- T045 — 2026-05-26 — Botón "Eliminar ejercicio" por exercise; `window.confirm('¿Eliminar ejercicio?')` antes de filtrar; sesión puede quedar con `exercises: []`. 2 tests cubren confirm/cancel
- T046 — 2026-05-26 — Botón "Eliminar entrenamiento" al pie de la pantalla; `window.confirm` con mensaje destacando irreversibilidad → `repo.delete(id)` + `navigate('/')`. 2 tests cubren confirm/cancel
- T047 — 2026-05-26 — Feed cards ahora envueltas en `<Link to="/session/:id">` (T6.1 spec). Test directo verifica que `repo.list` se invoca en cada montaje de `<Feed />` (no caché obsoleto entre montajes). Test integrado: render `App`, navegar a detalle, eliminar entrenamiento → feed se actualiza mostrando solo la sesión restante. Hito 6 (detalle, editar, eliminar) completo
- T048 — 2026-05-26 — `Settings.tsx` con `<h2>Ajustes</h2>`, botón "Exportar", `<label>` "Importar" + `<input type="file" accept="application/json">` y `<p>` con aviso de persistencia local + recomendación de exportar. Feed añade `<Link to="/settings">Ajustes</Link>`. 4 tests Settings + 1 test Feed verifican controles, aviso y enlace
- T049 — 2026-05-26 — `Settings` con prop opcional `now` (default `() => new Date()`) inyectable; al pulsar "Exportar" llama a `repo.exportAll(stamp)` y dispara la descarga vía Blob + anchor: `URL.createObjectURL`, `<a download={filename}>` clic programático, `URL.revokeObjectURL`. Helper puro `buildBackupFilename(now)` extraído a archivo separado (regla react-refresh) genera `exercise-tracker-backup-YYYYMMDD-HHmm.json`. 3 tests cubren llamada a exportAll, nombre exacto del fichero + Blob, y liberación del object URL
- T050 — 2026-05-26 — `<input type="file">` con `onChange` cableado: lee el fichero con `FileReader.readAsText` (más compatible con jsdom que `Blob.text()`), parsea con `JSON.parse` (catch → muestra `<p role="alert">` con error), pide `window.confirm` con mensaje irreversible y, si confirma, invoca `repo.importAll(payload)` y `navigate('/')`. Errores de `importAll` (versión no soportada, payload inválido) se capturan y muestran como alert. 4 tests cubren: confirm + import + navegación, cancel sin importar, JSON malformado → alert, version desconocida → alert. Tests usan `File` constructor + `fireEvent.change`; aserciones con `waitFor` para evitar flakes
- T051 — 2026-05-26 — `src/pwa/pwa.config.ts` con `pwaOptions: Partial<VitePWAOptions>`; añadido a `tsconfig.node.json` `include`. `vite.config.ts` simplificado a `VitePWA(pwaOptions)`. Workbox: `cleanupOutdatedCaches`, `globPatterns` con js/css/html/svg/png/etc., `navigateFallback: 'index.html'` (SPA offline-first) y 3 reglas `runtimeCaching` con handler `CacheFirst` (app-shell, images, fonts) con expiración por cache. Build verifica `dist/sw.js` y `dist/workbox-*.js`. 6 tests cubren el shape del config
- T052 — 2026-05-26 — `tools/generate-icons.mjs` (script Node puro: CRC-32 + zlib, sin sharp/canvas) emite `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png` con fondo `#0a0a0a`, "ET" en `#fafafa` y esquinas redondeadas (radio 18%). Manifest actualizado para apuntar a `.png` con `type: 'image/png'`; `<link rel="apple-touch-icon">` también a `.png`. SVGs antiguos eliminados de `public/`. 3 tests cubren: existencia de los 3 PNG en `public/`, tipo image/png en el manifest, sources esperados
- T053 — 2026-05-26 — Aviso de persistencia local ya estaba en Settings desde T048 ("Tus entrenamientos se guardan solo en este dispositivo. Exporta una copia periódicamente…"). Añadido test explícito T053 que verifica la mención a "periódicamente"
- T054 — 2026-05-26 — `Verification.md` creado con el checklist estructurado (iPhone Safari, iPad/Android, Desktop Chrome/Edge/Safari) y las instrucciones para servir la versión de producción vía `npm run build && npm run preview --host`. La validación física queda pendiente del usuario; T054 permanece `[~]` hasta que se complete el checklist en dispositivos reales
```

Esto es solo informativo; la fuente de verdad del estado es el checkbox en cada tarea.
