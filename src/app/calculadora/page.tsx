"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { calculateChapterPrice, formatCurrency, getTierLabel } from '@/features/quotations/utils/calculator';
import { routes } from '@/config/routes';
import { Calculator as CalculatorIcon, Clock, DollarSign, ArrowRight, TrendingUp, BookOpen, Check } from 'lucide-react';

const TIER_REFERENCE = [
  { label: 'Entrada', words: '1,000 – 1,500', duration: '12 – 17 min', price: '$80 – $115' },
  { label: 'Intermedio', words: '~3,000', duration: '~20 min', price: '~$130' },
  { label: 'Completo', words: '~7,000', duration: '30 – 60 min', price: '$200 – $400' },
];

function TierBadge({ tier, isCurrent }: { tier: typeof TIER_REFERENCE[0]; isCurrent: boolean }) {
  return (
    <div className={`relative flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-300 ${isCurrent ? 'border-accent bg-accent/10 shadow-md scale-105' : 'border-edge/50 bg-surface hover:border-accent/30'}`}>
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isCurrent ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>
          {isCurrent ? <Check className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
        </div>
        <span className={`text-sm font-medium ${isCurrent ? 'text-accent' : 'text-ink'}`}>{tier.label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-ink-muted">{tier.words}</span>
        <span className={`text-xs font-semibold ${isCurrent ? 'text-accent' : 'text-ink'}`}>{tier.price}</span>
      </div>
    </div>
  );
}

export default function CalculadoraPage() {
  const [wordCount, setWordCount] = useState(3000);

  const result = useMemo(() => calculateChapterPrice({ wordCount }), [wordCount]);

  const getCurrentTierIndex = () => {
    if (wordCount <= 1500) return 0;
    if (wordCount <= 4000) return 1;
    return 2;
  };

  const currentTierIndex = getCurrentTierIndex();

  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-edge/50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,_var(--color-accent)_0%,_transparent_50%)] opacity-[0.08]" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.10 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,_var(--color-accent)_0%,_transparent_28%)]"
          />
        </div>
        <div className="absolute top-20 left-10 h-20 w-20 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-premium/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.36em] text-accent">
              <span className="h-px w-8 bg-accent/50" />
              Calculadora
              <span className="h-px w-8 bg-accent/50" />
            </p>

            <h1 className="mt-6 font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl lg:text-6xl">
              Calcula el precio de tu capítulo al instante.
            </h1>

            <p className="mt-6 text-lg leading-8 text-ink-muted">
              Ingresa el número de palabras del capítulo y verás la duración estimada y el precio en tiempo real.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="mt-12 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"
          >
            {/* Input Card */}
            <Card className="border-accent/20">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <CalculatorIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-ink">Configuración</h3>
                    <p className="text-xs text-ink-muted">Ajusta las palabras de tu capítulo</p>
                  </div>
                </div>

                <Input
                  label="Palabras del capítulo"
                  type="number"
                  min={0}
                  value={wordCount}
                  onChange={(event) => setWordCount(Number(event.target.value) || 0)}
                />

                <div className="relative">
                  <input
                    type="range"
                    min={200}
                    max={10000}
                    step={100}
                    value={wordCount}
                    onChange={(event) => setWordCount(Number(event.target.value))}
                    className="w-full accent-accent cursor-pointer"
                  />
                  <div className="mt-2 flex justify-between text-xs text-ink-muted">
                    <span>200</span>
                    <span className="font-semibold text-accent">{wordCount.toLocaleString()} palabras</span>
                    <span>10,000</span>
                  </div>
                </div>

                <div className="rounded-2xl border-edge/50 bg-surface p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-ink-muted">Niveles de referencia</p>
                  <div className="mt-3 space-y-2">
                    {TIER_REFERENCE.map((tier, index) => (
                      <TierBadge key={tier.label} tier={tier} isCurrent={index === currentTierIndex} />
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Result Card */}
            <Card className="border-accent/20 bg-gradient-to-br from-surface-elevated to-accent/[0.02]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-ink">Resultado estimado</h3>
                    <p className="text-xs text-ink-muted">Basado en tu configuración</p>
                  </div>
                </div>

                <motion.div
                  key={result.price}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl border-edge/50 bg-surface p-6"
                >
                  <p className="text-xs uppercase tracking-[0.32em] text-ink-muted">Precio estimado</p>
                  <p className="mt-2 text-5xl font-semibold text-ink">{formatCurrency(result.price)}</p>

                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      <span className="text-sm text-ink-muted">{result.durationMinutes} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      <span className="text-sm text-ink-muted">Nivel: {getTierLabel(result.tier)}</span>
                    </div>
                  </div>
                </motion.div>

                <div className="rounded-2xl border-edge/50 bg-surface p-4 text-sm leading-7 text-ink-muted">
                  <p>
                    Precio basado en una tarifa de producción de {formatCurrency(result.pfhRate)} por hora de audio terminado.
                    La duración final puede variar según el nivel de diseño sonoro requerido por la obra.
                  </p>
                </div>

                <Link href={routes.contacto} className="block">
                  <Button variant="primary" className="w-full group">
                    Hablar sobre este capítulo
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="border-b border-edge/50 bg-surface-elevated">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">Cómo funciona</p>
            <h2 className="mt-5 font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-5xl">
              Transparencia desde el primer cálculo.
            </h2>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { icon: BookOpen, title: 'Cuenta tus palabras', description: 'Ingresa el conteo exacto o aproximado de palabras de tu capítulo.' },
              { icon: CalculatorIcon, title: 'Obtén tu precio', description: 'El sistema calcula automáticamente según la duración estimada.' },
              { icon: Clock, title: 'Planifica tu proyecto', description: 'Usa la información para presupuestar tu producción completa.' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-3xl border border-edge/50 bg-surface p-6 hover:border-accent/30 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-medium text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink-muted">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}