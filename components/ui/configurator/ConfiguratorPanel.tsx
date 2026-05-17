'use client';

import { useId, useLayoutEffect, useMemo, useState } from 'react';

import { SegmentedSelect } from '../shared/SegmentedSelect';
import {
  CONFIGURATOR_SETTINGS_SECTION_IDS,
  CONFIGURATOR_SETTINGS_SECTION_LABELS,
  type ConfiguratorSettingsSectionId,
  SETTINGS_PANEL_OPEN_MIN_WIDTH_PX
} from './configurator-settings';
import { useCompactSettingsLayout } from './use-compact-settings-layout';

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

export type ConfiguratorSettingsSection = {
  id: ConfiguratorSettingsSectionId;
  content: React.ReactNode;
};

export const ConfiguratorPanel: React.FC<{
  sections: ConfiguratorSettingsSection[];
  shareUrl: string;
  onDownloadPdf?: () => void;
  pdfExporting?: boolean;
}> = ({ sections, shareUrl, onDownloadPdf, pdfExporting = false }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<ConfiguratorSettingsSectionId>('axis');
  const contentId = useId();
  const compact = useCompactSettingsLayout();

  const sectionOptions = useMemo(
    () =>
      CONFIGURATOR_SETTINGS_SECTION_IDS.map((id) => ({
        value: id,
        label: CONFIGURATOR_SETTINGS_SECTION_LABELS[id]
      })),
    []
  );

  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId) ?? sections[0],
    [sections, activeSectionId]
  );

  useLayoutEffect(() => {
    setOpen(window.innerWidth >= SETTINGS_PANEL_OPEN_MIN_WIDTH_PX);
  }, []);

  const onCopyUrl = async () => {
    if (!shareUrl) return;
    const fullUrl = shareUrl.startsWith('http') ? shareUrl : `${window.location.origin}${shareUrl}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this URL:', fullUrl);
    }
  };

  return (
    <div className={`configurator-panel-shell${open ? ' is-open' : ''}`}>
      <div className="configurator-panel-header">
        <button
          type="button"
          className="configurator-panel-pdf"
          onClick={onDownloadPdf}
          disabled={!onDownloadPdf || pdfExporting}
          title="Download PDF with top, front, and left views"
        >
          {pdfExporting ? 'PDF…' : 'PDF'}
        </button>
        <button
          type="button"
          className="configurator-panel-copy"
          onClick={onCopyUrl}
          disabled={!shareUrl}
          title={
            shareUrl
              ? shareUrl.startsWith('http')
                ? shareUrl
                : `${typeof window !== 'undefined' ? window.location.origin : ''}${shareUrl}`
              : 'URL not ready'
          }
        >
          {copied ? 'Copied' : 'Copy URL'}
        </button>
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
      </div>

      <div id={contentId} className="configurator-panel-body" aria-hidden={!open} inert={!open || undefined}>
        <div className="configurator-panel">
          <p className="configurator-panel-intro">
            Define an n × m control grid, drag vertices in Z, then Catmull‑Clark subdivide + Z‑only relaxation (naked
            edges fixed).
          </p>
          {compact ? (
            <>
              <SegmentedSelect
                aria-label="Settings section"
                options={sectionOptions}
                value={activeSectionId}
                onChange={setActiveSectionId}
              />
              <div className="configurator-panel-section-active" role="tabpanel">
                {activeSection?.content}
              </div>
            </>
          ) : (
            sections.map((section) => <div key={section.id}>{section.content}</div>)
          )}
        </div>
      </div>
    </div>
  );
};
