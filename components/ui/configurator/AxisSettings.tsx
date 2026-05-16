import type { AxisType } from '@/lib/components/types/axis';
import { DEFAULT_AXIS_BASES } from '@/lib/components/types/axis';
import { Select } from '../shared/Select';
import { NumericInput } from '../shared/NumericInput';
import { trimType } from '@/lib/components/react-helpers/type-stripper';

export type AxisSettingsProps = {
  axis: AxisType;
  setAxis: (next: AxisType) => void;
};

type QuadType = Extract<AxisType, { type: 'quad' }>;
type OctagonalType = Extract<AxisType, { type: 'octagonal' }>;

const inputClass =
  'bg-black/30 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-[#f3d5a3] text-white w-full';

const axisPatternOptions: { value: AxisType['type']; label: string }[] = [
  { value: 'tri', label: 'Triangular' },
  { value: 'hex', label: 'Hex' },
  { value: 'quad', label: 'Quad' },
  { value: 'octagonal', label: 'Octagonal' }
];

const AxisPatternSelect: React.FC<{ axis: AxisType; setAxis: (next: AxisType) => void }> = ({ axis, setAxis }) => (
  <Select
    options={axisPatternOptions}
    onChange={(k) => setAxis({ ...DEFAULT_AXIS_BASES[k as AxisType['type']], ...trimType(axis) })}
    inputClass={inputClass}
    value={axis.type}
  />
);

const AxisGlobalSizeField: React.FC<{ axis: AxisType; setAxis: (next: AxisType) => void }> = ({ axis, setAxis }) => (
  <label className="flex flex-col gap-1 w-full" data-axis-section="global-size">
    <span className="text-xs font-semibold uppercase tracking-wide text-white/50">Global size</span>
    <NumericInput
      value={axis.globalSize}
      onChange={(v) => setAxis({ ...axis, globalSize: v } as AxisType)}
      inputClass={inputClass}
      min={0.05}
      max={5}
      step={0.05}
    />
  </label>
);

const AxisRelativeSizeField: React.FC<{ axis: QuadType | OctagonalType; setAxis: (next: AxisType) => void }> = ({
  axis,
  setAxis
}) => (
  <label className="flex flex-col gap-1 w-full" data-axis-section="relative-size">
    <span className="text-xs font-semibold uppercase tracking-wide text-white/50">Relative size</span>
    <NumericInput
      value={axis.relativeSize}
      onChange={(v) => setAxis({ ...axis, relativeSize: v } as AxisType)}
      inputClass={inputClass}
      min={0.05}
      max={5}
      step={0.05}
    />
  </label>
);

export const AxisSettings: React.FC<AxisSettingsProps> = ({ axis, setAxis }) => (
  <section className="configurator-panel section" aria-label="Axis pattern settings">
    <header className="space-y-1">
      <h2 className="text-base font-semibold text-white/90">Axis</h2>
      <p className="text-xs text-white/45">Shell overlay pattern (tri / hex / quad / octagonal).</p>
    </header>

    <AxisPatternSelect axis={axis} setAxis={setAxis} />
    <div className="flex gap-4 w-full">
      <AxisGlobalSizeField axis={axis} setAxis={setAxis} />
      {axis.type === 'quad' || axis.type === 'octagonal' ? (
        <AxisRelativeSizeField axis={axis} setAxis={setAxis} />
      ) : null}
    </div>
  </section>
);
