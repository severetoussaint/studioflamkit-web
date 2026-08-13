'use client';

import React from 'react';
import { Download, ArrowDownToLine, Clock } from 'lucide-react';

export interface DeliverableItem {
  title: string;
  date: string;
  size: string;
  format: string;
}

export interface DeliverableItemRowProps {
  item: DeliverableItem;
  onDownload?: (item: DeliverableItem) => void;
}

export function DeliverableItemRow({ item, onDownload }: DeliverableItemRowProps) {
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border-edge/50 bg-surface-elevated p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-edge/50 bg-surface text-accent transition-colors duration-200 group-hover:border-accent/30 group-hover:bg-accent/10">
          <Download className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink group-hover:text-accent transition-colors duration-200">{item.title}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
            <span>{item.format}</span>
            <span>·</span>
            <span>{item.size}</span>
            <span>·</span>
            <span>{item.date}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {item.date !== 'Pendiente' ? (
          <button
            type="button"
            onClick={() => onDownload?.(item)}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-medium text-surface transition-all duration-200 ease-out hover:bg-accent-hover hover:-translate-y-0.5 active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <ArrowDownToLine className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
            <span>Descargar</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border-edge/50 bg-surface px-3 py-1 text-xs text-ink-muted">
            <Clock className="h-3.5 w-3.5 animate-pulse text-amber-500" />
            En proceso
          </span>
        )}
      </div>
    </div>
  );
}
