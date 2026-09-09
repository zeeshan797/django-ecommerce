import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export function RatingStars({
  rating,
  maxStars = 5,
  size = 'md',
  showCount = false,
  count,
  interactive = false,
  onRatingChange,
  className = '',
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const currentRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center text-amber-400">
        {[...Array(maxStars)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= currentRating;
          const isHalf = !isFilled && starValue - 0.5 <= currentRating;

          return (
            <button
              key={index}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform p-0.5' : 'cursor-default'}`}
              aria-label={`${starValue} Stars`}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'text-gray-200 fill-gray-100'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showCount && (
        <span className="text-xs font-semibold text-gray-700">
          {rating.toFixed(1)} {count !== undefined && <span className="text-gray-400 font-normal">({count})</span>}
        </span>
      )}
    </div>
  );
}
