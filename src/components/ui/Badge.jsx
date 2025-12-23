import { clsx } from 'clsx';

const variants = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-primary-100 text-primary-800',
  success: 'bg-success-100 text-success-800',
  warning: 'bg-warning-100 text-warning-800',
  error: 'bg-error-100 text-error-800',
  info: 'bg-info-100 text-info-800',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  startIcon,
  endIcon,
  ...props
}) {
  const domProps = { ...props };
  // Defensive: avoid forwarding non-DOM props if they slip in via spreads.
  delete domProps.startIcon;
  delete domProps.endIcon;

  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...domProps}
    >
      {startIcon ? <span className="mr-1 inline-flex items-center">{startIcon}</span> : null}
      {children}
      {endIcon ? <span className="ml-1 inline-flex items-center">{endIcon}</span> : null}
    </span>
  );
}
