import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    valid,
    id,
    type = 'text',
    className = '',
    ...props
  },
  ref
) {
  const inputId = id || props.name;
  const borderColor = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : valid
    ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-offset-0
          transition-colors duration-200
          ${borderColor}
          ${error ? 'bg-red-50' : ''}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
      {valid && typeof valid === 'string' && (
        <p className="mt-1 text-sm text-green-600">{valid}</p>
      )}
    </div>
  );
});

export default Input;
