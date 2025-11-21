import { clsx } from 'clsx';

export default function Card({ children, className, title, actions, padding = true, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-soft border border-gray-200',
        className
      )}
      {...props}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={clsx(padding && 'p-6')}>{children}</div>
    </div>
  );
}
