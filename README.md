# Exercise Tracker

PWA para registrar entrenamientos (gimnasio, autocarga y cardio) y consultar métricas, sin backend
y con persistencia local en IndexedDB. React + Vite + TypeScript. Desarrollo con TDD.

## Scripts

```
npm run dev           # servidor de desarrollo
npm test              # tests (Vitest)
npm run lint          # ESLint
npm run format:check  # Prettier
npm run build         # build de producción
```

## Importar datos de Salud (Atajo de Apple)

Safari no expone HealthKit a una PWA, así que los datos de la app **Salud** del iPhone se importan
mediante un fichero JSON que generas con un **Atajo de Apple**.

### Formato del fichero

```json
{
  "version": 1,
  "days": [
    { "date": "2026-05-25", "steps": 8423, "distanceKm": 6.21 },
    { "date": "2026-05-26", "steps": 11050, "distanceKm": 8.04 }
  ]
}
```

- `date`: `YYYY-MM-DD` (día local).
- `steps`: entero ≥ 0.
- `distanceKm`: distancia en kilómetros ≥ 0.

### Pasos para crear el Atajo

1. Abre la app **Atajos** y crea un atajo nuevo.
2. Añade **«Obtener muestras de salud»** para **Pasos**, agrupadas por **día**, en el rango que
   quieras (p. ej. los últimos 90 días). Repítelo para **Distancia a pie y en carrera**.
3. Combina ambos por fecha y construye el objeto `{ "version": 1, "days": [...] }`, con cada día y
   sus campos `date`, `steps` y `distanceKm` (distancia en **kilómetros**).
4. Usa **«Guardar archivo»** para guardarlo en Archivos como, por ejemplo, `salud.json`.
5. En Exercise Tracker, ve a **Ajustes → Importar datos de Salud** y selecciona el fichero.

La importación **fusiona por día**: reimportar rangos solapados actualiza esos días sin duplicar.
Los datos de Salud también se incluyen en el backup JSON de la app (`version: 2`).

> Si más adelante se publica un Atajo compartible (enlace iCloud), se enlazará aquí.
