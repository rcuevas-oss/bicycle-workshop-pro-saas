import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon,
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] focus:ring-[var(--color-primary)]',
    secondary: 'bg-[var(--color-accent)] text-[var(--color-text-main)] hover:bg-[var(--color-accent-dark)] focus:ring-[var(--color-accent)]',
    danger: 'bg-[var(--color-danger)] text-white hover:opacity-90 focus:ring-[var(--color-danger)]',
    ghost: 'bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-bg-base)] hover:text-[var(--color-text-main)]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-[var(--radius-sm)] gap-1.5',
    md: 'text-sm px-4 py-2 rounded-[var(--radius-md)] gap-2',
    lg: 'text-base px-6 py-3 rounded-[var(--radius-md)] gap-2.5',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ 
        backgroundColor: variant === 'primary' ? 'var(--color-primary)' : 
                         variant === 'secondary' ? 'var(--color-accent)' : 
                         variant === 'danger' ? 'var(--color-danger)' : 'transparent',
        color: variant === 'secondary' ? 'var(--color-text-main)' : 
               variant === 'ghost' ? 'var(--color-text-muted)' : 'white'
      }}
      {...props}
    >
      {icon && <span className="icon">{icon}</span>}
      {children}
    </button>
  );
};
