"use client";

import Link from 'next/link';
import { ArrowLeft, ChevronRight, Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUser, getUserRole } from '@/services/auth.service';
import { routes } from '@/config/routes';
import { Card } from '@/components/ui/Card';

export default function AdminConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAccess() {
      try {
        const user = await getUser();
        if (!user || getUserRole(user) !== 'admin') {
          window.location.href = routes.login;
          return;
        }
        if (mounted) setAuthorized(true);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void checkAccess();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <main className="min-h-screen bg-surface p-8 text-ink">Cargando configuración…</main>;
  }

  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-surface text-ink">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href={routes.admin} className="inline-flex items-center gap-2 text-xs font-medium text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Volver al Admin
        </Link>

        <div className="mt-5 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-muted">Administración</p>
            <h1 className="font-serif text-3xl font-semibold">Configuración</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
              Configuración general del estudio. Las herramientas que aparecen aquí afectan el funcionamiento global del Admin y de las nuevas propuestas.
            </p>
          </div>
        </div>

        <section className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">Herramientas disponibles</p>
          <div className="mt-4 space-y-3">
            <Link href={routes.adminPrecios} className="block">
              <Card className="transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Settings2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-semibold">Precios</h2>
                      <p className="mt-1 text-sm leading-6 text-ink-muted">
                        Configura la tarifa base, complejidad y catálogo global de servicios que utilizará el motor de precios.
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-ink-muted" />
                </div>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
