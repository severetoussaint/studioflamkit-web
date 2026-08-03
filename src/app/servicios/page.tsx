import React from 'react';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { routes } from '@/config/routes';

const services = [
  {
    title: 'Demos / Capítulos de prueba',
    description:
      'Un adelanto sonoro para validar tono, pacing y propuesta editorial antes de comprometerse con una producción completa.',
    features: ['Muestra de 1 a 3 capítulos', 'Dirección de voz y edición de atmósfera', 'Entrega rápida para evaluación creativa'],
  },
  {
    title: 'Producción audiocinematográfica completa',
    description:
      'Una experiencia de audio completa para que el libro se convierta en una pieza inmersiva y profesional.',
    features: ['Postproducción integral', 'Diseño sonoro y mezcla final', 'Entregables listos para publicación y difusión'],
  },
];

const highlights = [
  {
    title: 'Proceso claro',
    description: 'Te guiamos de la muestra inicial a la entrega final con una comunicación fluida y sin ambigüedades.',
  },
  {
    title: 'Habla que sostiene la historia',
    description: 'La voz, la música y el ritmo se diseñan para que la obra se escuche con la misma fuerza que se lee.',
  },
  {
    title: 'Adaptación a cada proyecto',
    description: 'No hay un solo formato válido: trabajamos según el universo, el tono y la intención editorial de cada autor.',
  },
];

export default function ServiciosPage() {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar />

      <section className="relative overflow-hidden border-b border-edge">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,_var(--color-accent)_0%,_transparent_28%)] opacity-[0.10]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">Servicios</p>
            <h1 className="mt-4 font-serif text-4xl font-medium text-ink sm:text-5xl lg:text-6xl">
              Soluciones de audio para autores que desean elevar la lectura.
            </h1>
            <p className="mt-6 text-lg leading-8 text-ink-muted">
              Diseñamos propuestas a medida para lanzar un primer adelanto o avanzar hacia una producción completa con identidad sonora.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {services.map((service) => (
              <Card key={service.title} title={service.title} description={service.description}>
                <ul className="space-y-3 text-sm text-ink-muted">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={routes.contacto}>
              <Button variant="primary">Solicitar propuesta</Button>
            </Link>
            <Link href={routes.calculadora}>
              <Button variant="secondary">Ver calculadora</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-edge bg-surface-elevated">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">Por qué trabajar con nosotros</p>
            <h2 className="mt-4 font-serif text-3xl font-medium text-ink sm:text-4xl">
              Una colaboración cercana, creativa y pensada para cada obra.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-3xl border border-edge bg-surface p-6">
                <h3 className="font-serif text-xl font-medium text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
