---
id: F6-T006
status: todo
title: Profile repository (IndexedDB userProfile)
sub-phase: B-persistence
depends-on: [F6-T001]
---

## Goal

Persistir el `UserProfile` en IndexedDB. Sube la base a versión **3** añadiendo
el store `userProfile` (sin tocar `sessions` ni `healthDays`) y extiende
`SessionRepository` con métodos de perfil.

## Context

Editar `src/data/sessionRepository.ts` (patrón actual: `idb` + `DB_VERSION` +
upgrade idempotente con `!db.objectStoreNames.contains(...)`).

Cambios:
- `DB_VERSION` → `3`. En `upgrade`, crear el store `userProfile` con
  `keyPath: 'id'` si no existe. **No** tocar `sessions` ni `healthDays`.
- Añadir `userProfile` al `SessionsSchema`: `{ key: string; value: UserProfile & { id: 'me' } }`.
- Extender la interfaz `SessionRepository`:
  ```ts
  getProfile(): Promise<UserProfile | null>;
  setProfile(profile: UserProfile): Promise<void>;
  clearProfile(): Promise<void>;
  ```
- Implementarlos en `createSessionRepository`:
  - `getProfile`: lee `userProfile.get('me')`. Devuelve `null` si no existe.
    Quita el `id` del valor antes de devolverlo (la app no necesita verlo).
  - `setProfile`: `userProfile.put({ id: 'me', ...profile })`. Sobrescribe.
  - `clearProfile`: `userProfile.delete('me')`.
- Actualizar `createMockRepo` en `src/test/createMockRepo.ts` con los tres
  métodos nuevos: `getProfile` → `null` por defecto.

## Tests (write first — RED)

Ampliar `src/data/sessionRepository.test.ts` (usa `fake-indexeddb`).

```
it('returns null when no profile is stored')
it('stores and reads back a profile (without exposing the internal id)')
it('setProfile overwrites the existing profile')
it('clearProfile removes the stored profile')
it('upgrades cleanly from v2 keeping sessions and healthDays intact')
```

Para el último test: crear datos con `DB_VERSION = 2` mediante un script (o
abriendo el viejo schema vía fake-indexeddb) y validar que tras el upgrade los
sessions/healthDays existen.

## Implementation

1. Subir `DB_VERSION` a 3.
2. Añadir el store en el `upgrade` callback (idempotente).
3. Implementar los 3 métodos en `createSessionRepository`.
4. Actualizar `createMockRepo` con los tres métodos por defecto.

## Done when

- [ ] Todos los tests pasan (incl. previos de repositorio/sesiones/salud).
- [ ] `npm run lint && npm run format:check && npm test && npm run build` → OK.
- [ ] `status: done` en este archivo.
- [ ] Tabla en `tasks-summary.md` actualizada y puntero movido a F6-T007.
