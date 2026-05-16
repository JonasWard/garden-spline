export const LabelWrapper: React.FC<{ label?: string; children: React.ReactNode; horizontal?: boolean }> = ({
  label,
  children,
  horizontal = false
}) =>
  label ? (
    <label className={`flex ${horizontal ? 'flex-row-reverse justify-end gap-2' : 'flex-col'} gap-1`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{label}</span>
      {children}
    </label>
  ) : (
    children
  );
