import { describe, it, expect } from 'vitest';
import {
  EXERCISE_CATALOG,
  getCatalogGroupedByCategory,
  getExerciseTypeById,
} from '@/domain/catalog';
import type { ExerciseShape } from '@/domain/types';

const EXPECTED_CATEGORIES = [
  'Pecho',
  'Espalda',
  'Hombros',
  'Piernas',
  'Brazos',
  'Core',
  'Autocarga',
  'Cardio',
] as const;

const VALID_SHAPES = new Set<ExerciseShape>(['strength', 'bodyweight', 'time', 'cardio']);

describe('EXERCISE_CATALOG', () => {
  it('contains exactly 24 types', () => {
    expect(EXERCISE_CATALOG).toHaveLength(24);
  });

  it('all IDs are unique', () => {
    const ids = EXERCISE_CATALOG.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all names are unique', () => {
    const names = EXERCISE_CATALOG.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('all IDs are kebab-case ASCII without accents', () => {
    for (const t of EXERCISE_CATALOG) {
      expect(t.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it('covers exactly the 8 expected categories', () => {
    const categories = new Set(EXERCISE_CATALOG.map((t) => t.category));
    for (const expected of EXPECTED_CATEGORIES) {
      expect(categories.has(expected)).toBe(true);
    }
    expect(categories.size).toBe(EXPECTED_CATEGORIES.length);
  });

  it('every type has a valid shape', () => {
    for (const t of EXERCISE_CATALOG) {
      expect(VALID_SHAPES.has(t.shape)).toBe(true);
    }
  });

  it('Plank (id "plancha") has shape "time"', () => {
    const plancha = EXERCISE_CATALOG.find((t) => t.id === 'plancha');
    expect(plancha).toBeDefined();
    expect(plancha?.shape).toBe('time');
  });

  it('Walk and Run have shape "cardio"', () => {
    const caminar = EXERCISE_CATALOG.find((t) => t.id === 'caminar');
    const correr = EXERCISE_CATALOG.find((t) => t.id === 'correr');
    expect(caminar?.shape).toBe('cardio');
    expect(correr?.shape).toBe('cardio');
  });

  it('has 15 types with shape "strength" (all machines/weights)', () => {
    const strength = EXERCISE_CATALOG.filter((t) => t.shape === 'strength');
    expect(strength).toHaveLength(15);
  });

  it('has 6 types with shape "bodyweight" (Autocarga minus Plank)', () => {
    const bodyweight = EXERCISE_CATALOG.filter((t) => t.shape === 'bodyweight');
    expect(bodyweight).toHaveLength(6);
  });

  it('has 1 type with shape "time" (Plank)', () => {
    const time = EXERCISE_CATALOG.filter((t) => t.shape === 'time');
    expect(time).toHaveLength(1);
  });

  it('has 2 types with shape "cardio" (Walk, Run)', () => {
    const cardio = EXERCISE_CATALOG.filter((t) => t.shape === 'cardio');
    expect(cardio).toHaveLength(2);
  });

  it('every machine in Pecho/Espalda/Hombros/Piernas/Brazos/Core is shape "strength"', () => {
    const gymCategories = new Set(['Pecho', 'Espalda', 'Hombros', 'Piernas', 'Brazos', 'Core']);
    const gym = EXERCISE_CATALOG.filter((t) => gymCategories.has(t.category));
    for (const t of gym) {
      expect(t.shape).toBe('strength');
    }
  });
});

describe('getExerciseTypeById', () => {
  it('returns the type when the id exists', () => {
    const result = getExerciseTypeById('plancha');
    expect(result).toBeDefined();
    expect(result?.id).toBe('plancha');
    expect(result?.name).toBe('Plancha');
    expect(result?.shape).toBe('time');
  });

  it('resolves one type per shape correctly', () => {
    expect(getExerciseTypeById('press-banca')?.shape).toBe('strength');
    expect(getExerciseTypeById('flexiones')?.shape).toBe('bodyweight');
    expect(getExerciseTypeById('plancha')?.shape).toBe('time');
    expect(getExerciseTypeById('correr')?.shape).toBe('cardio');
  });

  it('returns undefined when the id does not exist', () => {
    expect(getExerciseTypeById('no-existe')).toBeUndefined();
  });

  it('returns undefined for an empty string', () => {
    expect(getExerciseTypeById('')).toBeUndefined();
  });

  it('is case-sensitive (does not match "Plancha" with uppercase P)', () => {
    expect(getExerciseTypeById('Plancha')).toBeUndefined();
  });
});

describe('getCatalogGroupedByCategory', () => {
  it('returns a Map with the 8 categories as keys', () => {
    const groups = getCatalogGroupedByCategory();
    expect(groups).toBeInstanceOf(Map);
    expect(groups.size).toBe(8);
    for (const expected of EXPECTED_CATEGORIES) {
      expect(groups.has(expected)).toBe(true);
    }
  });

  it('the total number of grouped types is 24', () => {
    const groups = getCatalogGroupedByCategory();
    let total = 0;
    for (const items of groups.values()) {
      total += items.length;
    }
    expect(total).toBe(24);
  });

  it('each category only groups types from that category', () => {
    const groups = getCatalogGroupedByCategory();
    for (const [category, items] of groups) {
      for (const t of items) {
        expect(t.category).toBe(category);
      }
    }
  });

  it('key order follows the first appearance in the catalogue', () => {
    const groups = getCatalogGroupedByCategory();
    expect([...groups.keys()]).toEqual([...EXPECTED_CATEGORIES]);
  });

  it('order is stable between calls', () => {
    const a = getCatalogGroupedByCategory();
    const b = getCatalogGroupedByCategory();
    expect([...a.keys()]).toEqual([...b.keys()]);
  });

  it('each category has the expected type count', () => {
    const groups = getCatalogGroupedByCategory();
    expect(groups.get('Pecho')?.length).toBe(3);
    expect(groups.get('Espalda')?.length).toBe(3);
    expect(groups.get('Hombros')?.length).toBe(1);
    expect(groups.get('Piernas')?.length).toBe(5);
    expect(groups.get('Brazos')?.length).toBe(2);
    expect(groups.get('Core')?.length).toBe(1);
    expect(groups.get('Autocarga')?.length).toBe(7);
    expect(groups.get('Cardio')?.length).toBe(2);
  });
});
