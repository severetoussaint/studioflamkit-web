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
      transition={{ duration: 0.25 }}
      className="relative overflow-hidden rounded-2xl border border-edge bg-surface-elevated p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
          <Icon className="h-5 w-5" />
        </div>

        {statusBadge && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
              statusBadge.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : statusBadge.type === 'warning'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                : 'border-edge bg-surface text-ink-muted'
            }`}
          >
            {statusBadge.text}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">{label}</p>
        <p className="mt-1 font-serif text-2xl font-semibold text-ink">{value}</p>
        {subtext && <p className="mt-1 text-xs text-ink-muted">{subtext}</p>}
      </div>
    </motion.div>
  );
}
