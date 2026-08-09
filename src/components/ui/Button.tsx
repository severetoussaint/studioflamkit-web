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
      'border-accent bg-accent text-white shadow-xs hover:bg-accent-hover hover:-translate-y-[0.5px] active:translate-y-0 shadow-[0_2px_8px_rgba(219,96,33,0.22)]',
    secondary:
      'border-edge/60 bg-surface-elevated text-ink hover:border-accent/60 hover:text-accent hover:bg-surface hover:-translate-y-[0.5px]',
    ghost: 'border-transparent bg-transparent text-ink-muted hover:bg-surface-elevated hover:text-ink',
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
