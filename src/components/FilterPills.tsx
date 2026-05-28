export interface FilterPillsOption<T extends string> {
  value: T;
  label: string;
}

export interface FilterPillsProps<T extends string> {
  options: FilterPillsOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: FilterPillsProps<T>) {
  return (
    <div className="filter-pills" role="tablist" aria-label={ariaLabel}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={`filter-pills__pill${active ? ' filter-pills__pill--active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
