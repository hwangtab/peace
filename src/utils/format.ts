import { getLanguageCode } from './localization';

export const formatOrdinal = (value: number, language?: string): string => {
  const lang = getLanguageCode(language);
  if (lang !== 'en') {
    return String(value);
  }

  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${value}th`;
  }

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
};
