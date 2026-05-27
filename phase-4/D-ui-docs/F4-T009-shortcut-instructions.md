---
id: F4-T009
status: done
title: Instrucciones del Atajo de Apple
sub-phase: D-ui-docs
depends-on: [F4-T007]
---

## Goal

Documentar, dentro de la app y en el README, cómo crear el **Atajo de Apple** que genera el fichero
JSON de Salud, para que el usuario pueda producir el import sin adivinar el formato. Última tarea de
la Fase 4.

## Context

El Atajo debe producir exactamente el formato que lee `parseHealthImport` (F4-T003):
```json
{ "version": 1, "days": [ { "date": "YYYY-MM-DD", "steps": 8423, "distanceKm": 6.21 } ] }
```

Pasos del Atajo (a documentar, redactados para el usuario en español):
1. App **Atajos** → nuevo atajo.
2. **Obtener muestras de salud** → "Pasos", agrupadas por **Día**, rango deseado (p. ej. últimos 90
   días). Repetir para **Distancia a pie y en carrera**.
3. Combinar por fecha y construir el objeto `{ version: 1, days: [...] }` (cada día con `date`,
   `steps`, `distanceKm`). Distancia en **kilómetros**.
4. **Guardar archivo** en Archivos (o "Compartir") como `salud.json`.
5. En Exercise Tracker → **Ajustes → Importar datos de Salud** y seleccionar el fichero.

Entregables:
- **README**: nueva sección "Importar datos de Salud (Atajo de Apple)" con los pasos y el formato.
- **Ayuda en la app**: en la sección "Datos de Salud" de Ajustes, un texto breve / detalle
  desplegable (`<details>`) con el formato esperado y un resumen de los pasos, más el enlace a la
  sección del README si aplica.

> Nota: si el equipo prepara un Atajo compartible (iCloud link), añadir el enlace en el README. No
> incluir enlaces inventados; dejar un placeholder si aún no existe.

## Tests (write first — RED)

Ampliar `src/features/settings/Settings.test.tsx`.

```
it('shows help describing the expected health import format')
  → texto que mencione "version" y los campos date/steps/distancia (o un <details> de ayuda)
```
(El README es documentación; no requiere test.)

## Implementation

1. Añadir la sección de ayuda en `Settings.tsx` (junto al import de Salud).
2. Añadir la sección al `README.md`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada. **Sub-fase D completa. Fase 4 completa.**
