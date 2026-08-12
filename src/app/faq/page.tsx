"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { HelpCircle, ChevronDown, ArrowRight, MessageSquare, BookOpen, FileText, Clock } from 'lucide-react';

const faqs = [
  {
    icon: FileText,
    question: '¿Quién conserva la titularidad de los derechos?',
    answer: 'El 100% de los derechos permanece en manos del autor. Studio Flamkit & Art participa como socio creativo en la producción del proyecto, sin asumir la titularidad de la obra.',
  },
  {
    icon: Clock,
    question: '¿Cuántas revisiones incluye cada capítulo?',
    answer: 'Cada capítulo contempla hasta 2 revisiones de contenido y dirección, para mantener el proceso ágil y claro sin perder calidad creativa.',
  },
  {
    icon: BookOpen,
    question: '¿Qué incluyen los entregables finales?',
    answer: 'Los entregables finales incluyen archivo de audio listo para publicación, versión master y una carpeta de materiales de producción organizada para su uso editorial o promocional.',
  },
  {
    icon: MessageSquare,
    question: '¿Puedo comenzar con una muestra antes de comprometerme?',
    answer: 'Sí. La muestra es una excelente forma de probar el tono, la dirección narrativa y la calidad sonora antes de avanzar a una producción completa.',
  },
];

function FAQItem({ item, index }: { item: typeof faqs[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <details className="group/details rounded-3xl border border-edge/50 bg-surface-elevated p-6 open:border-accent/30 open:bg-accent/[0.02] transition-all duration-300">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-ink">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent group-open/details:bg-accent group-open/details:text-white transition-all duration-300">
              <item.icon className="h-5 w-5" />
            </div>
            <span>{item.question}</span>
          </div>
          <ChevronDown className="h-5 w-5 text-accent transition-transform duration-300 group-open/details:rotate-180" />
        </summary>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: 'auto',
            opacity: 1
          }}
          transition={{ duration: 0.3 }}
          className="mt-4 pl-[3.5rem]"
        >
          <p className="text-sm leading-7 text-ink-muted">{item.answer}</p>
        </motion.div>
      </details>
    </motion.div>
  );
}

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-edge/50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,_var(--color-accent)_0%,_transparent_50%)] opacity-[0.08]" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.10 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,_var(--color-accent)_0%,_transparent_28%)]"
          />
        </div>
        <div className="absolute top-20 left-10 h-20 w-20 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-premium/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.36em] text-accent">
              <span className="h-px w-8 bg-accent/50" />
              FAQ
              <span className="h-px w-8 bg-accent/50" />
            </p>

            <h1 className="mt-6 font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl lg:text-6xl">
              Respuestas claras para un proceso creativo transparente.
            </h1>

            <p className="mt-6 text-lg leading-8 text-ink-muted">
              Estas preguntas frecuentes ayudan a anticipar los puntos más importantes de la colaboración y la entrega final.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="mt-12 space-y-4"
          >
            {faqs.map((item, index) => (
              <FAQItem key={item.question} item={item} index={index} />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link href="/contacto">
              <Button variant="primary" className="group">
                Preguntarnos algo más
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/servicios">
              <Button variant="secondary">Ver servicios</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Additional Help Section */}
      <section className="border-b border-edge/50 bg-surface-elevated">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-6">
              <HelpCircle className="h-8 w-8" />
            </div>

            <h2 className="font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-5xl">
              ¿No encuentras lo que buscas?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-ink-muted">
              Estamos aquí para ayudarte. Contáctanos directamente y te responderemos con gusto.
            </p>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contacto">
                <Button variant="primary" className="group">
                  Contactar ahora
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/calculadora">
                <Button variant="secondary">Usar calculadora</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
