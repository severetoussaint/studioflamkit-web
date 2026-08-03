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
    <main className="min-h-screen bg-surface text-ink">
      <Navbar />

      <section className="relative overflow-hidden border-b border-edge">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,_var(--color-accent)_0%,_transparent_28%)] opacity-[0.10]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">Centro del Autor</p>
            <h1 className="mt-4 font-serif text-4xl font-medium text-ink sm:text-5xl lg:text-6xl">
              Tu obra en proceso, organizada y visible.
            </h1>
            <p className="mt-6 text-lg leading-8 text-ink-muted">
              Revisa el estado de producción, el avance de los capítulos y el panel de entregables desde un solo lugar.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-ink-muted">Resumen del proyecto</p>
                  <h2 className="mt-1 text-2xl font-semibold text-ink">El jardín de las sombras</h2>
                </div>
                <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm text-accent">
                  Producción
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-edge bg-surface p-4">
                  <p className="text-sm text-ink-muted">Estado</p>
                  <p className="mt-1 text-lg font-semibold text-ink">Producción</p>
                </div>
                <div className="rounded-2xl border border-edge bg-surface p-4">
                  <p className="text-sm text-ink-muted">Progreso general</p>
                  <p className="mt-1 text-lg font-semibold text-ink">74%</p>
                </div>
              </div>
            </Card>

            <Card className="border-accent/20">
              <p className="text-sm text-ink-muted">Límite de revisiones</p>
              <p className="mt-2 text-3xl font-semibold text-ink">2 revisiones por capítulo</p>
              <p className="mt-4 text-sm leading-7 text-ink-muted">
                Tu contrato incluye un máximo de dos revisiones por capítulo para mantener el flujo de producción claro y controlado.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b border-edge bg-surface-elevated">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <Card>
              <h2 className="text-xl font-semibold text-ink">Capítulos</h2>
              <div className="mt-6 space-y-4">
                {chapters.map((chapter) => (
                  <div key={chapter.title} className="rounded-2xl border border-edge bg-surface p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-ink">{chapter.title}</p>
                        <p className="mt-1 text-sm text-ink-muted">{chapter.status}</p>
                      </div>
                      <span className="text-sm text-ink-muted">{chapter.revisions}/2 revisiones</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-elevated">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${chapter.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold text-ink">Entregables y muestras</h2>
              <ul className="mt-6 space-y-3 text-sm text-ink-muted">
                {deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
