import type { ReferenceSurfaceBase } from '@/lib/components/types/reference-surface';
import { clamp, clampInt } from '@/lib/grid-shell/utils';

export type ReferenceSurfaceSettingsProps = {
  referenceSurface: ReferenceSurfaceBase;
  setReferenceSurface: (next: ReferenceSurfaceBase) => void;
};

const inputClass =
  'bg-black/30 border border-white/20 rounded-lg px-3 py-2 outline-none focus:border-[#f3d5a3] text-white w-full';

export const ReferenceSurfaceSettings: React.FC<ReferenceSurfaceSettingsProps> = ({
  referenceSurface,
  setReferenceSurface
}) => (
  <section className="configurator-panel section" aria-label="Reference surface base layout">
    <header className="space-y-1">
      <h2 className="text-base font-semibold text-white/90">Reference surface</h2>
    </header>

    <div className="grid grid-cols-2 gap-4" data-surface-section="extent">
      <label className="flex flex-col gap-1" data-surface-field="n">
        <span className="text-xs font-semibold uppercase tracking-wide text-white/50">n (column spans)</span>
        <input
          type="number"
          className={inputClass}
          min={1}
          max={64}
          value={referenceSurface.n}
          onChange={(e) =>
            setReferenceSurface({
              ...referenceSurface,
              n: clampInt(Number(e.target.value || referenceSurface.n), 1, 64)
            })
          }
        />
      </label>
      <label className="flex flex-col gap-1" data-surface-field="m">
        <span className="text-xs font-semibold uppercase tracking-wide text-white/50">m (row spans)</span>
        <input
          type="number"
          className={inputClass}
          min={1}
          max={64}
          value={referenceSurface.m}
          onChange={(e) =>
            setReferenceSurface({
              ...referenceSurface,
              m: clampInt(Number(e.target.value || referenceSurface.m), 1, 64)
            })
          }
        />
      </label>
    </div>

    <div className="grid grid-cols-2 gap-4" data-surface-section="spacing">
      <label className="flex flex-col gap-1" data-surface-field="dX">
        <span className="text-xs font-semibold uppercase tracking-wide text-white/50">dX</span>
        <input
          type="number"
          className={inputClass}
          min={0.01}
          max={10}
          step={0.05}
          value={referenceSurface.dX}
          onChange={(e) =>
            setReferenceSurface({
              ...referenceSurface,
              dX: clamp(Number(e.target.value || referenceSurface.dX), 0.01, 10)
            })
          }
        />
      </label>
      <label className="flex flex-col gap-1" data-surface-field="dY">
        <span className="text-xs font-semibold uppercase tracking-wide text-white/50">dY</span>
        <input
          type="number"
          className={inputClass}
          min={0.01}
          max={10}
          step={0.05}
          value={referenceSurface.dY}
          onChange={(e) =>
            setReferenceSurface({
              ...referenceSurface,
              dY: clamp(Number(e.target.value || referenceSurface.dY), 0.01, 10)
            })
          }
        />
      </label>
    </div>
  </section>
);
