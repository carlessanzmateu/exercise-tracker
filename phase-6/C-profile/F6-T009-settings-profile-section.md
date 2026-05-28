---
id: F6-T009
status: done
title: Settings — Profile section
sub-phase: C-profile
depends-on: [F6-T001, F6-T006]
---

## Goal

Añadir una sección **"Perfil"** en Ajustes con un formulario para editar
altura, fecha de nacimiento y sexo. Validación inline y persistencia con
`setProfile`. Anchor `#perfil` para deep-link desde la vista de Peso (F6-T010).

## Context

Editar `src/features/settings/Settings.tsx`. Convenciones de estilo: mismas
clases CSS que las secciones existentes (`page-title`, `notice`,
`settings-actions`, etc.).

Comportamiento:
- Al montar: `repo.getProfile()` → estado `profile` (`UserProfile | null` o
  `'loading'`).
- Render:
  - Cabecera `<h3 id="perfil" className="settings-section-title">Perfil</h3>`
    (el `id` permite navegar con `#perfil`).
  - Nota corta: "Usamos estos datos para calcular tu BMR (kcal en reposo).
    Solo se guardan en este dispositivo."
  - Formulario con 3 campos:
    - **Altura (cm)**: `<input type="number" inputMode="decimal" step="0.1" min="50" max="260">`
    - **Fecha de nacimiento**: `<input type="date" max="{today}">`
    - **Sexo**: dos `<input type="radio" name="sex" value="male|female">` con
      labels "Hombre" / "Mujer".
  - Botón "Guardar perfil".
  - Mensaje de éxito (`role="status"`, `.settings-success`) tras guardar.
  - Errores de validación inline (debajo del input correspondiente).
- Al enviar:
  - Construir candidato `{ heightCm, birthdate, sex }` y pasarlo por
    `normalizeUserProfile(candidate, new Date())`.
  - Si `null` → mostrar mensaje de error genérico + marcar los campos
    inválidos.
  - Si válido → `repo.setProfile(profile)` → mostrar "Perfil guardado.".
- Soportar **editar** un perfil existente (los campos se prellenan con el
  perfil cargado).

## Tests (write first — RED)

Ampliar `src/features/settings/Settings.test.tsx`.

```
describe('<Settings /> profile section (F6-T009)')
  it('renders the Profile section with a #perfil anchor')
  it('shows the form prefilled when a profile exists')
  it('saves a valid profile via repo.setProfile')
  it('shows a success message after saving')
  it('shows an inline error when heightCm is non-positive')
  it('shows an inline error when birthdate is in the future or implies age < 5')
  it('shows an inline error when sex is not selected')
```

## Implementation

1. Cargar perfil en `useEffect` y mantenerlo en estado.
2. Implementar formulario controlado con validación previa al submit.
3. Llamar a `repo.setProfile` y mostrar feedback.
4. Asegurar accesibilidad: `<label htmlFor>` por campo, mensajes de error
   con `aria-describedby`.

## Done when

- [ ] Todos los tests pasan.
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada. Sub-fase C completa; puntero a F6-T010.
