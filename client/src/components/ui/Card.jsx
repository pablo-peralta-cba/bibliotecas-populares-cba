export default function Card({
  imgSrc,
  imgAlt = '',
  title,
  subtitle,
  children,
  footer,
  className = '',
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow overflow-hidden ${className}`}
      {...props}
    >
      {imgSrc && (
        <img
          src={imgSrc}
          alt={imgAlt}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500 mb-2">{subtitle}</p>
        )}
        {children}
      </div>
      {footer && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}
