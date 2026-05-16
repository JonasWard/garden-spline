import { BeamType } from '@/lib/components/types/beam';
import { NumericInput } from '../shared/NumericInput';

export const BeamSettings: React.FC<{ beam: BeamType; setBeamType: (b: BeamType) => void }> = ({ beam, setBeamType }) => (
  <section className="configurator-panel section" aria-label="Axis pattern settings">
    <header className="space-y-1">
      <h2 className="text-base font-semibold text-white/90">Beam</h2>
    </header>

    <label className="flex flex-col gap-1 w-full" data-axis-section="relative-size">
      <span className="text-xs font-semibold uppercase tracking-wide text-white/50">Dimensions</span>
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
