import { ReactNode, CSSProperties, MouseEvent, FC } from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  className?: string;
  style?: CSSProperties;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  hoverable?: boolean;
}

const Card: FC<CardProps> = ({
  title,
  subtitle,
  children,
  headerAction,
  footer,
  variant = 'default',
  padding = 'medium',
  className = '',
  style,
  onClick,
  hoverable = false,
}) => {
  const baseStyles = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    cursor: onClick ? 'pointer' : 'default',
  };

  const variants = {
    default: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    elevated: {
      background: 'white',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(0, 0, 0, 0.05)',
    },
    outlined: {
      background: 'transparent',
      border: '1px solid #e5e7eb',
    },
  };

  const paddings = {
    none: { padding: '0' },
    small: { padding: '1rem' },
    medium: { padding: '1.5rem' },
    large: { padding: '2rem' },
  };

  const hoverStyles = hoverable || onClick ? {
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: variant === 'elevated' 
        ? '0 8px 24px rgba(0, 0, 0, 0.15)' 
        : '0 4px 16px rgba(0, 0, 0, 0.1)',
    }
  } : {};

  const cardStyles = {
    ...baseStyles,
    ...variants[variant],
    ...paddings[padding],
    ...style,
  };

  const headerStyles = {
    marginBottom: children ? '1rem' : '0',
    paddingBottom: children ? '1rem' : '0',
    borderBottom: children ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
  };

  const titleStyles = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 0.25rem 0',
  };

  const subtitleStyles = {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0',
  };

  const footerStyles = {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(0, 0, 0, 0.1)',
  };

  const contentStyles = {
    color: '#374151',
    lineHeight: '1.6',
  };

  return (
    <div
      className={`shared-card ${className}`}
      style={cardStyles}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          Object.assign(e.currentTarget.style, {
            transform: 'translateY(-2px)',
            boxShadow: variant === 'elevated' 
              ? '0 8px 24px rgba(0, 0, 0, 0.15)' 
              : '0 4px 16px rgba(0, 0, 0, 0.1)',
          });
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          Object.assign(e.currentTarget.style, {
            transform: 'translateY(0)',
            boxShadow: (variants[variant] as any).boxShadow || 'none',
          });
        }
      }}
    >
      {(title || subtitle || headerAction) && (
        <div style={headerStyles}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              {title && <h3 style={titleStyles}>{title}</h3>}
              {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </div>
      )}
      
      {children && (
        <div style={contentStyles}>
          {children}
        </div>
      )}
      
      {footer && (
        <div style={footerStyles}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;