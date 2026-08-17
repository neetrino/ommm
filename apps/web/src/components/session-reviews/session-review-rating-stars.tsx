const RATING_STAR_VALUES = [1, 2, 3, 4, 5] as const;

type SessionReviewRatingStarsProps = {
  rating: number;
  label: string;
  sizeClassName?: string;
};

export function SessionReviewRatingStars({
  rating,
  label,
  sizeClassName = "text-base",
}: SessionReviewRatingStarsProps) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={label}>
      {RATING_STAR_VALUES.map((value) => (
        <span
          key={value}
          aria-hidden
          className={
            value <= rating
              ? `${sizeClassName} leading-none text-amber-700`
              : `${sizeClassName} leading-none text-sage-300`
          }
        >
          ★
        </span>
      ))}
    </span>
  );
}
