'use client';

import React from 'react';

export interface EmptyStateCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: React.ElementType;
  onAction?: () => void;
  iconClassName?: string;
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  iconClassName = 'text-ink-muted',
}: EmptyStateCardProps) {
  return (
    <div className="mt-8 rounded-2xl border-dashed border-edge/50 bg-surface p-8 text-center">
      <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated border-edge/50 ${iconClassName}`}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-3 font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-medium text-surface transition hover:bg-accent-hover cursor-pointer"
        >
          {ActionIcon && <ActionIcon className="h-4 w-4" />}
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
