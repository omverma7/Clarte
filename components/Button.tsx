
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed rounded-[6px]";
  
  const variants = {
    primary: "bg-[var(--accent-bg)] text-[var(--accent-text)] opacity-100 hover:opacity-90 active:scale-[0.98] custom-shadow",
    secondary: "bg-[var(--bg-sub)] text-[var(--text-primary)] border border-[var(--border-light)] hover:bg-[var(--border-light)] active:bg-[var(--border-medium)]",
    outline: "border border-[var(--border-medium)] text-[var(--text-primary)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-sub)] active:bg-[var(--bg-main)]",
    ghost: "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sub)] active:bg-[var(--border-light)]"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs tracking-wide",
    md: "px-5 py-2.5 text-sm tracking-wide",
    lg: "px-8 py-3.5 text-base tracking-wide"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
