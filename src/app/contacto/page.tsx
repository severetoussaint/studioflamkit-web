"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Mail, MessageSquare, Send, User, Book, FileText, ArrowRight, CheckCircle, Heart } from 'lucide-react';

const contactPoints = [
  {
    icon: MessageSquare,
    title: 'Primera conversación',
    description: 'Te escuchamos con interés para entender el tono, la intención y el alcance del proyecto.',
  },
  {
    icon: FileText,
    title: 'Propuesta orientativa',
    description: 'Te devolvemos una idea clara de enfoque, tiempos y alcance para que tomes una decisión informada.',
  },
];

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    titulo: '',
    mensaje: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

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
              Contacto
              <span className="h-px w-8 bg-accent/50" />
            </p>

            <h1 className="mt-6 font-serif text-4xl font-medium leading-tight text-ink sm:text-5xl lg:text-6xl">
              Hablemos sobre tu obra y su próxima versión sonora.
            </h1>

            <p className="mt-6 text-lg leading-8 text-ink-muted">
              Completa este formulario para iniciar una conversación creativa y recibir una propuesta orientativa.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="mt-12 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]"
          >
            {/* Contact Points */}
            <div className="space-y-4">
              {contactPoints.map((point, index) => (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                >
                  <Card className="group hover:border-accent/30 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300">
                        <point.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="font-serif text-xl font-medium text-ink">{point.title}</h2>
                        <p className="mt-2 text-sm leading-7 text-ink-muted">{point.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {/* Additional Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="rounded-3xl border border-edge/50 bg-surface-elevated p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-5 w-5 text-accent" />
                  <h3 className="font-serif text-lg font-medium text-ink">¿Por qué contactarnos?</h3>
                </div>
                <ul className="space-y-2 text-sm text-ink-muted">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    Respuesta en menos de 48 horas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    Asesoramiento personalizado
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    Sin compromiso de contratación
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Contact Form */}
            <Card className="border-accent/20">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-medium text-ink">Envíanos un mensaje</h3>
                    <p className="text-xs text-ink-muted">Te responderemos lo antes posible</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Nombre"
                    placeholder="Tu nombre"
                    icon={User}
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                  <Input
                    label="Correo"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    icon={Mail}
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  />
                </div>

                <Input
                  label="Título de la obra"
                  placeholder="Título o proyecto"
                  icon={Book}
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                />

                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.28em] text-ink-muted">Mensaje</span>
                  <textarea
                    rows={5}
                    placeholder="Cuéntanos qué quieres transformar en una experiencia sonora"
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    className="w-full rounded-3xl border border-edge/50 bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-accent/70 focus:ring-2 focus:ring-accent/20 resize-none"
                  />
                </label>

                <Button variant="primary" className="w-full group" type="submit">
                  Enviar solicitud
                  <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>

                <p className="text-xs text-center text-ink-muted">
                  Al enviar este formulario aceptas nuestra política de privacidad.
                </p>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b border-edge/50 bg-surface-elevated">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-8 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl lg:text-5xl">
              ¿Tienes preguntas antes de escribirnos?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-ink-muted">
              Consulta nuestras preguntas frecuentes para resolver tus dudas más comunes.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link href="/faq">
                <Button variant="secondary" className="group">
                  Ver preguntas frecuentes
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/servicios">
                <Button variant="secondary">Explorar servicios</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
