const typeStyles = {
  success: 'bg-green-100 border-green-400 text-green-700',
  danger: 'bg-red-100 border-red-400 text-red-700',
  warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
  info: 'bg-blue-100 border-blue-400 text-blue-700',
};

export default function Alert({
  type = 'info',
  dismissible = false,
  onClose,
  children,
  className = '',
  ...props
}) {
  return (
    <div
      className={`border px-4 py-3 rounded relative ${typeStyles[type] || typeStyles.info} ${className}`}
      role="alert"
      {...props}
    >
      <span className="block sm:inline">{children}</span>
      {dismissible && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-0 bottom-0 right-0 px-4 py-3 font-bold opacity-70 hover:opacity-100"
          aria-label="Dismiss alert"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
