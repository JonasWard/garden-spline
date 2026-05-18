import { CheckboxHelper } from '../shared/CheckboxHelper';

export type ViewSettings = {
  showAxis: boolean;
  showAxis3d: boolean;
  showBeam: boolean;
  showReferenceSurfaceVisualisation: boolean;
  showDividedFaceEdges: boolean;
  showWireframe: boolean;
  /** Full-opacity ground plane; when false the plane stays at 25% opacity. */
  showBottomPlane: boolean;
};

export const DEFAULT_VIEW_SETTINGS: ViewSettings = {
  showAxis: false,
  showAxis3d: false,
  showBeam: true,
  showReferenceSurfaceVisualisation: false,
  showDividedFaceEdges: true,
  showWireframe: false,
  showBottomPlane: true
};

type ViewSettingsUIProps = {
  viewSettings: ViewSettings;
  setViewSettings: (viewSettings: ViewSettings) => void;
};

export const ViewSettingsUI = ({ viewSettings: vS, setViewSettings }: ViewSettingsUIProps) => {
  return (
    <section className="configurator-panel section" aria-label="Axis pattern settings">
      <header className="configurator-panel-content-header">
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
        label="Show divided face edges"
        checked={vS.showDividedFaceEdges}
        onChange={() => setViewSettings({ ...vS, showDividedFaceEdges: !vS.showDividedFaceEdges })}
      />
      <CheckboxHelper
        label="Show wireframe"
        checked={vS.showWireframe}
        onChange={() => setViewSettings({ ...vS, showWireframe: !vS.showWireframe })}
      />
      <CheckboxHelper
        label="Show bottom plane"
        checked={vS.showBottomPlane}
        onChange={() => setViewSettings({ ...vS, showBottomPlane: !vS.showBottomPlane })}
      />
    </section>
  );
};
