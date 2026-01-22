/**
 * Instagram URL에서 사용자명 추출
 * @param url Instagram URL (예: https://instagram.com/username/)
 * @returns 추출된 사용자명 또는 원본 URL
 */
export const extractInstagramUsername = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.replace(/^\/|\/$/g, '').split('/')[0] || url;
  } catch {
    const parts = url.split('instagram.com/');
    if (parts.length < 2) return url;
    return parts[1]?.split(/[?/]/)[0] || url;
  }
};
