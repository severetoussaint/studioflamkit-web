"use client";

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/features/quotations/utils/calculator';
import { getBillingStatus, createPaymentPlan } from '@/services/payment.service';

export default function CotizacionPage() {
  const searchParams = useSearchParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [wordCount, setWordCount] = useState(searchParams.get('wordCount') ?? '45000');
  const [sampleType, setSampleType] = useState('demo');

  const estimatedAmount = useMemo(() => {
    const parsedValue = Number(wordCount || 0);
    const base = Math.max(parsedValue / 10, 0);
    return Math.round(base);
  }, [wordCount]);

  const billing = useMemo(() => getBillingStatus(estimatedAmount), [estimatedAmount]);
  const paymentPlan = useMemo(() => createPaymentPlan(estimatedAmount), [estimatedAmount]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_25%),linear-gradient(135deg,_#09090b_0%,_#111827_50%,_#030712_100%)] text-stone-100">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-400">Cotización oficial</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Formaliza la solicitud de tu obra con una propuesta oficial.
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-300">
            Completa este formulario para iniciar el proceso de producción con una cotización alineada a tu proyecto.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="border-stone-800/80 bg-stone-950/80">
            <div className="space-y-4">
              <Input label="Título del libro" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="El jardín de las sombras" />
              <label className="block text-sm text-stone-300">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">Sinopsis o descripción</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  placeholder="Describe el tono, el público y la propuesta editorial"
                  className="w-full rounded-3xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                />
              </label>
              <Input label="Conteo final de palabras" type="number" value={wordCount} onChange={(event) => setWordCount(event.target.value)} placeholder="45000" />
              <label className="block text-sm text-stone-300">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">Muestra o prueba</span>
                <select
                  value={sampleType}
                  onChange={(event) => setSampleType(event.target.value)}
                  className="w-full rounded-full border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="demo">Demo / capítulo inicial</option>
                  <option value="sample">Muestra completa</option>
                  <option value="none">Sin muestra previa</option>
                </select>
              </label>
              <Button variant="primary" className="w-full">
                Enviar solicitud oficial
              </Button>
            </div>
          </Card>

          <Card className="border-amber-500/20 bg-gradient-to-br from-stone-950/90 to-stone-900/70">
            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
                <p className="text-xs uppercase tracking-[0.32em] text-stone-500">Estimación inicial</p>
                <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(estimatedAmount)}</p>
                <p className="mt-2 text-sm text-stone-400">Valor orientativo basado en el conteo de palabras enviado.</p>
              </div>

              <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4">
                <p className="text-sm text-stone-400">Estado de facturación</p>
                <p className="mt-2 text-lg font-semibold text-white">{formatCurrency(billing.pendingAmount)} pendiente</p>
                <p className="mt-2 text-sm text-stone-400">Total: {formatCurrency(billing.totalAmount)}</p>
              </div>

              <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4">
                <p className="text-sm text-stone-400">Plan de pagos</p>
                <div className="mt-3 space-y-2 text-sm text-stone-300">
                  {paymentPlan.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-full border border-stone-800 px-3 py-2">
                      <span>{item.label}</span>
                      <span className="text-amber-300">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
