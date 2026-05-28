---
id: F5-T002
status: done
title: Import parser v2 (raw samples) + v1 compat
sub-phase: A-domain
depends-on: [F5-T001]
---

## Goal

Ampliar `parseHealthImport` para aceptar el **formato v2 de muestras crudas** y agregarlo a días,
manteniendo compatible el **v1 (días ya agregados)** de la Fase 4. Sigue devolviendo `HealthDay[]`
para no tocar la capa de Ajustes ni el repositorio.

## Context

Editar `src/domain/health/parseHealthImport.ts` (de F4-T003). Usa `aggregateSamplesToDays`
(F5-T001) y `normalizeHealthDay` (F4-T001).

Formato v2:
```json
{ "version": 2, "samples": [ { "metric": "steps", "date": "2026-05-25T08:13:00", "value": 1200 } ] }
```

Cambios:
- Aceptar `version` **1 o 2**; cualquier otro → `UnsupportedHealthImportVersionError`.
- **v1**: comportamiento actual (normaliza `days` → `HealthDay[]`).
- **v2**:
  - `samples` debe ser array; si no → `InvalidHealthImportError`.
  - Construir `HealthSample[]` a partir de los elementos válidos (metric `steps`/`distance`,
    `date` string, `value` numérico); la validación fina y el descarte los hace
    `aggregateSamplesToDays`.
  - `aggregateSamplesToDays(samples)` → `HealthDay[]`.
  - Si tras agregar no queda **ningún día** → `InvalidHealthImportError`.
- Devuelve `HealthDay[]` ordenado por fecha en ambos formatos.
- (Opcional) Exportar un `HEALTH_IMPORT_VERSIONS = [1, 2]` o similar para claridad.

## Tests (write first — RED)

Ampliar `src/domain/health/parseHealthImport.test.ts`.

```
it('parses a v2 raw-samples payload aggregated into daily HealthDay[]')
it('sums v2 samples of the same day across metrics')
it('still parses a v1 (daily) payload unchanged')
it('throws UnsupportedHealthImportVersionError on an unknown version (e.g. 99)')
it('throws InvalidHealthImportError when v2 samples is not an array')
it('throws InvalidHealthImportError when v2 yields no valid days')
```

## Implementation

1. Refactorizar `parseHealthImport` para ramificar por `version` (1 → days, 2 → samples+agregación).

## Done when

- [ ] Todos los tests pasan (incl. los de v1 de la Fase 4).
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada. Sub-fase A completa; puntero a F5-T003.
