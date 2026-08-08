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
  const badgeClasses =
    statusBadge?.type === 'success'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
      : statusBadge?.type === 'warning'
      ? 'border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300'
      : 'border-edge/55 bg-surface/65 text-ink-muted';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-3xl border-edge/50 bg-surface-elevated/95 p-5 sm:p-6 shadow-[0_10px_34px_rgba(0,0,0,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_16px_44px_rgba(0,0,0,0.28)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(219,96,33,0.08),transparent_40%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-premium/20 bg-premium-soft text-premium shadow-2xs transition-transform duration-300 group-hover:scale-[1.02]">
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </div>

        {statusBadge && (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] ${badgeClasses}`}>
            {statusBadge.text}
          </span>
        )}
      </div>

      <div className="relative z-10 mt-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-muted/75">
          {label}
        </p>
        <p className="mt-1.5 font-serif text-[2rem] font-normal leading-none tracking-tight text-ink sm:text-[2.15rem]">
          {value}
        </p>
        {subtext && (
          <p className="mt-2 max-w-[18rem] text-xs leading-relaxed text-ink-muted/78 font-light">
            {subtext}
          </p>
        )}
      </div>
    </motion.div>
  );
}
