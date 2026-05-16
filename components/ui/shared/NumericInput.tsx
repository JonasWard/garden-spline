import { clamp } from "@/lib/grid-shell/utils";
import { Ref, useEffect, useState } from 'react';

const parseValue = (value: string, min: number = 0.05, max: number = 5) => clamp(Number(value), min, max);

export const NumericInput: React.FC<{
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  inputRef?: Ref<HTMLInputElement>;
  inputClass?: string;
}> = ({ value, onChange, inputClass, inputRef, ...props }) => {
  const [internalValue, setInternalValue] = useState<string>(value.toString());

  useEffect(() => {
    setInternalValue(value.toString());
  }, [value]);

  return (
    <input
      type="number"
      className={inputClass ?? 'configurator-panel-numeric-input'}
      ref={inputRef}
      value={internalValue}
      onChange={(e) => setInternalValue(e.target.value)}
      onBlur={() => onChange(parseValue(internalValue, props.min, props.max))}
      onClick={(e) => (onChange(parseValue(internalValue, props.min, props.max)), e.stopPropagation())}
      onKeyDown={(e) => e.key === 'Enter' && onChange(parseValue(internalValue, props.min, props.max))}
      {...props}
    />
  );
};