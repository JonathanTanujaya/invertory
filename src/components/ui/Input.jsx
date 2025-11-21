import { clsx } from 'clsx';
import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  startIcon,
  endIcon,
  className,
  containerClassName,
  ...props
}, ref) => {
  return (
    <div className={clsx('w-full', containerClassName)}>
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {startIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={clsx(
            'w-full px-3 py-2 border rounded-md transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error ? 'border-error-500' : 'border-gray-300',
            startIcon && 'pl-10',
            endIcon && 'pr-10',
            className
          )}
          {...props}
        />
        
        {endIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {endIcon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={clsx(
          'mt-1 text-sm',
          error ? 'text-error-500' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
