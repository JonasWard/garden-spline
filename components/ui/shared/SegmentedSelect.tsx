'use client';

import './segmented-select.css';

export type SegmentedSelectOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedSelectProps<T extends string> = {
  options: SegmentedSelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  'aria-label'?: string;
};

export const SegmentedSelect = <T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel = 'Section'
}: SegmentedSelectProps<T>) => (
  <div className="segmented-select" role="tablist" aria-label={ariaLabel}>
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={selected}
          className={`segmented-select__option${selected ? ' is-active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);
