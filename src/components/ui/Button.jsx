import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white',
  secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white',
  success: 'bg-success-500 hover:bg-success-600 text-white',
  warning: 'bg-warning-500 hover:bg-warning-600 text-white',
  error: 'bg-error-500 hover:bg-error-600 text-white',
  danger: 'bg-error-500 hover:bg-error-600 text-white',
  outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
  ghost: 'hover:bg-gray-100 text-gray-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  startIcon,
  endIcon,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && startIcon}
      {children}
      {endIcon}
    </button>
  );
}
