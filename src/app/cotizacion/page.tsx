"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getUser } from '@/services/auth.service';

function CotizacionContent() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    getUser()
      .then((user) => {
        if (isMounted) {
          setIsAuthenticated(Boolean(user));
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleContinue = () => {
    router.push(isAuthenticated ? '/dashboard' : '/registro');
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_25%),linear-gradient(135deg,_#09090b_0%,_#111827_50%,_#030712_100%)] text-stone-100">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-400">Cotización oficial</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Formaliza la solicitud de tu obra con una propuesta oficial.
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-300">
            Para solicitar la producción de tu obra, primero crea tu cuenta de autor. Desde tu Centro del Autor podrás subir tu manuscrito y solicitar tu primer capítulo o trailer.
          </p>
        </div>

        <div className="mt-10 mx-auto max-w-xl">
          <Card className="border-stone-800/80 bg-stone-950/80">
            <div className="space-y-4">
              <Button
                variant="primary"
                className="w-full"
                onClick={handleContinue}
                disabled={isAuthenticated === null}
              >
                {isAuthenticated === null ? 'Cargando...' : isAuthenticated ? 'Ir a mi Centro del Autor' : 'Crear mi cuenta de autor'}
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function CotizacionPage() {
  return <CotizacionContent />;
}
