import type { AxisType } from '@/lib/components/types/axis';
import { DEFAULT_AXIS_BASES } from '@/lib/components/types/axis';
import { Select } from '../shared/Select';
import { NumericInput } from '../shared/NumericInput';
import { trimType } from '@/lib/components/react-helpers/type-stripper';

export type AxisSettingsProps = {
  axis: AxisType;
  setAxis: (next: AxisType) => void;
};

const axisPatternOptions: { value: AxisType['type']; label: string }[] = [
  { value: 'tri', label: 'Triangular' },
  { value: 'hex', label: 'Hex' },
  { value: 'quad', label: 'Quad' },
  { value: 'octagonal', label: 'Octagonal' }
];

const minMaxStep = { min: 0.01, max: 5, step: 0.05 };

export const AxisSettings: React.FC<AxisSettingsProps> = ({ axis, setAxis }) => (
  <section className="configurator-panel section" aria-label="Axis pattern settings">
    <header className="space-y-1">
      <h2 className="text-base font-semibold text-white/90">Axis</h2>
      <p className="text-xs text-white/45">Shell overlay pattern (tri / hex / quad / octagonal).</p>
    </header>

    <Select
      label="Pattern"
      options={axisPatternOptions}
      onChange={(k) => setAxis({ ...DEFAULT_AXIS_BASES[k as AxisType['type']], ...trimType(axis) })}
      value={axis.type}
    />
    <div className={`grid grid-cols-${axis.type === 'quad' || axis.type === 'octagonal' ? '2' : '1'} gap-2 w-full`}>
      <NumericInput
        label="Global size"
        value={axis.globalSize}
        onChange={(v) => setAxis({ ...axis, globalSize: v } as AxisType)}
        {...minMaxStep}
      />
      {axis.type === 'quad' || axis.type === 'octagonal' ? (
        <NumericInput
          label="Relative size"
          value={axis.relativeSize}
          onChange={(v) => setAxis({ ...axis, relativeSize: v } as AxisType)}
          {...minMaxStep}
        />
      ) : null}
    </div>
  </section>
);
