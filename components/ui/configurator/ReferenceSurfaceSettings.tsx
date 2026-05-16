import type { ReferenceSurfaceBase } from '@/lib/components/types/reference-surface';
import { NumericInput } from '../shared/NumericInput';

export type ReferenceSurfaceSettingsProps = {
  referenceSurface: ReferenceSurfaceBase;
  setReferenceSurface: (next: ReferenceSurfaceBase) => void;
};

const minMaxStepNM = { min: 1, max: 12, step: 1 };
const minMaxStepdXdY = { min: 0.01, max: 10, step: 0.05 };

export const ReferenceSurfaceSettings: React.FC<ReferenceSurfaceSettingsProps> = ({
  referenceSurface,
  setReferenceSurface
}) => (
  <section className="configurator-panel section" aria-label="Reference surface base layout">
    <header className="space-y-1">
      <h2 className="text-base font-semibold text-white/90">Reference surface</h2>
    </header>

    <div className="grid grid-cols-2 gap-2" data-surface-section="extent">
      <NumericInput
        {...minMaxStepNM}
        value={referenceSurface.n}
        onChange={(n) =>
          setReferenceSurface({
            ...referenceSurface,
            n
          })
        }
        label="n (column spans)"
        isInteger
      />
      <NumericInput
        {...minMaxStepNM}
        value={referenceSurface.m}
        onChange={(m) =>
          setReferenceSurface({
            ...referenceSurface,
            m
          })
        }
        label="m (row spans)"
        isInteger
      />
    </div>

    <div className="grid grid-cols-2 gap-2" data-surface-section="spacing">
      <NumericInput
        {...minMaxStepdXdY}
        value={referenceSurface.dX}
        onChange={(dX) =>
          setReferenceSurface({
            ...referenceSurface,
            dX
          })
        }
        label="dX"
      />
      <NumericInput
        {...minMaxStepdXdY}
        value={referenceSurface.dY}
        onChange={(dY) =>
          setReferenceSurface({
            ...referenceSurface,
            dY
          })
        }
        label="dY"
      />
    </div>
  </section>
);
