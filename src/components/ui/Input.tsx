import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <label className="block w-full text-sm text-ink">
      {label ? <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-ink-muted">{label}</span> : null}
      <input
        className={`w-full rounded-full border border-edge bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-accent/70 focus:ring-2 focus:ring-accent/20 ${className}`.trim()}
        {...props}
      />
    </label>
  );
}

export default Input;
