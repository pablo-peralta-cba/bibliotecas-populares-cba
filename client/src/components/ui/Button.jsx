import { forwardRef } from 'react';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
  secondary: 'bg-stone-600 text-white hover:bg-stone-700 focus:ring-stone-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  info: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500',
  outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    children,
    className = '',
    ...props
  },
  ref
) {
  return (
      <button
      ref={ref}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-xl
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-all duration-200
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
