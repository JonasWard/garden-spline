import './configurator-panel.css';

export const ConfiguratorPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute left-4 top-4 md:left-6 md:top-6 w-[360px] max-h-[90svh] overflow-y-auto max-w-[92vw] bg-[#1a1a1a]/90 backdrop-blur border-2 border-[#fbf0df] rounded-2xl p-5 text-left">
    <div className="configurator-panel">
      <div>
        <h1 className="text-2xl font-bold leading-tight">Simple grid shell</h1>
        <p className="text-sm text-white/70 mt-1">
          Define an n × m control grid, drag vertices in Z, then Catmull‑Clark subdivide + Z‑only relaxation (naked
          edges fixed).
        </p>
      </div>
      {children}
    </div>
  </div>
);
