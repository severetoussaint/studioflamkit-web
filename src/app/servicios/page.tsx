import React from 'react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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

export default function ServiciosPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_25%),linear-gradient(135deg,_#09090b_0%,_#111827_50%,_#030712_100%)] text-stone-100">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-400">Servicios</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Soluciones de audio para autores que desean elevar la lectura.
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-300">
            Diseñamos propuestas a medida para lanzar un primer adelanto o avanzar hacia una producción completa con identidad sonora.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {services.map((service) => (
            <Card key={service.title} title={service.title} description={service.description}>
              <ul className="space-y-3 text-sm text-stone-300">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button variant="primary">Solicitar propuesta</Button>
          <Button variant="secondary">Hablar con el equipo</Button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
