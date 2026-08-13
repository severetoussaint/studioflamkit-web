'use client';

import React from 'react';
import { motion } from 'motion/react';
import { FileAudio, Wallet, Play } from 'lucide-react';
import { StatusPill } from './StatusPill';

export interface ChapterItemData {
  id: string;
  number?: number;
  title: string;
  progress: number;
  revisions: number;
  maxRevisions: number;
  status: string;
  paymentStatus: 'Pagado' | 'Pendiente' | 'Procesando';
  price: number;
  words: string;
  duration: string;
}

export interface ChapterCardProps {
  chapter: ChapterItemData;
  index: number;
  onSelectChapter: (chapter: any) => void;
}

export function ChapterCard({ chapter, index, onSelectChapter }: ChapterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2, ease: 'easeOut' } }}
      onClick={() => onSelectChapter(chapter)}
      className="group rounded-2xl border-edge/50 bg-surface-elevated p-5 transition-colors hover:border-accent/40 hover:shadow-md cursor-pointer"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-edge/50 bg-surface text-accent group-hover:border-accent/30 group-hover:bg-accent/10">
            <FileAudio className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-accent">#0{index + 1}</span>
              <p className="text-base font-semibold text-ink group-hover:text-accent transition-colors">{chapter.title}</p>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              {chapter.words} · Duración estimada: {chapter.duration}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
          <StatusPill status={chapter.status} />

          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
            chapter.paymentStatus === 'Pagado'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}>
            <Wallet className="h-3 w-3" />
            {chapter.paymentStatus === 'Pagado' ? 'Pagado' : `$${chapter.price}.00 Pend.`}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectChapter(chapter);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border-edge/50 bg-surface px-3 py-1.5 text-xs font-medium text-ink transition hover:border-accent/40 hover:text-accent cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 text-accent" />
            <span>Abrir Panel</span>
          </button>
        </div>
      </div>

      {/* Barra de progreso del capítulo */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink-muted">Avance de producción</span>
          <span className="font-semibold text-ink">{chapter.progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface border-edge/40">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${chapter.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-edge/40 pt-3 text-xs text-ink-muted">
        <span>Cupo pactado: {chapter.maxRevisions} revisiones</span>
        <span className="font-medium text-ink">
          {chapter.revisions} de {chapter.maxRevisions} revisiones utilizadas
        </span>
      </div>
    </motion.div>
  );
}
