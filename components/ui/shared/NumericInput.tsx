import { clamp, clampInt } from '@/lib/grid-shell/utils';
import { Ref, useEffect, useState } from 'react';
import { LabelWrapper } from './LabelWrapper';

const parseValue = (value: string, min: number = 0.05, max: number = 5, isInteger: boolean = false) =>
  (isInteger ? clampInt : clamp)(Number(value), min, max);

export const NumericInput: React.FC<{
  isInteger?: boolean;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  inputRef?: Ref<HTMLInputElement>;
  label?: string;
}> = ({ value, onChange, inputRef, step = 1, isInteger = false, label, min, max }) => {
  const [internalValue, setInternalValue] = useState<string>(value.toString());

  useEffect(() => {
    setInternalValue(value.toString());
  }, [value]);

  return (
    <LabelWrapper label={label}>
      <input
        type="number"
        className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-[#f3d5a3] text-white w-full min-w-[7.5rem]"
        ref={inputRef}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        onBlur={() => onChange(parseValue(internalValue, min, max, isInteger))}
        onClick={(e) => (onChange(parseValue(internalValue, min, max, isInteger)), e.stopPropagation())}
        onKeyDown={(e) => e.key === 'Enter' && onChange(parseValue(internalValue, min, max, isInteger))}
        min={min}
        max={max}
        step={step}
      />
    </LabelWrapper>
  );
};
