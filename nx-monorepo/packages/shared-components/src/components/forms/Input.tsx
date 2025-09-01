import { useState, forwardRef, InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'filled' | 'outlined';
  required?: boolean;
  loading?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  size = 'medium',
  variant = 'default',
  required = false,
  loading = false,
  className = '',
  style,
  disabled,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);

  const containerStyles = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    width: '100%',
  };

  const labelStyles = {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: error ? '#dc2626' : '#374151',
    marginBottom: '0.25rem',
  };

  const inputWrapperStyles = {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
  };

  const baseInputStyles = {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: size === 'small' ? '0.875rem' : size === 'large' ? '1.125rem' : '1rem',
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent',
    color: '#374151',
  };

  const sizes = {
    small: {
      padding: leftIcon || rightIcon ? '0.5rem 0.75rem' : '0.5rem 0.75rem',
      minHeight: '36px',
    },
    medium: {
      padding: leftIcon || rightIcon ? '0.75rem 1rem' : '0.75rem 1rem',
      minHeight: '44px',
    },
    large: {
      padding: leftIcon || rightIcon ? '1rem 1.25rem' : '1rem 1.25rem',
      minHeight: '52px',
    },
  };

  const variants = {
    default: {
      background: 'white',
      border: `2px solid ${error ? '#fca5a5' : focused ? '#667eea' : '#e5e7eb'}`,
      borderRadius: '8px',
    },
    filled: {
      background: error ? '#fef2f2' : focused ? '#f8fafc' : '#f9fafb',
      border: `2px solid ${error ? '#fca5a5' : focused ? '#667eea' : 'transparent'}`,
      borderRadius: '8px',
    },
    outlined: {
      background: 'transparent',
      border: `2px solid ${error ? '#fca5a5' : focused ? '#667eea' : '#d1d5db'}`,
      borderRadius: '8px',
    },
  };

  const containerInputStyles = {
    ...variants[variant],
    ...sizes[size],
    display: 'flex',
    alignItems: 'center',
    paddingLeft: leftIcon ? '2.5rem' : sizes[size].padding.split(' ')[3] || sizes[size].padding.split(' ')[1],
    paddingRight: rightIcon || loading ? '2.5rem' : sizes[size].padding.split(' ')[1],
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const iconStyles = {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    color: error ? '#dc2626' : focused ? '#667eea' : '#9ca3af',
    fontSize: '1.125rem',
    pointerEvents: 'none' as const,
  };

  const leftIconStyles = {
    ...iconStyles,
    left: '0.75rem',
  };

  const rightIconStyles = {
    ...iconStyles,
    right: '0.75rem',
  };

  const helperTextStyles = {
    fontSize: '0.75rem',
    color: error ? '#dc2626' : '#6b7280',
    margin: '0',
  };

  const loadingSpinnerStyles = {
    ...rightIconStyles,
    width: '16px',
    height: '16px',
    border: '2px solid #e5e7eb',
    borderTop: '2px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <div style={containerStyles}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={{ color: '#dc2626', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      
      <div style={inputWrapperStyles}>
        <div style={containerInputStyles}>
          {leftIcon && <span style={leftIconStyles}>{leftIcon}</span>}
          
          <input
            ref={ref}
            style={baseInputStyles}
            className={`shared-input ${className}`}
            disabled={disabled || loading}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {loading && (
            <div style={loadingSpinnerStyles} />
          )}
          
          {!loading && rightIcon && (
            <span style={rightIconStyles}>{rightIcon}</span>
          )}
        </div>
      </div>
      
      {(error || helperText) && (
        <p style={helperTextStyles}>
          {error || helperText}
        </p>
      )}
      
    </div>
  );
});

Input.displayName = 'Input';

export default Input;