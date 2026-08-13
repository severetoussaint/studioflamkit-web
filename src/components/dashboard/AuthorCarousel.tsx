'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, CheckCircle2, Sparkles, Clock, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AuthorCarouselProps {
  onClose?: () => void;
  manuscriptTitle?: string;
}

const carouselSteps = [
  {
    step: 'Paso 1 de 3',
    title: 'Manuscrito Recibido & En Custodia',
    subtitle: 'Tu obra ha sido resguardada en nuestro servidor seguro de preservación editorial.',
    description: 'Hemos registrado la fecha y total de palabras. Tu archivo se encuentra en evaluación sin alterar el texto original.',
    icon: CheckCircle2,
    badge: 'Custodia Cifrada',
    imageSrc: '/images/author-center/author-center-01.webp',
    fallbackBg: 'from-amber-500/10 via-amber-500/5 to-transparent',
  },
  {
    step: 'Paso 2 de 3',
    title: 'Análisis Técnico & Tono Dramático',
    subtitle: 'Nuestros directores artísticos leen tu obra para planificar la locución y diseño sonoro.',
    description: 'Evaluamos el ritmo, requerimientos de voces y ambientación musical para elaborar tu propuesta personalizada en 24-48 horas.',
    icon: Clock,
    badge: 'Análisis en Cabina',
    imageSrc: '/images/author-center/author-center-02.webp',
    fallbackBg: 'from-accent/10 via-accent/5 to-transparent',
  },
  {
    step: 'Paso 3 de 3',
    title: 'Propuesta Técnica & Siguientes Pasos',
    subtitle: 'Recibirás el desglose completo con muestra de voces y presupuesto estimado.',
    description: 'En cuanto el equipo apruebe la estimación, podrás revisar la propuesta directamente desde este panel y autorizar el inicio de grabación.',
    icon: Compass,
    badge: 'Hoja de Ruta',
    imageSrc: '/images/author-center/author-center-03.webp',
    fallbackBg: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
  },
];

export function AuthorCarousel({ onClose, manuscriptTitle }: AuthorCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = carouselSteps[currentIndex];
  const StepIcon = current.icon;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === carouselSteps.length - 1;

  return (
    <div className="relative overflow-hidden rounded-3xl border-accent/20 bg-surface-elevated/95 p-6 sm:p-8 shadow-[0_16px_48px_rgba(242,107,46,0.06)] backdrop-blur-md">
      {/* Glow decorative background */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/8 blur-3xl" />
      
      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between gap-4 border-b border-edge/50 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Confirmación & Ruta Editorial
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {carouselSteps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-accent' : 'w-2 bg-edge hover:bg-ink-muted/30'
              }`}
              aria-label={`Ir al paso ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 mt-6 grid gap-6 lg:grid-cols-12 lg:items-center"
        >
          {/* Visual Frame (Image area with 3:2 ratio) */}
          <div className="relative overflow-hidden rounded-2xl border-edge/60 bg-surface lg:col-span-6 aspect-[3/2] flex items-center justify-center">
            <Image
              src={current.imageSrc}
              alt={current.title}
              fill
              className="object-cover transition-all duration-500 hover:scale-105"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Hide broken image gracefully and reveal stylized fallback card
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Fallback stylized artwork if image file is not yet dropped into repository */}
            <div className={`absolute inset-0 bg-gradient-to-br ${current.fallbackBg} p-6 flex flex-col justify-between`}>
              <div className="flex justify-between items-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border-edge/60 bg-surface/80 px-3 py-1 text-[10px] font-mono font-medium text-ink">
                  {current.badge}
                </span>
                <span className="font-serif text-3xl font-light text-accent/30">0{currentIndex + 1}</span>
              </div>
              <div>
                <p className="font-serif text-lg font-medium text-ink">{manuscriptTitle || 'Tu Obra'}</p>
                <p className="text-xs text-ink-muted mt-1">{current.step}</p>
              </div>
            </div>
          </div>

          {/* Text Details Area */}
          <div className="flex flex-col justify-between space-y-4 lg:col-span-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border-accent/20 bg-accent/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                <StepIcon className="h-3.5 w-3.5" />
                <span>{current.step}</span>
              </div>

              <h3 className="mt-3 font-serif text-2xl font-medium tracking-tight text-ink sm:text-3xl leading-snug">
                {current.title}
              </h3>

              <p className="mt-2 text-sm font-medium text-ink/90 leading-relaxed">
                {current.subtitle}
              </p>

              <p className="mt-2 text-xs font-light text-ink-muted leading-relaxed">
                {current.description}
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between border-t border-edge/40 pt-4 mt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-edge/60 bg-surface transition-all duration-200 active:scale-[0.95] ${
                    isFirst ? 'opacity-40 cursor-not-allowed' : 'hover:border-accent/30 hover:text-accent hover:-translate-x-0.5 cursor-pointer'
                  }`}
                  title="Paso anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-edge/60 bg-surface transition-all duration-200 active:scale-[0.95] ${
                    isLast ? 'opacity-40 cursor-not-allowed' : 'hover:border-accent/30 hover:text-accent hover:translate-x-0.5 cursor-pointer'
                  }`}
                  title="Siguiente paso"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <Button
                variant={isLast ? 'primary' : 'secondary'}
                className="px-5 py-2.5 text-xs font-medium uppercase tracking-wider rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
                onClick={onClose}
              >
                {isLast ? 'Ir a mi Panel Vivo' : 'Entendido, ver Panel'}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
