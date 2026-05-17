import QRCode from 'qrcode';

/** PNG data URL for embedding in jsPDF (`addImage`). */
export const generateShareQrDataUrl = async (url: string): Promise<string | null> => {
  if (!url) return null;
  try {
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: { dark: '#1a1a1a', light: '#ffffff' }
    });
  } catch {
    return null;
  }
};
