---
id: F4-T003
status: done
title: Health import parser (JSON)
sub-phase: B-import-metrics
depends-on: [F4-T001]
---

## Goal

Parsear y validar el fichero JSON que produce el Atajo de Apple, devolviendo `HealthDay[]` listos
para hacer upsert. Función pura.

## Context

Crear `src/domain/health/parseHealthImport.ts`. Usa `normalizeHealthDay` (F4-T001).

Formato esperado:
```json
{ "version": 1, "days": [ { "date": "YYYY-MM-DD", "steps": 8423, "distanceKm": 6.21 } ] }
```

```ts
export const HEALTH_IMPORT_VERSION = 1;

export class InvalidHealthImportError extends Error {}            // estructura inválida
export class UnsupportedHealthImportVersionError extends Error {} // version no soportada

export function parseHealthImport(payload: unknown): HealthDay[];
```

Reglas:
- `payload` objeto con `version === 1`; si no → `UnsupportedHealthImportVersionError`.
- `days` debe ser array; si no → `InvalidHealthImportError`.
- Cada elemento se pasa por `normalizeHealthDay`; los inválidos se **descartan** (no rompen toda la
  importación). Si tras filtrar no queda ningún día válido → `InvalidHealthImportError`.
- Si hay fechas duplicadas dentro del fichero, conservar la **última** ocurrencia (el upsert del
  repositorio también es idempotente, pero dejamos el array sin duplicados de fecha).
- Resultado ordenado por `date` ascendente.

## Tests (write first — RED)

Crear `src/domain/health/parseHealthImport.test.ts`.

```
it('parses a valid health import into HealthDay[]')
it('throws UnsupportedHealthImportVersionError on a wrong version')
it('throws InvalidHealthImportError when days is not an array')
it('drops invalid day entries but keeps the valid ones')
it('throws InvalidHealthImportError when no valid days remain')
it('dedupes by date keeping the last occurrence')
```

## Implementation

1. Implementar `parseHealthImport` y los errores tipados.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F4-T004.
