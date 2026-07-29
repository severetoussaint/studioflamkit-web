import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <label className="block w-full text-sm text-stone-300">
      {label ? <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">{label}</span> : null}
      <input
        className={`w-full rounded-full border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 ${className}`.trim()}
        {...props}
      />
    </label>
  );
}

export default Input;
