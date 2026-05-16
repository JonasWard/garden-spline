import { BEAM_STACK_MIN_MAX, BeamType, DEFAULT_BEAM } from '@/lib/components/types/beam';
import { NumericInput } from '../shared/NumericInput';
import { Select } from '../shared/Select';
import { trimType } from '@/lib/components/react-helpers/type-stripper';
import { CheckboxHelper } from '../shared/CheckboxHelper';

const beamTypeOptions: { value: BeamType['type']; label: string }[] = [
  { value: 'inline', label: 'Inline' },
  { value: 'stack', label: 'Stack' }
];

export const BeamSettings: React.FC<{ beam: BeamType; setBeamType: (b: BeamType) => void }> = ({ beam, setBeamType }) => (
  <section className="configurator-panel section" aria-label="Axis pattern settings">
    <header className="space-y-1">
      <h2 className="text-base font-semibold text-white/90">Beam</h2>
    </header>

    <label className="flex flex-col gap-2 w-full" data-axis-section="relative-size">
      <span className="text-xs font-semibold uppercase tracking-wide text-white/50">Dimensions</span>
      <div className="grid grid-cols-2 w-full justify-between gap-2">
        <Select
          label="Beam Type"
          options={beamTypeOptions}
          onChange={(type) => setBeamType({ ...DEFAULT_BEAM[type as BeamType['type']], ...trimType(beam) })}
          value={beam.type}
        />
        {beam.type === 'stack' && (
          <NumericInput
            label="Count"
            value={beam.count}
            onChange={(count) => setBeamType({ ...beam, count })}
            {...BEAM_STACK_MIN_MAX}
            isInteger
          />
        )}
      </div>
      <div className="grid grid-cols-2 w-full justify-between gap-2">
        <NumericInput
          label="Width"
          value={beam.width}
          onChange={(width) => setBeamType({ ...beam, width })}
          min={0.001}
          max={0.5}
          step={0.005}
        />
        <NumericInput
          label="Height"
          value={beam.height}
          onChange={(height) => setBeamType({ ...beam, height })}
          min={0.001}
          max={0.5}
          step={0.005}
        />
      </div>
      {beam.type === 'stack' && (
        <CheckboxHelper
          label="Stack up from surface"
          checked={beam.up}
          onChange={() => setBeamType({ ...beam, up: !beam.up })}
        />
      )}
    </label>
  </section>
);
