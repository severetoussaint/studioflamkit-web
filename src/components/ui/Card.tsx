import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function Card({ children, className = '', title, description }: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-stone-800/80 bg-stone-950/70 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur ${className}`.trim()}
    >
      {title ? <h3 className="text-lg font-semibold text-white">{title}</h3> : null}
      {description ? <p className="mt-2 text-sm leading-6 text-stone-400">{description}</p> : null}
      {children ? <div className={title || description ? 'mt-5' : ''}>{children}</div> : null}
    </div>
  );
}

export default Card;
