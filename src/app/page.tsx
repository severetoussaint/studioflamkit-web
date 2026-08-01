import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

const pillars = [
  {
    title: 'Dirección narrativa',
    description: 'Alineamos el tono, el ritmo y la dramaturgia para que cada escena suene con intención cinematográfica.',
  },
  {
    title: 'Diseño sonoro',
    description: 'Construimos paisajes sonoros, voces y atmósferas que elevan la lectura a una experiencia inmersiva.',
  },
  {
    title: 'Transparencia operacional',
    description: 'Seguimiento claro, entregas cronológicas y decisiones documentadas para que el proceso sea sencillo.',
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_30%),linear-gradient(135deg,_#09090b_0%,_#111827_50%,_#030712_100%)] text-stone-100">
      <Navbar />

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-400">
            Audiolibros cinematográficos para autores independientes
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Convertimos libros en experiencias sonoras que atraviesan la imaginación.
          </h1>
          <p className="mt-6 text-lg leading-8 text-stone-300">
            Studio Flamkit & Art transforma narrativa, voz y diseño sonoro en una propuesta editorial inmersiva para quienes desean publicar más allá de lo convencional.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#cotizacion">
              <Button variant="primary">Solicitar cotización</Button>
            </a>
            <a href="#servicios">
              <Button variant="secondary">Ver servicios</Button>
            </a>
          </div>
        </div>

        <Card className="border-amber-500/20 bg-stone-950/80">
          <div className="space-y-4">
            <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Proceso</p>
              <p className="mt-2 text-lg font-medium text-white">Narrativa • Dirección • Postproducción</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4">
                <p className="text-sm text-stone-400">Tiempo estimado</p>
                <p className="mt-1 text-2xl font-semibold text-white">2 a 4 semanas</p>
              </div>
              <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4">
                <p className="text-sm text-stone-400">Modalidad</p>
                <p className="mt-1 text-2xl font-semibold text-white">Remoto</p>
              </div>
            </div>
            <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-4 text-sm leading-6 text-stone-400">
              Cada proyecto recibe una guía operativa clara con decisiones creativas, tono editorial y estructura de entrega.
            </div>
          </div>
        </Card>
      </section>

      <section id="servicios" className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-400">Pilares del servicio</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Un método sobrio, íntimo y orientado a resultados.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title} title={pillar.title} description={pillar.description} />
          ))}
        </div>
      </section>

      <section id="cotizacion" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <Card className="border-amber-500/20 bg-gradient-to-br from-stone-950/90 to-stone-900/70">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-400">Cierre de proyecto</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                Tu libro merece una presentación sonora con identidad.
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-stone-300">
                Cuéntanos sobre tu obra y te devolvemos una propuesta clara, con alcance creativo, tiempos y presupuesto orientativo.
              </p>
            </div>

            <div className="rounded-3xl border border-stone-800 bg-stone-950/70 p-5">
              <div className="space-y-3">
                <Input label="Nombre" placeholder="Tu nombre" />
                <Input label="Correo" type="email" placeholder="correo@ejemplo.com" />
                <Input label="Proyecto" placeholder="Título o idea" />
                <Button variant="primary" className="w-full">
                  Solicitar propuesta
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
