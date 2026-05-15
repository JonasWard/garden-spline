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

const CheckboxHelper: React.FC<{ checked: boolean; onChange: () => void, label: string }> = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2">
    <input type="checkbox" checked={checked} onChange={onChange} />
    {label}
  </label>
);

export const ViewSettingsUI = ({ viewSettings, setViewSettings }: ViewSettingsUIProps) => {
  return (
    <section className="configurator-panel section" aria-label="Axis pattern settings">
      <header className="space-y-1">
        <h2 className="text-base font-semibold text-white/90">View Settings</h2>
      </header>
      <CheckboxHelper
        checked={viewSettings.showAxis}
        onChange={() => setViewSettings({ ...viewSettings, showAxis: !viewSettings.showAxis })}
        label="Show axis"
      />
      <CheckboxHelper
        checked={viewSettings.showAxis3d}
        onChange={() => setViewSettings({ ...viewSettings, showAxis3d: !viewSettings.showAxis3d })}
        label="Show axis 3D"
      />
      <CheckboxHelper
        checked={viewSettings.showBeam}
        onChange={() => setViewSettings({ ...viewSettings, showBeam: !viewSettings.showBeam })}
        label="Show beam"
      />
      <CheckboxHelper
        checked={viewSettings.showReferenceSurfaceVisualisation}
        onChange={() =>
          setViewSettings({
            ...viewSettings,
            showReferenceSurfaceVisualisation: !viewSettings.showReferenceSurfaceVisualisation
          })
        }
        label="Show reference surface visualisation"
      />
      <CheckboxHelper
        checked={viewSettings.showControlPoints}
        onChange={() => setViewSettings({ ...viewSettings, showControlPoints: !viewSettings.showControlPoints })}
        label="Show control points"
      />
      <CheckboxHelper
        checked={viewSettings.showWireframe}
        onChange={() => setViewSettings({ ...viewSettings, showWireframe: !viewSettings.showWireframe })}
        label="Show wireframe"
      />
    </section>
  );
};
