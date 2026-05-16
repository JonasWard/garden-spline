import { BeamType, DEFAULT_BEAM } from '@/lib/components/types/beam';
import { NumericInput } from '../shared/NumericInput';
import { Select } from '../shared/Select';
import { trimType } from '@/lib/components/react-helpers/type-stripper';

const beamTypeOptions: { value: BeamType['type']; label: string }[] = [
  { value: 'inline', label: 'Inline' },
  { value: 'stack', label: 'Stack' }
];

export const BeamSettings: React.FC<{ beam: BeamType; setBeamType: (b: BeamType) => void }> = ({
  beam,
  setBeamType
}) => (
  <section className="configurator-panel section" aria-label="Axis pattern settings">
    <header className="space-y-1">
      <h2 className="text-base font-semibold text-white/90">Beam</h2>
    </header>

    <label className="flex flex-col gap-1 w-full" data-axis-section="relative-size">
      <span className="text-xs font-semibold uppercase tracking-wide text-white/50">Dimensions</span>
      <div className="grid grid-cols-2 w-full justify-between gap-2">
        <Select
          label="Beam Type"
          options={beamTypeOptions}
          onChange={(type) => setBeamType({ ...DEFAULT_BEAM[type as BeamType['type']], ...trimType(beam) })}
          value={beam.type}
          inputClass="w-full"
        />
        {beam.type === 'stack' && (
          <NumericInput
            inputClass="w-full"
            value={beam.count}
            onChange={(count) => setBeamType({ ...beam, count })}
            min={1}
            max={10}
            step={1}
          />
        )}
      </div>
      {beam.type === 'stack' && (
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={beam.up} onChange={() => setBeamType({ ...beam, up: !beam.up })} />
          <span className="text-sm text-white/80">Stack up from surface</span>
        </label>
      )}
      <NumericInput
        value={beam.width}
        onChange={(width) => setBeamType({ ...beam, width })}
        min={0.001}
        max={0.5}
        step={0.005}
      />
      <NumericInput
        value={beam.height}
        onChange={(height) => setBeamType({ ...beam, height })}
        min={0.001}
        max={0.5}
        step={0.005}
      />
    </label>
  </section>
);
