---
id: F4-T007
status: done
title: Settings - importar datos de Salud
sub-phase: C-integration
depends-on: [F4-T002, F4-T003]
---

## Goal

Añadir en Ajustes una acción **"Importar datos de Salud"** que lee el fichero JSON del Atajo, lo
parsea y hace **upsert por día** en el repositorio, con feedback y manejo de errores.

## Context

Editar `src/features/settings/Settings.tsx`. Reutiliza el patrón del import de backup existente
(label `.btn .btn-secondary` con `<input type="file">` oculto, lectura con `FileReader`).

Flujo:
1. Selector de fichero (`accept="application/json"`).
2. Leer texto → `JSON.parse` (error tipado si no es JSON válido).
3. `parseHealthImport(payload)` (F4-T003).
4. `repo.upsertHealthDays(days)` (F4-T002). **No** borra Salud previa (es fusión por día).
5. Feedback de éxito (p. ej. "Importados N días de actividad") y de error con `.alert-error`.

Notas:
- A diferencia del import de backup (que **reemplaza**), este **fusiona**; no requiere confirmación
  destructiva, pero sí mostrar cuántos días se importaron.
- Colocar la acción en su propia sección de Ajustes ("Datos de Salud"), junto al bloque de backup.

## Tests (write first — RED)

Ampliar `src/features/settings/Settings.test.tsx` (mock repo con `upsertHealthDays`).

```
it('imports a valid health JSON and calls upsertHealthDays with the parsed days')
it('shows a success message with the number of imported days')
it('shows an alert-error when the file is not valid JSON')
it('shows an alert-error when the health payload is invalid')
```

## Implementation

1. Añadir el control y el handler de import de Salud en `Settings.tsx`.
2. Mensajes de éxito/error reutilizando estilos existentes.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada. Sub-fase C completa; puntero a F4-T008.
