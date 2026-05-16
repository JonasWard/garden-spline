import { LabelWrapper } from '../shared/LabelWrapper';

export const CheckboxHelper: React.FC<{ checked: boolean; onChange: () => void; label?: string; }> = ({ label, ...props }) => (
  <LabelWrapper horizontal label={label} children={<input type="checkbox" {...props} />} />
);
