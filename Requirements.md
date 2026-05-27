# Exercise Tracker — Requirements (Fase 1)

Documento de requisitos para la fase 1 de **Exercise Tracker**. Este archivo es la fuente de verdad para que cualquier modelo o desarrollador pueda continuar el trabajo sin contexto previo. Las decisiones recogidas aquí son el resultado de una conversación iterativa con el usuario y deben respetarse salvo que el usuario indique lo contrario en futuras conversaciones.

---

## 1. Visión y alcance

Exercise Tracker es una aplicación web instalable como PWA en iPhone, pensada para registrar manualmente las sesiones de entrenamiento del usuario (gimnasio, autocarga y cardio) y poder consultarlas en una lista ordenada cronológicamente.

El foco principal es móvil (iPhone), pero la aplicación debe ser **plenamente usable también en tablet y desktop** a través del navegador (Safari, Chrome, Edge, Firefox). El diseño es **mobile first** y la layout escala hacia arriba mediante diseño responsive (ver §7).

La fase 1 cubre exclusivamente:

- Listar entrenamientos en un feed ordenado por fecha descendente (más recientes arriba).
- Crear, ver detalle, editar y eliminar sesiones de entrenamiento.
- Modelar dentro de cada sesión los ejercicios realizados con sus series.
- Backup local mediante export e import en JSON.
- Diseño visual minimalista, modo claro/oscuro automático, en español.

Quedan explícitamente fuera de fase 1 (ver §11).

---

## 2. Restricciones técnicas (innegociables)

- **PWA pura**: instalable desde Safari mediante "Añadir a pantalla de inicio". Manifest, service worker e iconos. Sin distribución por App Store ni wrapper nativo.
- **Sin backend**: cero infraestructura de servidor. La app debe funcionar 100% offline tras la primera carga.
- **Persistencia local en IndexedDB**: todos los datos viven en el navegador del dispositivo. No hay sincronización entre dispositivos.
- **Sin cuentas de usuario**: dispositivo único, usuario único, sin autenticación.
- **TDD obligatorio**: ver §10. Todo código de producción debe estar precedido por un test que falle. Innegociable.

---

## 3. Stack tecnológico

- **Framework**: React 18+ con TypeScript.
- **Bundler / dev server**: Vite.
- **PWA**: `vite-plugin-pwa` (Workbox por debajo) para manifest y service worker.
- **Persistencia**: IndexedDB. Se recomienda usar `idb` (wrapper ligero con Promises) para evitar la API nativa verbosa.
- **Estilos**: CSS modules o Tailwind CSS. Decisión del implementador siempre que respete la estética definida en §7.
- **Testing**: ver §10.
- **Linter/formatter**: ESLint + Prettier con configuración estándar para React + TS.

No se requiere router complejo en fase 1; basta con un cambio de vistas básico (lista, detalle de sesión, formulario, ajustes/backup). Se acepta React Router si simplifica el código.

---

## 4. Modelo de datos

### 4.1 Entidades

```
Session (sesión de entrenamiento)
├── id: string (UUID)
├── startedAt: string (ISO 8601, fecha + hora)
├── createdAt: string (ISO 8601)
├── updatedAt: string (ISO 8601)
└── exercises: Exercise[]

Exercise (ejercicio dentro de una sesión)
├── id: string (UUID)
├── typeId: string (referencia al catálogo, §5)
├── order: number (posición dentro de la sesión)
└── sets: Set[]  // o cardio: CardioData (según la "forma" del tipo, §4.2)

Set (serie) — su estructura depende de la forma del ejercicio:
- forma "strength":      { id, reps: number, weightKg: number }
- forma "bodyweight":    { id, reps: number, weightKg?: number }    // peso opcional
- forma "time":          { id, reps: number, durationSeconds: number }

CardioData — para ejercicios cardio (sin concepto de series):
- { durationMinutes: number, distanceKm?: number }                  // distancia opcional
```

### 4.2 "Formas" de ejercicio

Cada tipo del catálogo (§5) tiene una **forma** que determina qué campos se piden al registrar el ejercicio:

| Forma         | Campos por serie / bloque             | Tipos del catálogo                                                  |
|---------------|---------------------------------------|---------------------------------------------------------------------|
| `strength`    | reps + peso (kg, requerido)           | Las 15 máquinas/pesas                                              |
| `bodyweight`  | reps + peso (kg, opcional)            | Flexiones, Sentadillas sin peso, Abdominales, Dominadas, Fondos, Zancadas |
| `time`        | reps + tiempo (segundos)              | Plancha                                                             |
| `cardio`      | duración (min) + distancia (km, opc.) | Caminar, Correr                                                     |

Notas:
- Un ejercicio puede aparecer **varias veces dentro de una misma sesión** (ej. dos bloques de Correr separados por pesas).
- Para `cardio` no hay concepto de series: es un único bloque por instancia del ejercicio. Si el usuario quiere varios bloques, añade el ejercicio repetido.
- Para `time` (Plancha) cada serie tiene **reps + tiempo en segundos**. Ejemplo: 3 series, cada una con 2 reps de 30s.

### 4.3 Esquema IndexedDB

Una base de datos con dos object stores:

- `sessions`: clave primaria `id`. Índice por `startedAt` (descendente para el feed).
- `meta` (opcional): para versionado de schema y migraciones futuras.

Los `Exercise` y `Set` se almacenan **embebidos** dentro del documento `Session` (no en stores separados). Esto simplifica la lectura del feed y el detalle, y es coherente con el ciclo de vida (siempre se editan juntos).

### 4.4 Identificadores y unicidad

Los IDs son UUID v4 generados en cliente (`crypto.randomUUID()`).

### 4.5 Fechas

- `startedAt` se almacena en ISO 8601 con zona horaria local del dispositivo.
- Al crear una sesión, por defecto se rellena con la fecha y hora actuales, **editable** (el usuario puede registrar entrenamientos pasados o ajustar la hora).
- El feed ordena por `startedAt` descendente. Dos sesiones el mismo día se ordenan por hora.

---

## 5. Catálogo de tipos de ejercicio

24 tipos, agrupados por categoría. La UI debe mostrar las categorías como agrupaciones visuales al elegir el tipo de un ejercicio.

### Pecho (`strength`)
1. Press banca (barra)
2. Press pecho máquina
3. Aperturas / Pec deck

### Espalda (`strength`)
4. Jalón al pecho (polea alta)
5. Remo sentado en máquina
6. Pull-over / Remo con barra T

### Hombros (`strength`)
7. Press militar / Press hombros máquina

### Piernas (`strength`)
8. Prensa de piernas
9. Extensiones de cuádriceps
10. Curl femoral
11. Sentadilla en multipower (Smith) o Hack
12. Elevación de gemelos

### Brazos (`strength`)
13. Curl de bíceps (polea o mancuerna)
14. Extensión de tríceps (polea o press francés)

### Core (`strength`)
15. Máquina de abdominales

### Autocarga (`bodyweight` por defecto; Plancha es `time`)
16. Flexiones (`bodyweight`)
17. Sentadillas sin peso (`bodyweight`)
18. Abdominales / crunches (`bodyweight`)
19. Dominadas (`bodyweight`)
20. Fondos en paralelas (`bodyweight`)
21. Zancadas (`bodyweight`)
22. Plancha (`time`) — única excepción de shape dentro de esta categoría: se mide por reps × segundos.

### Cardio (`cardio` — duración + distancia opcional)
23. Caminar
24. Correr

El catálogo se modela como una **constante en código** (no editable por el usuario en fase 1). Estructura sugerida:

```ts
type ExerciseShape = 'strength' | 'bodyweight' | 'time' | 'cardio';

interface ExerciseType {
  id: string;             // ej. "press-banca"
  name: string;           // ej. "Press banca (barra)"
  category: string;       // ej. "Pecho"
  shape: ExerciseShape;
}
```

---

## 6. Funcionalidades (fase 1)

### 6.1 Feed de entrenamientos (pantalla principal)

- Lista de sesiones ordenadas por `startedAt` descendente.
- **Agrupada por mes** con encabezados separadores (ej. "Mayo 2026").
- Cada tarjeta muestra:
  - Fecha + hora (formato amigable: "Lun 25 May · 10:30").
  - Número de ejercicios de la sesión (ej. "4 ejercicios").
- Tap en una tarjeta abre el detalle de la sesión.
- Estado vacío: mensaje breve + CTA primario "Añadir entrenamiento".
- Botón flotante o en barra para "Añadir entrenamiento".

### 6.2 Crear sesión

Flujo:
1. Usuario pulsa "Añadir entrenamiento".
2. Se crea una sesión en memoria con `startedAt = ahora` (editable).
3. La pantalla de sesión muestra fecha/hora (editable) y una lista vacía de ejercicios con CTA "Añadir ejercicio".
4. "Añadir ejercicio" abre selector con el catálogo agrupado por categoría.
5. Al elegir un tipo, se añade el ejercicio a la sesión y se entra en su detalle para añadir series/bloque según su forma.
6. Para `strength` / `bodyweight` / `time`: botón "Añadir serie" que pide los campos correspondientes; las series se listan numeradas en orden de creación.
7. Para `cardio`: un único bloque con duración + distancia opcional.
8. El usuario puede volver al detalle de sesión y añadir más ejercicios.
9. Botón "Guardar sesión" persiste en IndexedDB. La sesión también puede guardarse implícitamente al salir de la pantalla; decisión del implementador siempre que no se pierdan datos.

### 6.3 Ver detalle de sesión

- Cabecera con fecha + hora editables.
- Lista de ejercicios en el orden registrado.
- Por cada ejercicio: nombre, categoría y listado de series/bloque con sus datos.
- Acciones: añadir ejercicio, editar ejercicio, eliminar ejercicio, eliminar sesión.

### 6.4 Editar

- Editar `startedAt`: picker de fecha y hora.
- Editar series: tap en una serie permite modificar reps/peso/tiempo.
- Reordenar ejercicios dentro de una sesión: **fuera de fase 1** salvo que sea trivial.
- Eliminar una serie, un ejercicio o una sesión completa: confirmación previa.

### 6.5 Backup local

Pantalla de ajustes accesible desde el feed con dos acciones:

- **Exportar**: descarga un fichero `exercise-tracker-backup-YYYYMMDD-HHmm.json` con todas las sesiones.
- **Importar**: selector de fichero JSON. Estrategia de import: **reemplaza** los datos actuales tras confirmación explícita. (Una estrategia de merge se considera fuera de fase 1 por complejidad.)

Formato del JSON exportado:

```json
{
  "version": 1,
  "exportedAt": "2026-05-25T10:30:00.000+02:00",
  "sessions": [ /* array de Session tal cual están en IndexedDB */ ]
}
```

El campo `version` permite manejar migraciones futuras de schema.

---

## 7. Diseño visual y UX

### 7.1 Estilo

- **Inspiración**: minimalista monocromo, estilo Linear / Things.
- Paleta: blanco/negro base, un único color de acento (a definir por el implementador con criterio; sugerido: gris muy oscuro o un acento azul/verde discreto). Sin gradientes vistosos ni decoración innecesaria.
- Tipografía: SF Pro de iOS (system font) para integrarse visualmente con el dispositivo. Fallback: system-ui, -apple-system, sans-serif.
- Tarjetas con bordes redondeados (~12–16px), sombras muy sutiles o ausentes.
- Espaciado generoso, jerarquía clara, sin saturar la pantalla.

### 7.2 Modo claro / oscuro

- **Automático según el sistema iOS** (`prefers-color-scheme`). Sin selector manual.
- Ambas paletas deben definirse y probarse.

### 7.3 Idioma y unidades

- **Idioma**: español (sin i18n en fase 1).
- **Unidades**: métricas (kg, km, minutos, segundos).
- **Fechas**: formato español (ej. "Lun 25 may · 10:30").

### 7.4 UX clave

- **Mobile first**: el diseño parte del viewport iPhone (referencia 375×667 px) y se construye desde ahí. Toda decisión visual se prueba primero en móvil.
- **Responsive en tablet y desktop**: la app debe ser plenamente usable en tablet (~768 px+) y desktop (~1024 px+) sin perder calidad de UX.
  - En viewports anchos, el contenido principal (feed, formularios, detalle) se centra en un contenedor con `max-width` ~560–640 px y padding generoso a los lados. Es una app de uso personal y single-column; no se introducen layouts multi-columna en fase 1.
  - Estados `:hover` definidos para elementos interactivos (botones, tarjetas) en dispositivos con puntero fino.
  - Foco visible (`:focus-visible`) en navegación por teclado.
  - Soporte de orientación tanto portrait como landscape; el contenido no debe quedar cortado ni desbordado en ninguna.
- Áreas táctiles cómodas (mínimo ~44pt para botones, recomendaciones HIG de Apple) — válido en todos los breakpoints.
- Inputs numéricos para reps/peso/tiempo con teclado numérico (`inputmode="decimal"` o `numeric`).
- Confirmaciones antes de acciones destructivas (eliminar serie, ejercicio, sesión, import que reemplaza).
- Feedback visual inmediato al guardar.

### 7.5 Breakpoints sugeridos

Recomendación, no obligación; el implementador puede ajustar con criterio siempre que se cumpla §7.4:

- `≥ 640 px` (tablet pequeña / móvil landscape): empieza a aplicar el contenedor centrado y padding lateral mayor.
- `≥ 1024 px` (desktop): contenedor centrado al `max-width` definitivo, tipografía base ligeramente mayor, hover states activos.

---

## 8. PWA

### 8.1 Manifest

- `name`: "Exercise Tracker"
- `short_name`: "Exercise Tracker"
- `description`: breve, en español.
- `start_url`: "/"
- `display`: "standalone"
- `theme_color` y `background_color`: coherentes con la paleta clara (iOS muestra splash en modo claro por defecto en la mayoría de casos).
- `icons`: set completo para iOS (180×180 apple-touch-icon como mínimo, más set Android 192/512).
- `orientation`: `"any"` — la app debe funcionar en portrait y landscape, en móvil, tablet y desktop. No bloquear la orientación.

### 8.2 Service worker

- Estrategia **offline-first** para el shell de la app (HTML, JS, CSS, fuentes).
- IndexedDB no necesita pasar por el service worker; ya es persistente.
- Sin push notifications, sin background sync en fase 1.

### 8.3 Instalación como PWA

- **iPhone (foco principal)**: documentar en README los pasos: abrir en Safari → Compartir → Añadir a pantalla de inicio. Verificar que el icono se muestra correctamente y que el splash screen es razonable.
- **Tablet (iPad / Android)**: misma instalación que iPhone vía navegador del sistema.
- **Desktop (Chrome / Edge / Safari macOS)**: el navegador ofrece "Instalar" desde la barra de direcciones cuando el manifest es válido. La app debe abrirse en su propia ventana en modo `standalone` y ser totalmente funcional ahí.

El comportamiento en todos los formatos debe ser equivalente; la única diferencia esperada es el tamaño del viewport y los inputs (toque vs. ratón/teclado).

---

## 9. Persistencia y resiliencia

- Toda la lógica de IndexedDB debe estar encapsulada en una capa repositorio (`SessionRepository`) con interfaz clara, mockeable en tests.
- Manejo de errores: si IndexedDB falla (modo privado u otras circunstancias), mostrar un mensaje claro al usuario en lugar de fallar silenciosamente.
- Aviso al usuario: en algún punto visible (probablemente la pantalla de ajustes), informar que los datos se guardan solo en este dispositivo y recomendar hacer export periódicamente.

---

## 10. Metodología de desarrollo: TDD (innegociable)

Todo desarrollo se realiza con **Test-Driven Development**:

1. Escribir un test que describa el comportamiento esperado.
2. Verificar que el test falla (red).
3. Escribir el código mínimo para que pase (green).
4. Refactorizar si es necesario manteniendo los tests en verde.

**No se escribe código de producción sin un test previo que falle.**

### 10.1 Stack de testing recomendado

- **Test runner**: Vitest (integración natural con Vite, API tipo Jest).
- **Component testing**: React Testing Library + jsdom.
- **IndexedDB en tests**: `fake-indexeddb` para correr el repositorio en Node sin navegador.
- **E2E (opcional pero recomendado)**: Playwright para validar flujos completos en un navegador real.

### 10.2 Cobertura por capa

- **Dominio**: cálculos puros (formateo de fechas, validaciones, helpers de modelo). Tests unitarios.
- **Repositorio (IndexedDB)**: tests contra `fake-indexeddb` cubriendo CRUD, export, import.
- **Componentes**: tests con React Testing Library para formularios, estados vacíos, interacciones.
- **Flujos E2E**: al menos los caminos críticos: crear sesión con varios ejercicios y series, editar serie, eliminar sesión, exportar e importar.

### 10.3 Convenciones

- **Descripciones de tests en inglés (obligatorio)**: los strings de `describe(...)` y `it(...)` se escriben siempre en inglés, en estilo "X does Y" / "throws when Z". El código de la aplicación y de los datos sigue siendo en español (UI, copy, errores tipados de dominio), pero la suite de tests es íntegramente en inglés para facilitar el grep, la lectura de outputs y la colaboración con futuras herramientas.
- Tests colocados junto al código (`Component.tsx` + `Component.test.tsx`) o en `__tests__/` adyacente.
- CI local (script `npm test`) que corra todos los tests; idealmente bloquear commits si fallan (hook opcional en fase 1).

---

## 11. Fuera del alcance de la fase 1

Lo siguiente queda explícitamente **fuera** y se decidirá en fases posteriores:

- Integración con Apple Salud (HealthKit). Se valoró importación manual de XML, Apple Shortcut a URL, o wrapper nativo. **Decisión: posponer a fase 2.**
- Sincronización entre dispositivos o backup en la nube.
- Cuentas de usuario / autenticación.
- Estadísticas, gráficos de progreso, métricas avanzadas (volumen, PRs, calendario de hábito).
- Edición del catálogo de ejercicios por parte del usuario.
- Plantillas / rutinas predefinidas.
- Reordenar ejercicios dentro de una sesión.
- Cronómetro / timer en vivo para series y descansos.
- Notas por ejercicio o por sesión.
- Multi-idioma (i18n).
- Soporte de unidades imperiales.
- Push notifications, recordatorios.

---

## 12. Resumen para implementador

Para empezar a construir esta fase 1:

1. Inicializar proyecto Vite + React + TS.
2. Configurar Vitest, React Testing Library, fake-indexeddb, ESLint y Prettier.
3. Configurar `vite-plugin-pwa` con el manifest descrito en §8.
4. Definir el modelo de dominio (§4) con tests.
5. Implementar `SessionRepository` sobre IndexedDB con tests contra `fake-indexeddb`.
6. Construir la UI capa por capa siguiendo TDD: feed → crear sesión → añadir ejercicios y series → detalle → editar → eliminar → backup.
7. Estilo minimalista monocromo con modo claro/oscuro automático.
8. Probar instalación como PWA en un iPhone real antes de dar por cerrada la fase.

Cualquier ambigüedad encontrada durante la implementación debe consultarse con el usuario antes de tomar la decisión por cuenta propia.
