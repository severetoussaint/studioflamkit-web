'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';
import { Headphones, Mic2, Sparkles, Clock, CheckCircle2, ArrowRight, BookOpen, Palette } from 'lucide-react';

const services = [
  {
    icon: Mic2,
    title: 'Demos / Capítulos de prueba',
    description: 'Un adelanto sonoro para validar tono, pacing y propuesta editorial antes de comprometerse con una producción completa.',
    features: ['Muestra de 1 a 3 capítulos', 'Dirección de voz y edición de atmósfera', 'Entrega rápida para evaluación creativa'],
    highlight: 'Ideal para primeros proyectos',
  },
  {
    icon: Headphones,
    title: 'Producción audiocinematográfica completa',
    description: 'Una experiencia de audio completa para que el libro se convierta en una pieza inmersiva y profesional.',
    features: ['Postproducción integral', 'Diseño sonoro y mezcla final', 'Entregables listos para publicación y difusión'],
    highlight: 'Experiencia premium',
  },
];

const highlights = [
  {
    icon: BookOpen,
    title: 'Proceso claro',
    description: 'Te guiamos de la muestra inicial a la entrega final con una comunicación fluida y sin ambigüedades.',
  },
  {
    icon: Mic2,
    title: 'Habla que sostiene la historia',
    description: 'La voz, la música y el ritmo se diseñan para que la obra se escuche con la misma fuerza que se lee.',
  },
  {
    icon: Palette,
    title: 'Adaptación a cada proyecto',
    description: 'No hay un solo formato válido: trabajamos según el universo, el tono y la intención editorial de cada autor.',
  },
];

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group relative overflow-hidden rounded-3xl border border-edge/50 bg-surface p-8 shadow-sm hover:shadow-xl hover:border-accent/30 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {service.highlight && (
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Sparkles className="h-3 w-3" />
            {service.highlight}
          </span>
        </div>
      )}

      <div className="relative">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
          <service.icon className="h-7 w-7" />
        </div>

        <h3 className="mt-6 font-serif text-2xl font-medium text-ink">{service.title}</h3>
        <p className="mt-3 text-base leading-7 text-ink-muted">{service.description}</p>

        <ul className="mt-6 space-y-3">
          {service.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <span className="text-sm text-ink-muted">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function HighlightCard({ item, index }: { item: typeof highlights[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-3xl border border-edge/50 bg-surface-elevated p-6 hover:border-accent/30 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
          <item.icon className="h-5 w-5" />
        </div>

        <h3 className="mt-4 font-serif text-lg font-medium text-ink">{item.title}</h3>
        <p className="mt-2 text-sm leading-7 text-ink-muted">{item.description}</p>
      </div>
    </motion.div>
  );
}

export default function ServiciosPage() {
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
              Servicios
              <span className="h-px w-8 bg-accent/50" />
            </p>

            <h1 className="mt-6 font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl lg:text-6xl">
              Soluciones de audio para autores que desean elevar la lectura.
            </h1>

            <p className="mt-6 text-lg leading-8 text-ink-muted">
              Diseñamos propuestas a medida para lanzar un primer adelanto o avanzar hacia una producción completa con identidad sonora.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="mt-14 grid gap-6 lg:grid-cols-2"
          >
            {services.map((service, index) => (
              <ServiceCard key={service.title} service={service} index={index} />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link href={routes.contacto}>
              <Button variant="primary" className="group">
                Solicitar propuesta
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href={routes.calculadora}>
              <Button variant="secondary">Ver calculadora</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Por qué trabajar con nosotros Section */}
      <section className="border-b border-edge/50 bg-surface-elevated">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">Por qué trabajar con nosotros</p>
            <h2 className="mt-5 font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-5xl">
              Una colaboración cercana, creativa y pensada para cada obra.
            </h2>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {highlights.map((item, index) => (
              <HighlightCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-accent/[0.03] via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[100px]" />

        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center lg:px-8 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <Clock className="mx-auto h-12 w-12 text-accent" />
            <h2 className="mt-6 font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-5xl">
              ¿Listo para comenzar?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-ink-muted">
              Cuéntanos sobre tu proyecto y te ayudaremos a elegir el mejor punto de partida.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link href={routes.contacto}>
                <Button variant="primary" className="group">
                  Iniciar conversación
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href={routes.faq}>
                <Button variant="secondary">Ver preguntas frecuentes</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
