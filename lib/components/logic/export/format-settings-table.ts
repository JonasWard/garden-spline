import type { ConfiguratorState } from '@/components/ui/state-string/densing-state';

export type SettingsTableRow = { label: string; value: string };

const yesNo = (v: boolean) => (v ? 'Yes' : 'No');

export const formatConfiguratorSettingsRows = (state: ConfiguratorState): SettingsTableRow[] => {
  const { axisType, referenceSurfaceBase: rs, beam, viewSettings: vs } = state;
  const rows: SettingsTableRow[] = [
    { label: 'Axis pattern', value: axisType.type },
    { label: 'Global size', value: String(axisType.globalSize) }
  ];

  if ('relativeSize' in axisType) {
    rows.push({ label: 'Relative size', value: String(axisType.relativeSize) });
  }

  rows.push(
    { label: 'Grid n × m', value: `${rs.n} × ${rs.m}` },
    { label: 'Spacing dX', value: `${rs.dX} m` },
    { label: 'Spacing dY', value: `${rs.dY} m` },
    { label: 'Beam type', value: beam.type },
    { label: 'Beam width', value: `${beam.width} m` },
    { label: 'Beam height', value: `${beam.height} m` }
  );

  if (beam.type === 'stack') {
    rows.push(
      { label: 'Stack count', value: String(beam.count) },
      { label: 'Stack up from surface', value: yesNo(beam.up) }
    );
  }

  rows.push(
    { label: 'Show axis', value: yesNo(vs.showAxis) },
    { label: 'Show axis 3D', value: yesNo(vs.showAxis3d) },
    { label: 'Show beam', value: yesNo(vs.showBeam) },
    { label: 'Show reference surface', value: yesNo(vs.showReferenceSurfaceVisualisation) },
    { label: 'Show divided face edges', value: yesNo(vs.showDividedFaceEdges) },
    { label: 'Show wireframe', value: yesNo(vs.showWireframe) },
    { label: 'Show bottom plane', value: yesNo(vs.showBottomPlane) }
  );

  return rows;
};
