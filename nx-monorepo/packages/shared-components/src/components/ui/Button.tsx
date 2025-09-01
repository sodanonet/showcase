import { ReactNode, MouseEvent, useEffect, useRef, FC, CSSProperties } from 'react';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: CSSProperties;
}

const Spinner = () => {
  const spinnerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = spinnerRef.current;
    if (!element) return;
    
    let angle = 0;
    const animate = () => {
      angle += 3;
      element.style.transform = `rotate(${angle}deg)`;
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  return (
    <div
      ref={spinnerRef}
      style={{
        width: '16px',
        height: '16px',
        border: '2px solid transparent',
        borderTop: '2px solid currentColor',
        borderRadius: '50%',
      }}
    />
  );
};

const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  children,
  onClick,
  type = 'button',
  className = '',
  style,
}) => {
  const baseStyles = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    border: 'none',
    borderRadius: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    outline: 'none',
    position: 'relative' as const,
    opacity: disabled || loading ? 0.6 : 1,
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
    },
    secondary: {
      background: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
    },
    success: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    },
  };

  const sizes = {
    small: {
      padding: '0.5rem 0.75rem',
      fontSize: '0.875rem',
      minHeight: '32px',
    },
    medium: {
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      minHeight: '40px',
    },
    large: {
      padding: '1rem 1.5rem',
      fontSize: '1.125rem',
      minHeight: '48px',
    },
  };

  const buttonStyles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    ...style,
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      type={type}
      className={`shared-button ${className}`}
      style={buttonStyles}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading && <Spinner />}
      {!loading && icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;