import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';

const steps = [
  {
    number: '01',
    title: 'Escucha una muestra',
    description: 'Un Audio Trailer o Capítulo Piloto para que evalúes la calidad real antes de comprometerte con la obra completa.',
  },
  {
    number: '02',
    title: 'Avanza capítulo a capítulo',
    description: 'Si decides continuar, la producción avanza y se factura por capítulo — transparente y sin grandes pagos por adelantado.',
  },
  {
    number: '03',
    title: 'Tu obra, lista para el mundo',
    description: 'Entrega final master, lista para publicación, con el mismo cuidado narrativo de principio a fin.',
  },
];

const pillars = [
  {
    title: 'Respeto por la obra',
    description: 'Tratamos cada libro como una creación única — nunca como un simple proyecto de audio.',
  },
  {
    title: 'Calidad sin compromisos',
    description: 'Cada producción cumple un estándar profesional, desde la narración hasta la entrega final.',
  },
  {
    title: 'Narrativa primero',
    description: 'El universo creativo del autor siempre está por encima de la tecnología. El audio existe para potenciar la obra, nunca para opacarla.',
  },
];

const aboutPoints = [
  {
    title: 'Una mirada editorial',
    description: 'Entendemos que cada libro tiene una identidad propia y un público distinto. Por eso cada propuesta se adapta a la obra, no al revés.',
  },
  {
    title: 'Una producción cercana',
    description: 'Trabajamos con una lógica de acompañamiento más humana: cercana, clara y orientada a que el autor se sienta acompañado en cada etapa.',
  },
  {
    title: 'Sonido con propósito',
    description: 'La música, la voz y la mezcla no decoran: sostienen la emoción, la tensión y la memoria de la historia.',
  },
  {
    title: 'Escucha, no solo producción',
    description: 'Creemos en construir una experiencia sensorial que ayude a que la obra llegue a más personas y se recuerde con más fuerza.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-edge">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,_var(--color-accent)_0%,_transparent_28%)] opacity-[0.10]" />
        <div className="relative mx-auto max-w-5xl px-6 py-28 text-center lg:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.36em] text-accent">
            Audiolibros cinematográficos para autores independientes
          </p>
          <h1 className="mt-6 font-serif text-5xl font-medium leading-tight text-ink sm:text-6xl lg:text-7xl">
            Ayudamos a que tu libro
            <br />
            llegue más lejos.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-ink-muted">
            Studio Flamkit & Art transforma libros en experiencias de audio cinematográficas —
            diseñadas para ampliar el alcance de tu obra, fortalecer tu marca como autor
            y conectar con nuevos lectores.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href={routes.calculadora}>
              <Button variant="primary">Calcular mi capítulo</Button>
            </Link>
            <Link href={routes.servicios}>
              <Button variant="secondary">Ver servicios</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Filosofía */}
      <section className="border-b border-edge bg-surface-elevated">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-8">
          <p className="font-serif text-3xl italic leading-relaxed text-ink sm:text-4xl">
            &ldquo;No solo producimos audio; damos una nueva forma de vivir tu historia.&rdquo;
          </p>
          <p className="mt-6 text-sm uppercase tracking-[0.28em] text-ink-muted">
            Nuestra filosofía
          </p>
        </div>
      </section>

      {/* Sobre nosotros */}
      <section id="sobre" className="scroll-mt-20 border-b border-edge bg-surface-elevated">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">Sobre nosotros</p>
              <h2 className="mt-4 font-serif text-3xl font-medium text-ink sm:text-4xl">
                Studio Flamkit & Art transforma la lectura en una experiencia íntima y cinematográfica.
              </h2>
              <p className="mt-6 text-base leading-8 text-ink-muted">
                Nacemos para acompañar a autores independientes que quieren llevar su obra más allá del papel y hacerla sentir, escuchar y recordar con mayor fuerza.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {aboutPoints.map((point) => (
                <div key={point.title} className="rounded-3xl border border-edge bg-surface p-6">
                  <h3 className="font-serif text-xl font-medium text-ink">{point.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-ink-muted">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cómo trabajamos */}
      <section className="border-b border-edge">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">Cómo trabajamos</p>
            <h2 className="mt-4 font-serif text-3xl font-medium text-ink sm:text-4xl">
              Un proceso por etapas, pensado para reducir tu riesgo.
            </h2>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="border-t border-edge pt-6">
                <span className="font-serif text-4xl text-accent">{step.number}</span>
                <h3 className="mt-4 text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="border-b border-edge bg-surface-elevated">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">Lo que nos guía</p>
            <h2 className="mt-4 font-serif text-3xl font-medium text-ink sm:text-4xl">
              Tres principios detrás de cada producción.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="rounded-3xl border border-edge bg-surface p-8">
                <h3 className="font-serif text-xl font-medium text-ink">{pillar.title}</h3>
                <p className="mt-4 text-sm leading-7 text-ink-muted">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cierre */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-28 text-center lg:px-8">
          <h2 className="font-serif text-3xl font-medium text-ink sm:text-4xl">
            Tu historia recibirá una producción digna de ser escuchada.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-ink-muted">
            Empieza con una muestra de bajo riesgo. Sin grandes compromisos, sin presión —
            solo la calidad hablando por sí misma.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href={routes.calculadora}>
              <Button variant="primary">Calcular mi capítulo</Button>
            </Link>
            <Link href={routes.contacto}>
              <Button variant="secondary">Hablar con el equipo</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}