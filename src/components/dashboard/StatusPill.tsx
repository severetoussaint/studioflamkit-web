'use client';

import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export interface StatusPillProps {
  status: string;
}

export function StatusPill({ status }: StatusPillProps) {
  const isDone = status === 'Completado' || status === 'Pagado' || status === 'Aprobado';
  const isRevision = status === 'Revisiones';

  let style = 'border-edge bg-surface text-ink-muted';
  if (isDone) {
    style = 'border-accent/40 bg-accent/15 text-accent font-medium';
  } else if (isRevision) {
    style = 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${style}`}>
      {isDone ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />
      ) : (
        <Clock className="h-3.5 w-3.5 shrink-0" />
      )}
      {status}
    </span>
  );
}
