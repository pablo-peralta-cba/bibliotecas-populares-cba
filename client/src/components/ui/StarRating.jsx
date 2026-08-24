import { useState, useCallback } from 'react';

function StarIcon({ filled, className = '' }) {
  return (
    <svg
      className={`w-6 h-6 ${filled ? 'text-yellow-400' : 'text-gray-300'} ${className}`}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export default function StarRating({
  value = 0,
  onChange,
  readonly = false,
  className = '',
  ...props
}) {
  const [hoverValue, setHoverValue] = useState(null);

  const handleMouseEnter = useCallback(
    (index) => {
      if (!readonly) {
        setHoverValue(index);
      }
    },
    [readonly]
  );

  const handleMouseLeave = useCallback(() => {
    if (!readonly) {
      setHoverValue(null);
    }
  }, [readonly]);

  const handleClick = useCallback(
    (index) => {
      if (!readonly && onChange) {
        onChange(index);
      }
    },
    [readonly, onChange]
  );

  const handleKeyDown = useCallback(
    (e, index) => {
      if (readonly) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(index);
      } else if (e.key === 'ArrowRight' && index < 5) {
        e.preventDefault();
        handleClick(index + 1);
      } else if (e.key === 'ArrowLeft' && index > 1) {
        e.preventDefault();
        handleClick(index - 1);
      }
    },
    [readonly, handleClick]
  );

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      role="radiogroup"
      aria-label="Star rating"
      {...props}
    >
      {[1, 2, 3, 4, 5].map((index) => (
        <button
          key={index}
          type="button"
          role="radio"
          aria-checked={index === value}
          aria-label={`${index} star${index !== 1 ? 's' : ''}`}
          tabIndex={readonly ? -1 : 0}
          className={`p-0 border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary rounded ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
          }`}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          disabled={readonly}
        >
          <StarIcon filled={index <= displayValue} />
        </button>
      ))}
    </div>
  );
}
