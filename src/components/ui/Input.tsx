import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
}

export function Input({ label, icon: Icon, className = '', ...props }: InputProps) {
  return (
    <label className="block w-full text-sm text-ink">
      {label ? <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-ink-muted">{label}</span> : null}
      <span className="relative block">
        {Icon ? <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" /> : null}
        <input
          className={`w-full rounded-full border-edge/60 bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-accent/70 focus:ring-2 focus:ring-accent/20 ${Icon ? 'pl-11' : ''} ${className}`.trim()}
          {...props}
        />
      </span>
    </label>
  );
}

export default Input;
