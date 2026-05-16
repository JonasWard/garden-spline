import { clamp, clampInt } from '@/lib/grid-shell/utils';
import { type KeyboardEvent, type Ref, useEffect, useState } from 'react';
import { LabelWrapper } from './LabelWrapper';

const parseValue = (value: string, min?: number, max?: number, isInteger: boolean = false) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (min === undefined || max === undefined) return n;
  return (isInteger ? clampInt : clamp)(n, min, max);
};

export const NumericInput: React.FC<{
  isInteger?: boolean;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  inputRef?: Ref<HTMLInputElement>;
  label?: string;
  onFocus?: () => void;
  /** Return `false` to skip commit on blur (e.g. Escape). */
  onBlur?: () => boolean | void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}> = ({ value, onChange, inputRef, step = 1, isInteger = false, label, min, max, onFocus, onBlur, onKeyDown }) => {
  const [internalValue, setInternalValue] = useState<string>(value.toString());

  useEffect(() => {
    setInternalValue(value.toString());
  }, [value]);

  const commit = () => {
    const parsed = parseValue(internalValue, min, max, isInteger);
    if (parsed !== null) onChange(parsed);
    else setInternalValue(value.toString());
  };

  return (
    <LabelWrapper label={label}>
      <input
        type="number"
        className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-[#f3d5a3] text-white w-full min-w-[7.5rem]"
        ref={inputRef}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        onFocus={onFocus}
        onBlur={() => {
          if (onBlur?.() === false) {
            setInternalValue(value.toString());
            return;
          }
          commit();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
            (e.target as HTMLInputElement).blur();
          }
        }}
        min={min}
        max={max}
        step={step}
      />
    </LabelWrapper>
  );
};
