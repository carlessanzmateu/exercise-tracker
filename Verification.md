# Exercise Tracker — Validación manual (T054)

Checklist de la validación final en dispositivos reales descrita en `tasks.md` § T054.

> T054 sólo puede marcarse `[x]` cuando los tres bloques (iPhone, tablet, desktop) están completos y los defectos críticos corregidos.

---

## Cómo preparar la app para validar

1. Construye y sirve la versión de producción (con SW activo) desde una IP accesible por el dispositivo a validar:

   ```bash
   npm run build
   npm run preview -- --host 0.0.0.0
   ```

   En el iPhone abre Safari apuntando a `http://<ip-del-Mac>:4173/` (el puerto puede variar; míralo en la salida del comando).

2. Como alternativa rápida en escritorio para validar el flujo funcional (sin SW):

   ```bash
   npm run dev
   ```

3. Para reinstalar la PWA limpia tras cambios: en iOS borra la app de la pantalla de inicio y la caché de Safari; en Chrome/Edge desinstala la PWA y limpia los datos del sitio.

---

## iPhone (Safari) — foco principal

- [ ] Abrir la URL servida por `preview` en Safari y verificar que la app carga.
- [ ] **Instalación**: Compartir → "Añadir a pantalla de inicio". Confirmar que el icono que aparece en la home es el `apple-touch-icon.png` (180×180) y el nombre "Exercise Tracker".
- [ ] **Splash / status bar**: al abrir desde la home, la app entra en modo standalone (sin barra de Safari). El `theme-color` `#111111` se refleja en el área superior si el sistema lo soporta.
- [ ] **Offline**: con la app abierta una vez, activar modo avión y recargar la PWA desde la pantalla de inicio. La app debe arrancar y mostrar el feed con los datos guardados.
- [ ] **Flujo completo**:
  - [ ] Crear sesión nueva editando la fecha+hora.
  - [ ] Añadir ejercicio strength con 2 series (reps + peso).
  - [ ] Añadir ejercicio bodyweight (1 con peso, 1 sin peso).
  - [ ] Añadir ejercicio time (Plancha): 2 series de N reps × M segundos.
  - [ ] Añadir ejercicio cardio (Correr): bloque con duración + distancia.
  - [ ] Guardar y verificar que aparece en el feed con el formato `"Lun 25 may · 10:30"` y `"N ejercicios"`.
  - [ ] Tap en la tarjeta → detalle. Editar fecha+hora. Editar una serie. Eliminar una serie. Eliminar un ejercicio. Eliminar la sesión.
  - [ ] Ajustes → Exportar JSON (descarga del fichero con nombre `exercise-tracker-backup-YYYYMMDD-HHmm.json`).
  - [ ] Ajustes → Importar el JSON exportado, confirmar el diálogo, verificar que el feed muestra los datos importados.
- [ ] **Inputs numéricos** abren el teclado numérico nativo (no el alfanumérico).
- [ ] **Modo oscuro**: ajustar Ajustes iOS → Aspecto → Oscuro; la PWA refleja el cambio automáticamente.

## Tablet (iPad o Android)

- [ ] Instalable como PWA desde el navegador del sistema.
- [ ] Layout responsive en portrait y landscape: el contenedor principal se centra con `max-width` ~600 px y padding lateral; el contenido no desborda en horizontal.
- [ ] Flujo completo idéntico al de iPhone.

## Desktop (Chrome / Edge / Safari macOS)

- [ ] Instalable como PWA desde la barra de direcciones; la app se abre en su propia ventana en modo standalone.
- [ ] **Contenedor centrado**: al redimensionar entre 320 px y >1280 px, el contenido sigue el `max-width` definido en T055 sin desbordes ni recortes.
- [ ] **Hover states**: el cursor sobre botones/enlaces refleja interacción (la regla `@media (hover: hover) and (pointer: fine)` activa).
- [ ] **Navegación por teclado**: Tab navega por enlaces y botones; el foco es visible (`:focus-visible` con outline accent).
- [ ] Flujo completo funcional en ventana pequeña (320 px) y grande (>1280 px).

## Defectos detectados durante la validación

> Anota aquí cualquier defecto observado durante el checklist, junto con la corrección aplicada y el commit/PR que la resuelve.

- _(vacío)_
