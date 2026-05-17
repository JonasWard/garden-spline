import type { OrthographicViewCaptures } from './capture-orthographic-views';
import { formatMeters, type StructureDimensions } from './structure-dimensions';
import type { SettingsTableRow } from './format-settings-table';

export type ConfiguratorPdfInput = {
  views: OrthographicViewCaptures;
  dimensions: StructureDimensions;
  beamCount: number;
  settingsRows: SettingsTableRow[];
};

const PDF_FILE = 'grid-shell-config.pdf';

export const downloadConfiguratorPdf = async (input: ConfiguratorPdfInput): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const { views, dimensions, beamCount, settingsRows } = input;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = margin;

  doc.setFontSize(16);
  doc.text('Grid shell configuration', margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.text(`Generated ${new Date().toLocaleString()}`, margin, y);
  y += 8;

  const viewsSpec: { id: keyof OrthographicViewCaptures; title: string; dims: string }[] = [
    {
      id: 'top',
      title: 'Top',
      dims: `W ${formatMeters(dimensions.width)} · D ${formatMeters(dimensions.depth)}`
    },
    {
      id: 'front',
      title: 'Front',
      dims: `W ${formatMeters(dimensions.width)} · H ${formatMeters(dimensions.height)}`
    },
    {
      id: 'left',
      title: 'Left',
      dims: `D ${formatMeters(dimensions.depth)} · H ${formatMeters(dimensions.height)}`
    }
  ];

  const gap = 4;
  const colW = (pageW - margin * 2 - gap * 2) / 3;
  const imgH = 48;
  const rowTop = y;

  for (let i = 0; i < viewsSpec.length; i++) {
    const { id, title, dims } = viewsSpec[i]!;
    const x = margin + i * (colW + gap);
    doc.setFontSize(9);
    doc.text(title, x, rowTop);
    doc.addImage(views[id], 'PNG', x, rowTop + 3, colW, imgH);
    doc.setFontSize(7);
    doc.text(dims, x, rowTop + 3 + imgH + 4, { maxWidth: colW });
  }

  y = rowTop + 3 + imgH + 14;

  doc.setFontSize(11);
  doc.text('Summary', margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.text(`Beam count: ${beamCount}`, margin, y);
  y += 5;
  doc.text(
    `Overall (boundary): ${formatMeters(dimensions.width)} × ${formatMeters(dimensions.depth)} × ${formatMeters(dimensions.height)} (W × D × H)`,
    margin,
    y
  );
  y += 10;

  doc.setFontSize(11);
  doc.text('Parameters & settings', margin, y);
  y += 6;

  const colLabelW = 62;
  const colValueW = pageW - margin * 2 - colLabelW;
  const rowH = 5.5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Parameter', margin, y);
  doc.text('Value', margin + colLabelW, y);
  y += rowH;
  doc.setFont('helvetica', 'normal');

  for (const row of settingsRows) {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    const lines = doc.splitTextToSize(row.value, colValueW);
    doc.text(row.label, margin, y);
    doc.text(lines, margin + colLabelW, y);
    y += rowH * Math.max(1, lines.length);
  }

  doc.save(PDF_FILE);
};
