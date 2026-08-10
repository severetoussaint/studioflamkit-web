'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';
import { Headphones, BookOpen, Mic2, Sparkles, ArrowRight, Play, Waves, Target, Heart } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Play,
    title: 'Escucha una muestra',
    description: 'Un Audio Trailer o Capítulo Piloto para que evalúes la calidad real antes de comprometerte con la obra completa.',
  },
  {
    number: '02',
    icon: Target,
    title: 'Avanza capítulo a capítulo',
    description: 'Si decides continuar, la producción avanza y se factura por capítulo — transparente y sin grandes pagos por adelantado.',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Tu obra, lista para el mundo',
    description: 'Entrega final master, lista para publicación, con el mismo cuidado narrativo de principio a fin.',
  },
];

const pillars = [
  {
    icon: Heart,
    title: 'Respeto por la obra',
    description: 'Tratamos cada libro como una creación única — nunca como un simple proyecto de audio.',
  },
  {
    icon: Mic2,
    title: 'Calidad sin compromisos',
    description: 'Cada producción cumple un estándar profesional, desde la narración hasta la entrega final.',
  },
  {
    icon: BookOpen,
    title: 'Narrativa primero',
    description: 'El universo creativo del autor siempre está por encima de la tecnología. El audio existe para potenciar la obra, nunca para opacarla.',
  },
];

const aboutPoints = [
  {
    icon: BookOpen,
    title: 'Una mirada editorial',
    description: 'Entendemos que cada libro tiene una identidad propia y un público distinto. Por eso cada propuesta se adapta a la obra, no al revés.',
  },
  {
    icon: Heart,
    title: 'Una producción cercana',
    description: 'Trabajamos con una lógica de acompañamiento más humana: cercana, clara y orientada a que el autor se sienta acompañado en cada etapa.',
  },
  {
    icon: Waves,
    title: 'Sonido con propósito',
    description: 'La música, la voz y la mezcla no decoran: sostienen la emoción, la tensión y la memoria de la historia.',
  },
  {
    icon: Headphones,
    title: 'Escucha, no solo producción',
    description: 'Creemos en construir una experiencia sensorial que ayude a que la obra llegue a más personas y se recuerde con más fuerza.',
  },
];

function FeatureCard({ icon: Icon, title, description, delay = 0 }: { icon: React.ElementType; title: string; description: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-3xl border border-edge/50 bg-surface p-8 shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-5 font-serif text-xl font-medium text-ink">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-ink-muted">{description}</p>
      </div>
    </motion.div>
  );
}

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative border-t border-edge/50 pt-8 group"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
          <step.icon className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="font-serif text-4xl text-accent/60 group-hover:text-accent transition-colors duration-300">{step.number}</span>
            <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
          </div>
          <p className="mt-3 text-sm leading-7 text-ink-muted">{step.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden border-b border-edge/50">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,_var(--color-accent)_0%,_transparent_50%)] opacity-[0.08]" />
          <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,_var(--color-accent)_0%,_transparent_28%)] opacity-[0.10]" />
        </div>
        <div className="absolute top-20 left-10 h-20 w-20 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-premium/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-6 py-32 text-center lg:px-8 lg:py-40">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
            <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.36em] text-accent">
              <span className="h-px w-8 bg-accent/50" />
              Audiolibros cinematográficos para autores independientes
              <span className="h-px w-8 bg-accent/50" />
            </p>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }} className="mt-8 font-serif text-5xl font-medium leading-tight text-ink sm:text-6xl lg:text-7xl xl:text-8xl">
            Ayudamos a que tu libro
            <br />
            <span className="text-accent">llegue más lejos.</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }} className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-ink-muted">
            Studio Flamkit & Art transforma libros en experiencias de audio cinematográficas — diseñadas para ampliar el alcance de tu obra, fortalecer tu marca como autor y conectar con nuevos lectores.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }} className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link href={routes.calculadora}>
              <Button variant="primary" className="group">
                Calcular mi capítulo
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href={routes.servicios}>
              <Button variant="secondary">Ver servicios</Button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} className="flex flex-col items-center gap-2 text-ink-muted/60">
              <span className="text-[10px] uppercase tracking-widest">Explora</span>
              <div className="h-px w-8 bg-ink-muted/30" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filosofía Section */}
      <section className="relative overflow-hidden border-b border-edge/50 bg-surface-elevated">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent" />
        <div className="relative mx-auto max-w-3xl px-6 py-28 text-center lg:px-8 lg:py-32">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="font-serif text-3xl italic leading-relaxed text-ink sm:text-4xl lg:text-5xl">
              &ldquo;No solo producimos audio;<br />
              <span className="text-accent">damos una nueva forma de vivir tu historia.</span>&rdquo;
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-accent/40" />
              <p className="text-sm uppercase tracking-[0.28em] text-ink-muted">Nuestra filosofía</p>
              <div className="h-px w-12 bg-accent/40" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sobre nosotros Section */}
      <section id="sobre" className="scroll-mt-20 border-b border-edge/50 bg-surface-elevated">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6 }} className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">Sobre nosotros</p>
              <h2 className="mt-5 font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-5xl">
                Studio Flamkit & Art transforma la lectura en una experiencia íntima y cinematográfica.
              </h2>
              <p className="mt-6 text-base leading-8 text-ink-muted">
                Nacemos para acompañar a autores independientes que quieren llevar su obra más allá del papel y hacerla sentir, escuchar y recordar con mayor fuerza.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.5 }} className="rounded-2xl border border-edge/50 bg-surface p-5 text-center">
                  <p className="font-serif text-3xl text-accent">100%</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">Compromiso artístico</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.5 }} className="rounded-2xl border border-edge/50 bg-surface p-5 text-center">
                  <p className="font-serif text-3xl text-accent">∞</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-ink-muted">Posibilidades creativas</p>
                </motion.div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {aboutPoints.map((point, index) => (
                <FeatureCard key={point.title} icon={point.icon} title={point.title} description={point.description} delay={index * 0.1} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cómo trabajamos Section */}
      <section className="border-b border-edge/50">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">Cómo trabajamos</p>
            <h2 className="mt-5 font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-5xl">
              Un proceso por etapas, pensado para reducir tu riesgo.
            </h2>
          </motion.div>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {steps.map((step, index) => (
              <StepCard key={step.number} step={step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Pilares Section */}
      <section className="border-b border-edge/50 bg-surface-elevated">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">Lo que nos guía</p>
            <h2 className="mt-5 font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-5xl">
              Tres principios detrás de cada producción.
            </h2>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {pillars.map((pillar, index) => (
              <FeatureCard key={pillar.title} icon={pillar.icon} title={pillar.title} description={pillar.description} delay={index * 0.15} />
            ))}
          </div>
        </div>
      </section>

      {/* Cierre Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-accent/[0.03] via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[100px]" />

        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center lg:px-8 lg:py-36">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6 }}>
            <h2 className="font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-5xl">
              Tu historia recibirá una producción digna de ser escuchada.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-ink-muted">
              Empieza con una muestra de bajo riesgo. Sin grandes compromisos, sin presión — solo la calidad hablando por sí misma.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link href={routes.calculadora}>
                <Button variant="primary" className="group">
                  Calcular mi capítulo
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href={routes.contacto}>
                <Button variant="secondary">Hablar con el equipo</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}