/** Path + query from the app, or an already absolute URL. */
export const resolveFullShareUrl = (shareUrl: string): string => {
  if (!shareUrl) return '';
  if (shareUrl.startsWith('http://') || shareUrl.startsWith('https://')) return shareUrl;
  if (typeof window === 'undefined') return shareUrl;
  return `${window.location.origin}${shareUrl.startsWith('/') ? shareUrl : `/${shareUrl}`}`;
};
