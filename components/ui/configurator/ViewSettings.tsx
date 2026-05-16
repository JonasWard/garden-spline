import { CheckboxHelper } from '../shared/CheckboxHelper';

export type ViewSettings = {
  showAxis: boolean;
  showAxis3d: boolean;
  showBeam: boolean;
  showReferenceSurfaceVisualisation: boolean;
  showControlPoints: boolean;
  showWireframe: boolean;
};

type ViewSettingsUIProps = {
  viewSettings: ViewSettings;
  setViewSettings: (viewSettings: ViewSettings) => void;
};

export const ViewSettingsUI = ({ viewSettings: vS, setViewSettings }: ViewSettingsUIProps) => {
  return (
    <section className="configurator-panel section" aria-label="Axis pattern settings">
      <header className="space-y-1">
        <h2 className="text-base font-semibold text-white/90">View Settings</h2>
      </header>
      <CheckboxHelper
        label="Show axis"
        checked={vS.showAxis}
        onChange={() => setViewSettings({ ...vS, showAxis: !vS.showAxis })}
      />
      <CheckboxHelper
        label="Show axis 3D"
        checked={vS.showAxis3d}
        onChange={() => setViewSettings({ ...vS, showAxis3d: !vS.showAxis3d })}
      />
      <CheckboxHelper
        label="Show beam"
        checked={vS.showBeam}
        onChange={() => setViewSettings({ ...vS, showBeam: !vS.showBeam })}
      />
      <CheckboxHelper
        label="Show reference surface visualisation"
        checked={vS.showReferenceSurfaceVisualisation}
        onChange={() =>
          setViewSettings({
            ...vS,
            showReferenceSurfaceVisualisation: !vS.showReferenceSurfaceVisualisation
          })
        }
      />
      <CheckboxHelper
        label="Show control points"
        checked={vS.showControlPoints}
        onChange={() => setViewSettings({ ...vS, showControlPoints: !vS.showControlPoints })}
      />
      <CheckboxHelper
        label="Show wireframe"
        checked={vS.showWireframe}
        onChange={() => setViewSettings({ ...vS, showWireframe: !vS.showWireframe })}
      />
    </section>
  );
};
