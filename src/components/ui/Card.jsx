import { clsx } from 'clsx';

export default function Card({ children, className, title, subtitle, actions, padding = true, ...props }) {
  const hasOverflowHidden = className?.includes('overflow-hidden');

  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-soft border border-gray-200',
        hasOverflowHidden && 'flex flex-col',
        className
      )}
      {...props}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={clsx(padding && 'p-6', hasOverflowHidden && 'flex-1 overflow-hidden')}>{children}</div>
    </div>
  );
}
