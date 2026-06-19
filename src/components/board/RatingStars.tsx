import { useTranslation } from 'next-i18next';

interface RatingStarsProps {
  value: number;
  max?: number;
  onSelect?: (value: number) => void;
}

export default function RatingStars({ value, max = 5, onSelect }: RatingStarsProps) {
  const { t } = useTranslation('board');
  const rounded = Math.round(value);

  if (onSelect) {
    return (
      <span role="radiogroup" aria-label={t('post.rating')} className="inline-flex gap-0.5 text-2xl text-golden-sun">
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={starValue === value}
              aria-label={t('post.ratingStar', { n: starValue })}
              onClick={() => onSelect(starValue)}
              className="transition-colors text-golden-sun hover:text-golden-sun disabled:opacity-50"
            >
              {starValue <= rounded ? '★' : '☆'}
            </button>
          );
        })}
      </span>
    );
  }

  return (
    <span
      aria-label={`${value}점 / ${max}점`}
      className="inline-flex gap-0.5 text-golden-sun"
    >
      {Array.from({ length: max }, (_, i) => (
        <span key={i} aria-hidden="true">
          {i < rounded ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}
