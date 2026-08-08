"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { calculateChapterPrice, formatCurrency, getTierLabel } from '@/features/quotations/utils/calculator';
import { routes } from '@/config/routes';

const TIER_REFERENCE = [
  { label: 'Entrada', words: '1,000 – 1,500', duration: '12 – 17 min', price: '$80 – $115' },
  { label: 'Intermedio', words: '~3,000', duration: '~20 min', price: '~$130' },
  { label: 'Completo', words: '~7,000', duration: '30 – 60 min', price: '$200 – $400' },
];

export default function CalculadoraPage() {
  const [wordCount, setWordCount] = useState(3000);

  const result = useMemo(() => calculateChapterPrice({ wordCount }), [wordCount]);

  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar />

      <section className="relative overflow-hidden border-b border-edge/50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,_var(--color-accent)_0%,_transparent_28%)] opacity-[0.10]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">Calculadora</p>
            <h1 className="mt-4 font-serif text-4xl font-medium text-ink sm:text-5xl lg:text-6xl">
              Calcula el precio de tu capítulo al instante.
            </h1>
            <p className="mt-6 text-lg leading-8 text-ink-muted">
              Ingresa el número de palabras del capítulo y verás la duración estimada y el precio en tiempo real.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card>
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
                  className="w-full accent-accent"
                />

                <div className="rounded-2xl border border-edge/50 bg-surface p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-ink-muted">Niveles de referencia</p>
                  <div className="mt-3 space-y-2 text-sm text-ink-muted">
                    {TIER_REFERENCE.map((tier) => (
                      <div key={tier.label} className="flex items-center justify-between rounded-full border border-edge/50 px-3 py-2">
                        <span className="text-ink">{tier.label}</span>
                        <span>{tier.words} palabras</span>
                        <span className="text-accent">{tier.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-accent/20">
              <div className="space-y-4">
                <div className="rounded-2xl border border-edge/50 bg-surface p-4">
                  <p className="text-xs uppercase tracking-[0.32em] text-ink-muted">Precio estimado</p>
                  <p className="mt-2 text-4xl font-semibold text-ink">{formatCurrency(result.price)}</p>
                  <p className="mt-2 text-sm text-ink-muted">
                    Duración estimada: {result.durationMinutes} min · Nivel: {getTierLabel(result.tier)}
                  </p>
                </div>

                <div className="rounded-2xl border border-edge/50 bg-surface p-4 text-sm leading-7 text-ink-muted">
                  <p>
                    Precio basado en una tarifa de producción de {formatCurrency(result.pfhRate)} por hora de audio terminado.
                    La duración final puede variar según el nivel de diseño sonoro requerido por la obra.
                  </p>
                </div>

                <Link href={routes.contacto} className="block">
                  <Button variant="primary" className="w-full">
                    Hablar sobre este capítulo
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
