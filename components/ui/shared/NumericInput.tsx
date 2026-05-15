import { clamp } from "@/lib/grid-shell/utils";
import { useEffect, useState } from "react";

const parseValue = (value: string) => clamp(Number(value), 0.05, 5);

export const NumericInput: React.FC<{
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  inputClass: string;
}> = ({ value, onChange, inputClass, ...props }) => {
  const [internalValue, setInternalValue] = useState<string>(value.toString());

  useEffect(() => {
    setInternalValue(value.toString());
  }, [value]);

  return (
    <input
      type="number"
      className={inputClass}
      value={internalValue}
      onChange={(e) => setInternalValue(e.target.value)}
      onBlur={() => onChange(parseValue(internalValue))}
      onClick={(e) => (onChange(parseValue(internalValue)), e.stopPropagation())}
      onKeyDown={(e) => e.key === 'Enter' && onChange(parseValue(internalValue))}
      {...props}
    />
  );
};