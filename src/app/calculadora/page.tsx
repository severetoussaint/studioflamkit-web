"use client";

import React, { useMemo, useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { calculateChapterPrice, formatCurrency, getTierLabel } from '@/features/quotations/utils/calculator';

const TIER_REFERENCE = [
  { label: 'Entrada', words: '1,000 – 1,500', duration: '12 – 17 min', price: '$80 – $115' },
  { label: 'Intermedio', words: '~3,000', duration: '~20 min', price: '~$130' },
  { label: 'Completo', words: '~7,000', duration: '30 – 60 min', price: '$200 – $400' },
];

export default function CalculadoraPage() {
  const [wordCount, setWordCount] = useState(3000);

  const result = useMemo(() => calculateChapterPrice({ wordCount }), [wordCount]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_25%),linear-gradient(135deg,_#09090b_0%,_#111827_50%,_#030712_100%)] text-stone-100">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-400">Calculadora</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Calcula el precio de tu capítulo al instante.
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-300">
            Ingresa el número de palabras del capítulo y verás la duración estimada y el precio en tiempo real.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-stone-800/80 bg-stone-950/80">
            <div className="space-y-6">
              <Input
                label="Palabras del capítulo"
                type="number"
                min={0}
                value={wordCount}
                onChange={(event) => setWordCount(Number(event.target.value) || 0)}
              />
              <input
                type="range"
                min={200}
                max={10000}
                step={100}
                value={wordCount}
                onChange={(event) => setWordCount(Number(event.target.value))}
                className="w-full accent-amber-500"
              />

              <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Niveles de referencia</p>
                <div className="mt-3 space-y-2 text-sm text-stone-300">
                  {TIER_REFERENCE.map((tier) => (
                    <div key={tier.label} className="flex items-center justify-between rounded-full border border-stone-800 px-3 py-2">
                      <span>{tier.label}</span>
                      <span className="text-stone-500">{tier.words} palabras</span>
                      <span className="text-amber-300">{tier.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-amber-500/20 bg-gradient-to-br from-stone-950/90 to-stone-900/70">
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Precio estimado</p>
                <p className="mt-2 text-4xl font-semibold text-white">{formatCurrency(result.price)}</p>
                <p className="mt-2 text-sm text-stone-400">
                  Duración estimada: {result.durationMinutes} min · Nivel: {getTierLabel(result.tier)}
                </p>
              </div>

              <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4 text-sm leading-7 text-stone-400">
                <p>
                  Precio basado en una tarifa de producción de {formatCurrency(result.pfhRate)} por hora de audio terminado.
                  La duración final puede variar según el nivel de diseño sonoro requerido por la obra.
                </p>
              </div>

              <a href="/contacto" className="block">
                <Button variant="primary" className="w-full">
                  Hablar sobre este capítulo
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}