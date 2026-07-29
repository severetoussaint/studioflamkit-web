import React from 'react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';

const chapters = [
  { title: 'Capítulo 1', progress: 85, revisions: 1, status: 'Producción' },
  { title: 'Capítulo 2', progress: 62, revisions: 2, status: 'Revisiones' },
  { title: 'Capítulo 3', progress: 100, revisions: 0, status: 'Completado' },
];

const deliverables = ['Versión de prueba', 'Muestra de audio 01', 'Entrega final lista para publicación'];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_25%),linear-gradient(135deg,_#09090b_0%,_#111827_50%,_#030712_100%)] text-stone-100">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-400">Centro del Autor</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Tu obra en proceso, organizada y visible.
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-300">
            Revisa el estado de producción, el avance de los capítulos y el panel de entregables desde un solo lugar.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-stone-800/80 bg-stone-950/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-400">Resumen del proyecto</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">El jardín de las sombras</h2>
              </div>
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-sm text-amber-200">
                Producción
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
                <p className="text-sm text-stone-400">Estado</p>
                <p className="mt-1 text-lg font-semibold text-white">Producción</p>
              </div>
              <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
                <p className="text-sm text-stone-400">Progreso general</p>
                <p className="mt-1 text-lg font-semibold text-white">74%</p>
              </div>
            </div>
          </Card>

          <Card className="border-amber-500/20 bg-gradient-to-br from-stone-950/90 to-stone-900/70">
            <p className="text-sm text-stone-400">Límite de revisiones</p>
            <p className="mt-2 text-3xl font-semibold text-white">2 revisiones por capítulo</p>
            <p className="mt-4 text-sm leading-7 text-stone-400">
              Tu contrato incluye un máximo de dos revisiones por capítulo para mantener el flujo de producción claro y controlado.
            </p>
          </Card>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="border-stone-800/80 bg-stone-950/80">
            <h2 className="text-xl font-semibold text-white">Capítulos</h2>
            <div className="mt-6 space-y-4">
              {chapters.map((chapter) => (
                <div key={chapter.title} className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white">{chapter.title}</p>
                      <p className="mt-1 text-sm text-stone-400">{chapter.status}</p>
                    </div>
                    <span className="text-sm text-stone-400">{chapter.revisions}/2 revisiones</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-800">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${chapter.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-stone-800/80 bg-stone-950/80">
            <h2 className="text-xl font-semibold text-white">Entregables y muestras</h2>
            <ul className="mt-6 space-y-3 text-sm text-stone-300">
              {deliverables.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
