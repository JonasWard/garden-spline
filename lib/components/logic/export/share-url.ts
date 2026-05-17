import { BASE_PATH } from '@/lib/base-path';

/** Path + query from the app, or an already absolute URL. */
export const resolveFullShareUrl = (shareUrl: string): string => {
  if (!shareUrl) return '';
  if (shareUrl.startsWith('http://') || shareUrl.startsWith('https://')) return shareUrl;
  if (typeof window === 'undefined') return shareUrl;

  const path = shareUrl.startsWith('/') ? shareUrl : `/${shareUrl}`;
  const withBase = path.startsWith(BASE_PATH) ? path : `${BASE_PATH}${path}`;
  return `${window.location.origin}${withBase}`;
};
