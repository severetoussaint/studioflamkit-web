import React from 'react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_25%),linear-gradient(135deg,_#09090b_0%,_#111827_50%,_#030712_100%)] text-stone-100">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-400">Contacto</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Hablemos sobre tu obra y su próxima versión sonora.
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-300">
            Completa este formulario visual para iniciar una conversación creativa y recibir una propuesta orientativa.
          </p>
        </div>

        <div className="mt-12 max-w-3xl">
          <Card className="border-stone-800/80 bg-stone-950/80">
            <div className="space-y-4">
              <Input label="Nombre" placeholder="Tu nombre" />
              <Input label="Correo" type="email" placeholder="correo@ejemplo.com" />
              <Input label="Título de la obra" placeholder="Título o proyecto" />
              <label className="block text-sm text-stone-300">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-500">Mensaje</span>
                <textarea
                  rows={5}
                  placeholder="Cuéntanos qué quieres transformar en una experiencia sonora"
                  className="w-full rounded-3xl border border-stone-700 bg-stone-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
                />
              </label>
              <Button variant="primary" className="w-full">
                Enviar solicitud
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
