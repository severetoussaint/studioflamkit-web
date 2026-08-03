import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      'border border-accent/30 bg-accent/10 text-accent shadow-[0_0_0_1px_rgba(150,114,61,0.15)] hover:bg-accent/20',
    secondary:
      'border border-edge bg-surface-elevated text-ink hover:border-accent hover:text-accent',
    ghost: 'border border-transparent bg-transparent text-ink-muted hover:bg-surface-elevated hover:text-ink',
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium tracking-[0.2em] uppercase transition-all duration-200 ease-out ${variants[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
