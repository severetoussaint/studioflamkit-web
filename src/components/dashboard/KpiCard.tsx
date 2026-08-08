'use client';

import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  statusBadge?: {
    text: string;
    type?: 'success' | 'warning' | 'neutral';
  };
}

export function KpiCard({ icon: Icon, label, value, subtext, statusBadge }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-edge/60 bg-surface-elevated/90 p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.025)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-[0_12px_36px_rgba(0,0,0,0.04)]"
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/5 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/15 bg-accent/5 text-accent transition-transform duration-300 group-hover:scale-[1.02]">
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </div>

        {statusBadge && (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.16em] ${
              statusBadge.type === 'success'
                ? 'border-emerald-500/20 bg-emerald-500/8 text-emerald-800 dark:text-emerald-300'
                : statusBadge.type === 'warning'
                ? 'border-amber-500/20 bg-amber-500/8 text-amber-800 dark:text-amber-300'
                : 'border-edge/50 bg-surface/60 text-ink-muted'
            }`}
          >
            {statusBadge.text}
          </span>
        )}
      </div>

      <div className="relative mt-7">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-muted/75">{label}</p>
        <p className="mt-1.5 font-serif text-3xl font-normal leading-none tracking-tight text-ink sm:text-[2rem]">
          {value}
        </p>
        {subtext && (
          <p className="mt-2 text-xs leading-relaxed text-ink-muted/75 font-light">{subtext}</p>
        )}
      </div>
    </motion.div>
  );
}
