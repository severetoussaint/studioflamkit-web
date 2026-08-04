"use client";

import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Download,
  Wallet,
  Settings,
  CheckCircle2,
  Clock,
  FileAudio,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';

type SectionId = 'resumen' | 'capitulos' | 'entregables' | 'pagos' | 'perfil';

const sections: { id: SectionId; label: string; icon: React.ElementType }[] = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
  { id: 'capitulos', label: 'Capitulos', icon: BookOpen },
  { id: 'entregables', label: 'Entregables', icon: Download },
  { id: 'pagos', label: 'Pagos', icon: Wallet },
  { id: 'perfil', label: 'Perfil', icon: Settings },
];

const chapters = [
  { title: 'Capitulo 1', progress: 85, revisions: 1, status: 'Produccion' },
  { title: 'Capitulo 2', progress: 62, revisions: 2, status: 'Revisiones' },
  { title: 'Capitulo 3', progress: 100, revisions: 0, status: 'Completado' },
];

const deliverables = [
  { title: 'Version de prueba', date: '12 jul 2026' },
  { title: 'Muestra de audio 01', date: '20 jul 2026' },
  { title: 'Entrega final lista para publicacion', date: 'Pendiente' },
];

const payments = [
  { chapter: 'Capitulo 1', amount: '$130.00', status: 'Pagado', date: '10 jul 2026' },
  { chapter: 'Capitulo 2', amount: '$130.00', status: 'Pagado', date: '18 jul 2026' },
  { chapter: 'Capitulo 3', amount: '$130.00', status: 'Pendiente', date: '-' },
];

function StatusPill({ status }: { status: string }) {
  const isDone = status === 'Completado' || status === 'Pagado';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
        isDone ? 'border-accent/30 bg-accent/10 text-accent' : 'border-edge bg-surface text-ink-muted'
      }`}
    >
      {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [active, setActive] = useState<SectionId>('resumen');

  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar />

      <div className="border-b border-edge bg-surface-elevated">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">Centro del Autor</p>
          <h1 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">
            El jardin de las sombras
          </h1>
          <p className="mt-2 text-sm text-ink-muted">Tu obra en proceso, organizada y visible.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Navegacion de secciones */}
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = active === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActive(section.id)}
                  className={`flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                    isActive
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'border-edge bg-surface-elevated text-ink-muted hover:text-ink'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {section.label}
                </button>
              );
            })}
          </nav>

          {/* Contenido de la seccion activa */}
          <div className="min-w-0">
            {active === 'resumen' && (
              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <p className="text-sm text-ink-muted">Estado</p>
                  <p className="mt-1 text-lg font-semibold text-ink">Produccion</p>
                </Card>
                <Card>
                  <p className="text-sm text-ink-muted">Progreso general</p>
                  <p className="mt-1 text-lg font-semibold text-ink">74%</p>
                </Card>
                <Card className="sm:col-span-2">
                  <p className="text-sm text-ink-muted">Limite de revisiones</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">2 revisiones por capitulo</p>
                  <p className="mt-3 text-sm leading-7 text-ink-muted">
                    Tu contrato incluye un maximo de dos revisiones por capitulo para mantener el flujo de produccion claro y controlado.
                  </p>
                </Card>
              </div>
            )}

            {active === 'capitulos' && (
              <Card>
                <h2 className="text-lg font-semibold text-ink">Capitulos</h2>
                <div className="mt-6 space-y-4">
                  {chapters.map((chapter) => (
                    <div key={chapter.title} className="rounded-2xl border border-edge bg-surface-elevated p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <FileAudio className="h-4 w-4 text-accent" strokeWidth={1.75} />
                          <p className="text-ink">{chapter.title}</p>
                        </div>
                        <StatusPill status={chapter.status} />
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${chapter.progress}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-ink-muted">{chapter.revisions}/2 revisiones usadas</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {active === 'entregables' && (
              <Card>
                <h2 className="text-lg font-semibold text-ink">Entregables y muestras</h2>
                <div className="mt-6 space-y-3">
                  {deliverables.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded-2xl border border-edge bg-surface-elevated p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Download className="h-4 w-4 text-accent" strokeWidth={1.75} />
                        <span className="text-sm text-ink">{item.title}</span>
                      </div>
                      <span className="text-xs text-ink-muted">{item.date}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {active === 'pagos' && (
              <Card>
                <h2 className="text-lg font-semibold text-ink">Pagos por capitulo</h2>
                <div className="mt-6 space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.chapter}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-edge bg-surface-elevated p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="h-4 w-4 text-accent" strokeWidth={1.75} />
                        <div>
                          <p className="text-sm text-ink">{payment.chapter}</p>
                          <p className="text-xs text-ink-muted">{payment.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-ink">{payment.amount}</span>
                        <StatusPill status={payment.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {active === 'perfil' && (
              <Card>
                <h2 className="text-lg font-semibold text-ink">Perfil y configuracion</h2>
                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center justify-between border-b border-edge pb-3">
                    <span className="text-ink-muted">Nombre</span>
                    <span className="text-ink">Autor de prueba</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-edge pb-3">
                    <span className="text-ink-muted">Correo</span>
                    <span className="text-ink">autor@ejemplo.com</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-muted">Notificaciones por correo</span>
                    <span className="text-accent">Activadas</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}