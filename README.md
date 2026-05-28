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
mediante un fichero JSON que generas con un **Atajo de Apple**. El Atajo se limita a volcar las
**muestras crudas** que devuelve Salud; la app las agrupa por día al importar.

### Formato del fichero (v2, recomendado)

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

- `metric`: `"steps"` (conteo) o `"distance"` (kilómetros).
- `date`: ISO local de la muestra (`YYYY-MM-DDTHH:mm:ss`) o `YYYY-MM-DD`. Se agrupa por **día
  local**.
- `value`: número ≥ 0.

### Pasos para crear el Atajo

1. Abre la app **Atajos** y crea un atajo nuevo.
2. Añade **«Buscar muestras médicas»** con tipo **Pasos** (sin agrupar). Repítelo en otra acción
   con tipo **Distancia a pie y en carrera** (en km).
3. Por cada lista, **«Repetir con cada»** muestra y añade a una variable de texto un objeto
   `{ "metric": "steps", "date": <fecha de inicio>, "value": <valor> }` (y `"distance"` para la
   otra). **No hay que sumar nada.**
4. Envuelve todo en `{ "version": 2, "samples": [...] }` y usa **«Guardar archivo»** para
   guardarlo como, por ejemplo, `salud.json`.
5. En Exercise Tracker, ve a **Ajustes → Importar datos de Salud** y selecciona el fichero. La app
   agrupa por día.

La importación **fusiona por día**: reimportar rangos solapados actualiza esos días sin duplicar.
Los datos de Salud también se incluyen en el backup JSON de la app (`version: 2`).

### Formato v1 (días ya agregados, alternativo)

Si prefieres agregar tú mismo por día, el formato v1 sigue siendo válido:

```json
{
  "version": 1,
  "days": [{ "date": "2026-05-25", "steps": 8423, "distanceKm": 6.21 }]
}
```

> Si más adelante se publica un Atajo compartible (enlace iCloud), se enlazará aquí.
