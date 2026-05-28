---
id: F5-T003
status: done
title: Shortcut recipe v2 + format docs
sub-phase: B-docs
depends-on: [F5-T002]
---

## Goal

Actualizar la ayuda dentro de la app y el README con la **nueva receta del Atajo** (mucho más
simple: vuelca muestras crudas, sin sumar) y el **formato v2**. Última tarea de la Fase 5.

## Context

El Atajo nuevo ya no agrega por día. Receta a documentar (redactada para el usuario, en español):

1. App **Atajos** (en el iPhone) → nuevo atajo.
2. **Buscar muestras médicas** con tipo **Pasos** (sin agrupar). Repítelo en otra acción con tipo
   **Distancia a pie y en carrera** (en km).
3. Por cada lista, **Repetir con cada** muestra y añadir a un texto/variable un objeto
   `{ "metric": "steps", "date": <fecha de inicio>, "value": <valor> }` (y `"distance"` para la
   otra). **No hay que sumar nada.**
4. Envolver todo en `{ "version": 2, "samples": [ ... ] }` y **Guardar archivo** como `salud.json`.
5. En la app → **Ajustes → Importar datos de Salud** y seleccionar el fichero. La app agrupa por día.

Formato v2 (el que valida `parseHealthImport`):
```json
{ "version": 2, "samples": [ { "metric": "steps", "date": "2026-05-25T08:13:00", "value": 1200 } ] }
```
- `metric`: `"steps"` o `"distance"`. `value`: pasos (conteo) / distancia en **km**.
- `date`: fecha de la muestra (ISO local o `YYYY-MM-DD`).
- El formato **v1 (días agregados)** sigue siendo válido; documéntalo como alternativa.

Entregables:
- **Ayuda en la app**: actualizar el `<details>` de Ajustes (de F4-T009) para describir el **v2** y
  los pasos simplificados del Atajo.
- **README**: actualizar la sección "Importar datos de Salud (Atajo de Apple)" con la receta v2 y
  ambos formatos.

## Tests (write first — RED)

Actualizar el test de ayuda en `src/features/settings/Settings.test.tsx` (el de F4-T009 que
comprobaba el formato v1):

```
it('shows help describing the v2 raw-samples import format')
  → el texto de ayuda menciona "version" 2, "samples" y los metric "steps"/"distance"
```
Ajustar/eliminar la aserción antigua que esperaba `"version": 1` en la ayuda. (El README es
documentación; no requiere test.)

## Implementation

1. Actualizar el `<details>` de ayuda en `Settings.tsx` al formato v2.
2. Actualizar la sección del `README.md`.
3. Actualizar el test de ayuda.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada. **Sub-fase B completa. Fase 5 completa.**
