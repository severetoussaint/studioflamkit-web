import React from 'react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';

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
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_25%),linear-gradient(135deg,_#09090b_0%,_#111827_50%,_#030712_100%)] text-stone-100">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-400">FAQ</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            Respuestas claras para un proceso creativo transparente.
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-300">
            Estas preguntas frecuentes ayudan a anticipar los puntos más importantes de la colaboración y la entrega final.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((item) => (
            <Card key={item.question} className="border-stone-800/80">
              <h2 className="text-lg font-semibold text-white">{item.question}</h2>
              <p className="mt-3 text-sm leading-7 text-stone-400">{item.answer}</p>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
