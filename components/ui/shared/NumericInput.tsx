import { clamp } from "@/lib/grid-shell/utils";
import { useEffect, useState } from "react";

export const NumericInput: React.FC<{
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  inputClass: string;
}> = ({ value, onChange, inputClass, ...props }) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);
  
  return <input
      type="number"
      className={inputClass}
      value={internalValue}
      onChange={(e) => {
        const v = clamp(Number(e.target.value || value), 0.05, 5);
        setInternalValue(v);
      }}
      onBlur={() => onChange(internalValue)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onChange(internalValue);
        }
      }}
      {...props}
    />
    };