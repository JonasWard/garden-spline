import { useR3FStore } from '@/store/r3f-store';
import { CheckboxHelper } from '../shared/CheckboxHelper';
import { Select } from '../shared/Select';
import { useEffect } from 'react';

const constraintOptions: { value: 'x' | 'y' | 'z'; label: string }[] = [
  { value: 'x', label: 'X-direction' },
  { value: 'y', label: 'Y-direction' },
  { value: 'z', label: 'Z-direction' }
];

export const ControlPointSettings: React.FC = () => {
  const controlPointConstraint = useR3FStore((state) => state.controlPointConstraint);
  const showControlPoints = useR3FStore((state) => state.showControlPoints);
  const setShowControlPoints = useR3FStore((state) => state.setShowControlPoints);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'x') useR3FStore.getState().setControlPointConstraint('x');
      if (e.key === 'y') useR3FStore.getState().setControlPointConstraint('y');
      if (e.key === 'z') useR3FStore.getState().setControlPointConstraint('z');
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [controlPointConstraint]);

  return (
    <section className="configurator-panel section" aria-label="Axis pattern settings">
      <header className="configurator-panel-content-header">
        <h2 className="text-base font-semibold text-white/90">Control Point</h2>
      </header>

      <CheckboxHelper
        label="Show control points"
        checked={showControlPoints}
        onChange={() => setShowControlPoints(!showControlPoints)}
      />
      <Select
        options={constraintOptions}
        label="Constraint axis"
        onChange={(v) => useR3FStore.getState().setControlPointConstraint(v as 'x' | 'y' | 'z')}
        value={controlPointConstraint}
      />
    </section>
  );
};
