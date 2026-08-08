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
      className={`rounded-3xl border-edge/50 bg-surface-elevated p-6 shadow-[0_12px_36px_rgba(0,0,0,0.22)] backdrop-blur transition-all duration-300 hover:border-edge-hover ${className}`.trim()}
    >
      {title ? <h3 className="text-lg font-semibold text-ink">{title}</h3> : null}
      {description ? <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p> : null}
      {children ? <div className={title || description ? 'mt-5' : ''}>{children}</div> : null}
    </div>
  );
}

export default Card;
