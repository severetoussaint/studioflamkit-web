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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-edge/80 bg-surface-elevated/90 p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:border-edge"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/8 text-accent">
          <Icon className="h-5 w-5" />
        </div>

        {statusBadge && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] border ${
              statusBadge.type === 'success'
                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                : statusBadge.type === 'warning'
                ? 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                : 'border-edge/60 bg-surface/70 text-ink-muted'
            }`}
          >
            {statusBadge.text}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted/80">{label}</p>
        <p className="mt-1 font-serif text-2xl font-normal tracking-tight text-ink">{value}</p>
        {subtext && <p className="mt-1 text-xs text-ink-muted/80 font-light">{subtext}</p>}
      </div>
    </motion.div>
  );
}
