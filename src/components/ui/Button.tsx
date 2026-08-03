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
      'border border-amber-500/40 bg-amber-500/15 text-[#AAA188] shadow-[0_0_0_1px_rgba(251,191,36,0.2)] hover:bg-amber-500/25 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-100 dark:shadow-[0_0_0_1px_rgba(251,191,36,0.2)] dark:hover:bg-amber-500/25',
    secondary: 'border border-stone-700 bg-stone-900/80 text-stone-200 hover:border-stone-500 hover:bg-stone-800/90',
    ghost: 'border border-transparent bg-transparent text-stone-300 hover:bg-stone-900/70 hover:text-white',
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
