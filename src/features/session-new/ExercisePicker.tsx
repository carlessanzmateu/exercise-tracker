import { useState } from 'react';

import { getCatalogGroupedByCategory } from '@/domain/catalog';

export function ExercisePicker({ onSelect }: { onSelect: (typeId: string) => void }) {
  const [query, setQuery] = useState('');
  const groups = getCatalogGroupedByCategory();
  const normalized = query.trim().toLowerCase();

  return (
    <div className="exercise-picker" role="group" aria-label="Elegir tipo de ejercicio">
      <input
        type="search"
        role="searchbox"
        placeholder="Buscar ejercicio…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="exercise-picker__search"
        aria-label="Buscar ejercicio"
      />
      {Array.from(groups.entries()).map(([category, types]) => {
        const visible = normalized
          ? types.filter((t) => t.name.toLowerCase().includes(normalized))
          : types;
        if (visible.length === 0) return null;
        return (
          <section key={category} className="exercise-picker__category">
            <h4 className="picker-category-heading">{category}</h4>
            <ul>
              {visible.map((type) => (
                <li key={type.id}>
                  <button
                    type="button"
                    className="btn btn-ghost picker-exercise-btn"
                    onClick={() => onSelect(type.id)}
                  >
                    {type.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
