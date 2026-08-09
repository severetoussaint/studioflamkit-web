import React from 'react';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';

const faqs = [
  {
    question: '¿Quién conserva la titularidad de los derechos?',
    answer: 'El 100% de los derechos permanece en manos del autor. Studio Flamkit & Art participa como socio creativo en la producción del proyecto, sin asumir la titularidad de la obra.',
  },
  {
    question: '¿Cuántas revisiones incluye cada capítulo?',
    answer: 'Cada capítulo contempla hasta 2 revisiones de contenido y dirección, para mantener el proceso ágil y claro sin perder calidad creativa.',
  },
  {
    question: '¿Qué incluyen los entregables finales?',
    answer: 'Los entregables finales incluyen archivo de audio listo para publicación, versión master y una carpeta de materiales de producción organizada para su uso editorial o promocional.',
  },
  {
    question: '¿Puedo comenzar con una muestra antes de comprometerme?',
    answer: 'Sí. La muestra es una excelente forma de probar el tono, la dirección narrativa y la calidad sonora antes de avanzar a una producción completa.',
  },
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar />

      <section className="relative overflow-hidden border-b border-edge/50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,_var(--color-accent)_0%,_transparent_28%)] opacity-[0.10]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">FAQ</p>
            <h1 className="mt-4 font-serif text-4xl font-medium text-ink sm:text-5xl lg:text-6xl">
              Respuestas claras para un proceso creativo transparente.
            </h1>
            <p className="mt-6 text-lg leading-8 text-ink-muted">
              Estas preguntas frecuentes ayudan a anticipar los puntos más importantes de la colaboración y la entrega final.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((item) => (
              <details key={item.question} className="group rounded-3xl border-edge/50 bg-surface-elevated p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-ink">
                  <span>{item.question}</span>
                  <span className="text-2xl text-accent transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-sm leading-7 text-ink-muted">{item.answer}</p>
              </details>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={routes.contacto}>
              <Button variant="primary">Preguntarnos algo más</Button>
            </Link>
            <Link href={routes.servicios}>
              <Button variant="secondary">Ver servicios</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
