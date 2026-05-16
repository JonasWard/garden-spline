type SelectProps = {
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  inputClass: string;
  label?: string;
  value: string;
};

export const Select: React.FC<SelectProps> = ({ options, onChange, inputClass, label = 'Pattern', value }) => (
  <label className="flex flex-col gap-1" data-axis-section="pattern">
    <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{label}</span>
    <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);
