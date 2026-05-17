export const SETTINGS_PANEL_OPEN_MIN_WIDTH_PX = 800;

export const CONFIGURATOR_SETTINGS_SECTION_IDS = [
  'axis',
  'surface',
  'view',
  'points',
  'beam'
] as const;

export type ConfiguratorSettingsSectionId = (typeof CONFIGURATOR_SETTINGS_SECTION_IDS)[number];

export const CONFIGURATOR_SETTINGS_SECTION_LABELS: Record<ConfiguratorSettingsSectionId, string> = {
  axis: 'Axis',
  surface: 'Grid',
  view: 'View',
  points: 'Points',
  beam: 'Beam'
};
