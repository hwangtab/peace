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
    // 선택값이 없으면(0) 첫 번째 별이 tabIndex 0을 가진다.
    const focusIndex = rounded > 0 ? rounded - 1 : 0;

    const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(starValue + 1, max);
        onSelect(next);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(starValue - 1, 1);
        onSelect(prev);
      }
    };

    return (
      <span
        role="radiogroup"
        aria-label={t('post.rating')}
        className="inline-flex gap-0.5 text-2xl text-golden-sun"
      >
        {Array.from({ length: max }, (_, i) => {
          const starValue = i + 1;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={starValue === rounded}
              aria-label={t('post.ratingStar', { n: starValue })}
              tabIndex={i === focusIndex ? 0 : -1}
              onClick={() => onSelect(starValue)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
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
    <span aria-label={`${value} / ${max}`} className="inline-flex gap-0.5 text-golden-sun">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} aria-hidden="true">
          {i < rounded ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}
