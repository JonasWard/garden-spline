'use client';

import { useId, useState } from 'react';

import './configurator-panel.css';

const SettingsCog = () => (
  <svg
    className="configurator-panel-cog"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
    />
  </svg>
);

export const ConfiguratorPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(true);
  const contentId = useId();

  return (
    <div className={`configurator-panel-shell${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="configurator-panel-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={contentId}
        aria-label={open ? 'Close settings' : 'Open settings'}
      >
        {open ? <span className="configurator-panel-toggle__title">Simple grid shell</span> : null}
        <SettingsCog />
      </button>

      <div id={contentId} className="configurator-panel-body" aria-hidden={!open} inert={!open || undefined}>
        <div className="configurator-panel">
          <p className="configurator-panel-intro">
            Define an n × m control grid, drag vertices in Z, then Catmull‑Clark subdivide + Z‑only relaxation (naked
            edges fixed).
          </p>
          {children}
        </div>
      </div>
    </div>
  );
};
