'use client';

import './zoom-to-extents-button.css';

const FitExtentsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6v6H9z" />
  </svg>
);

export type ZoomToExtentsButtonProps = {
  onClick: () => void;
};

export const ZoomToExtentsButton: React.FC<ZoomToExtentsButtonProps> = ({ onClick }) => (
  <button
    type="button"
    className="zoom-to-extents-btn"
    onClick={onClick}
    title="Zoom to extents"
    aria-label="Zoom to extents"
  >
    <FitExtentsIcon />
  </button>
);
