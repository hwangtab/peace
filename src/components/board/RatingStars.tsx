interface RatingStarsProps {
  value: number;
  max?: number;
}

export default function RatingStars({ value, max = 5 }: RatingStarsProps) {
  const rounded = Math.round(value);
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
