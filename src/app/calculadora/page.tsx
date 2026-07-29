"use client";

import React, { useMemo, useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { calculateQuotation, formatCurrency, getProductionLabel } from '@/features/quotations/utils/calculator';
import type { ProductionLevel, QuotationInput } from '@/types/quotation';

const initialState: QuotationInput = {
  wordCount: 45000,
  pageCount: 180,
  productionLevel: 'estandar',
};

export default function CalculadoraPage() {
  const [form, setForm] = useState<QuotationInput>(initialState);

  const result = useMemo(() => calculateQuotation(form), [form]);

  const updateField = (field: keyof QuotationInput, value: string) => {
    const numericValue = Number(value);
    setForm((current) => ({
      ...current,
      [field]: field === 'productionLevel' ? (value as ProductionLevel) : Number.isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_25%),linear-gradient(135deg,_#09090b_0%,_#111827_50%,_#030712_100%)] text-stone-100">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-400">Calculadora</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Estima el presupuesto de tu proyecto sonoro con rapidez.
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-300">
            Introduce el volumen de tu obra y el nivel de diseño sonoro para obtener una estimación orientativa en tiempo real.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-stone-800/80 bg-stone-950/80">
            <div className="space-y-4">
              <Input
                label="Palabras estimadas"
                type="number"
                min={0}
                value={form.wordCount}
                onChange={(event) => updateField('wordCount', event.target.value)}
              />
              <Input
                label="Páginas estimadas"
                type="number"
                min={0}
                value={form.pageCount}
                onChange={(event) => updateField('pageCount', event.target.value)}
              />
              <label className="block text-sm text-stone-300">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">Nivel de producción</span>
                <select
                  value={form.productionLevel}
                  onChange={(event) => updateField('productionLevel', event.target.value)}
                  className="w-full rounded-full border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="basico">Básico / Demo</option>
                  <option value="estandar">Estándar</option>
                  <option value="cinematografico">Cinematográfico</option>
                </select>
              </label>
            </div>
          </Card>

          <Card className="border-amber-500/20 bg-gradient-to-br from-stone-950/90 to-stone-900/70">
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Estimación</p>
                <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(result.totalCost)}</p>
                <p className="mt-2 text-sm text-stone-400">Nivel seleccionado: {getProductionLabel(form.productionLevel)}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4">
                  <p className="text-sm text-stone-400">Horas estimadas</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{result.estimatedHours}h</p>
                </div>
                <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4">
                  <p className="text-sm text-stone-400">Precio base</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{formatCurrency(result.basePrice)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4 text-sm leading-7 text-stone-400">
                <p>La fórmula aplica un criterio de 9.000 palabras por hora y un ajuste según la profundidad de producción sonora.</p>
              </div>

              <a href={`/cotizacion?wordCount=${form.wordCount}`} className="block">
                <Button variant="primary" className="w-full">
                  Solicitar Cotización Oficial
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
