'use client';

import { useLayoutEffect, useState } from 'react';

import { SETTINGS_PANEL_OPEN_MIN_WIDTH_PX } from './configurator-settings';

/** True below {@link SETTINGS_PANEL_OPEN_MIN_WIDTH_PX} (mobile / narrow layout). */
export const useCompactSettingsLayout = () => {
  const [compact, setCompact] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia(`(max-width: ${SETTINGS_PANEL_OPEN_MIN_WIDTH_PX - 1}px)`);
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return compact;
};
