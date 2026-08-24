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
      className={`bg-white rounded-xl border border-stone-100 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden ${className}`}
      {...props}
    >
      {imgSrc && (
        <img
          src={imgSrc}
          alt={imgAlt}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-5">
        {title && (
          <h3 className="text-lg font-semibold text-stone-900 mb-1">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-stone-500 mb-3">{subtitle}</p>
        )}
        {children}
      </div>
      {footer && (
        <div className="px-5 py-4 bg-surface-light border-t border-stone-100">
          {footer}
        </div>
      )}
    </div>
  );
}
