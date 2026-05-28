# Exercise Tracker — Fase 5: Importar Salud por muestras crudas (Atajo simple)

## Qué es la Fase 5

La Fase 4 dejó la importación de Salud esperando un JSON ya **agregado por día**
(`{ version: 1, days: [{ date, steps, distanceKm }] }`). En la práctica, generar ese fichero con un
Atajo de Apple es **inviable de forma cómoda**: la acción «Buscar muestras médicas» devuelve
**muestras sueltas** (no totales), y sumar por día dentro de Atajos es muy engorroso.

La Fase 5 traslada esa complejidad a la app: el Atajo solo **vuelca las muestras crudas** (cada
registro con su fecha y valor) en un JSON simple, y **la app las agrupa por día** al importar. Así el
Atajo queda trivial de montar y el cálculo (testeado) vive en el dominio.

No cambian el modelo `HealthDay`, el repositorio (`healthDays`, upsert por día), el backup v2 ni el
panel «Actividad»: solo cambian el **parser de importación** (acepta el nuevo formato) y la
**documentación/ayuda del Atajo**.

### Decisiones de diseño

| Decisión | Elección |
|---|---|
| Formato del Atajo | **JSON v2 con muestras crudas**: `{ version: 2, samples: [{ metric, date, value }] }` |
| `metric` | `"steps"` o `"distance"` |
| `value` | pasos: conteo (entero); distancia: **kilómetros** |
| `date` | ISO local de la muestra (`YYYY-MM-DDTHH:mm:ss`) o `YYYY-MM-DD`; se agrupa por **día local** |
| Agregación | La app suma por día y metric → `HealthDay { date, steps, distanceKm }` |
| Compatibilidad | Se sigue aceptando el **v1 (días ya agregados)** de la Fase 4 |
| Sin cambios | `HealthDay`, repositorio, backup v2, panel «Actividad», acción de import en Ajustes |

---

## Formato de importación

### v2 — muestras crudas (lo que produce el Atajo nuevo)
```json
{
  "version": 2,
  "samples": [
    { "metric": "steps", "date": "2026-05-25T08:13:00", "value": 1200 },
    { "metric": "steps", "date": "2026-05-25T18:40:00", "value": 3050 },
    { "metric": "distance", "date": "2026-05-25T08:13:00", "value": 0.92 }
  ]
}
```
Agrega a → `{ date: "2026-05-25", steps: 4250, distanceKm: 0.92 }`.

### v1 — días ya agregados (sigue siendo válido)
```json
{ "version": 1, "days": [ { "date": "2026-05-25", "steps": 8423, "distanceKm": 6.21 } ] }
```

`parseHealthImport(payload)` devuelve `HealthDay[]` en ambos casos, así que la acción de importación
en Ajustes (F4-T007) y el repositorio no cambian.

---

## Estructura de tareas

```
phase-5/
├── tasks-summary.md                      ← este archivo (índice y estado)
├── A-domain/                             ← Sub-fase A: agregación y parser (dominio puro)
│   ├── F5-T001-aggregate-samples.md
│   └── F5-T002-import-parser-v2.md
└── B-docs/                              ← Sub-fase B: Atajo y documentación
    └── F5-T003-shortcut-instructions-v2.md
```

---

## Estado de las tareas

### Sub-fase A — Dominio (agregación + parser)

| ID | Título | Estado |
|---|---|---|
| F5-T001 | Aggregate raw samples to daily totals | `done` |
| F5-T002 | Import parser v2 (raw samples) + v1 compat | `done` |

### Sub-fase B — Atajo + documentación

| ID | Título | Estado |
|---|---|---|
| F5-T003 | Shortcut recipe v2 + format docs | `done` |

---

## Próxima tarea

**Fase 5 completa.** No queda trabajo pendiente.

---

## Reglas globales (aplican a todas las tareas de la Fase 5)

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

### Convenciones específicas de la Fase 5

- El dominio nuevo vive en `src/domain/health/` (sin React), testeado con Vitest.
- `parseHealthImport` debe seguir devolviendo `HealthDay[]` para no tocar la capa de Ajustes ni el
  repositorio.
- La agregación agrupa por **día local** (`getFullYear/Month/Date` sobre `new Date(date)`), suma por
  metric, redondea los pasos a entero y descarta muestras inválidas (valor no finito o negativo,
  fecha no parseable, metric desconocido).
