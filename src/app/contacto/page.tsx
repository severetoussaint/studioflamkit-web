import React from 'react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

const contactPoints = [
  {
    title: 'Primera conversación',
    description: 'Te escuchamos con interés para entender el tono, la intención y el alcance del proyecto.',
  },
  {
    title: 'Propuesta orientativa',
    description: 'Te devolvemos una idea clara de enfoque, tiempos y alcance para que tomes una decisión informada.',
  },
];

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar />

      <section className="relative overflow-hidden border-b border-edge/50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,_var(--color-accent)_0%,_transparent_28%)] opacity-[0.10]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">Contacto</p>
            <h1 className="mt-4 font-serif text-4xl font-medium text-ink sm:text-5xl lg:text-6xl">
              Hablemos sobre tu obra y su próxima versión sonora.
            </h1>
            <p className="mt-6 text-lg leading-8 text-ink-muted">
              Completa este formulario para iniciar una conversación creativa y recibir una propuesta orientativa.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              {contactPoints.map((point) => (
                <Card key={point.title}>
                  <h2 className="font-serif text-xl font-medium text-ink">{point.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-ink-muted">{point.description}</p>
                </Card>
              ))}
            </div>

            <Card>
              <div className="space-y-4">
                <Input label="Nombre" placeholder="Tu nombre" />
                <Input label="Correo" type="email" placeholder="correo@ejemplo.com" />
                <Input label="Título de la obra" placeholder="Título o proyecto" />
                <label className="block text-sm text-ink">
                  <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-ink-muted">Mensaje</span>
                  <textarea
                    rows={5}
                    placeholder="Cuéntanos qué quieres transformar en una experiencia sonora"
                    className="w-full rounded-3xl border-edge/50 bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-accent/70 focus:ring-2 focus:ring-accent/20"
                  />
                </label>
                <Button variant="primary" className="w-full">
                  Enviar solicitud
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
