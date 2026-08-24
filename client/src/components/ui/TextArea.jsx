import { forwardRef } from 'react';

const TextArea = forwardRef(function TextArea(
  {
    label,
    error,
    rows = 3,
    id,
    className = '',
    ...props
  },
  ref
) {
  const textareaId = id || props.name;
  const borderColor = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : 'border-stone-300 focus:ring-primary focus:border-primary';

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`
          w-full px-4 py-2.5 border rounded-xl resize-y
          focus:outline-none focus:ring-2 focus:ring-offset-0
          transition-colors duration-200
          ${borderColor}
          ${error ? 'bg-red-50' : ''}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${textareaId}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default TextArea;
