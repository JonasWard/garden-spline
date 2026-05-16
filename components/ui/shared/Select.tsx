import { LabelWrapper } from './LabelWrapper';

type SelectProps = {
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  label?: string;
  value: string;
};

export const Select: React.FC<SelectProps> = ({ options, onChange, label, value }) => (
  <LabelWrapper label={label}>
    <select
      className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-[#f3d5a3] text-white w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </LabelWrapper>
);
