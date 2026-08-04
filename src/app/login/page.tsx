"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Mail, Lock, Sparkles, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { signIn, getUserRole, type AuthUser } from '@/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await signIn(email, password);
      const role = getUserRole(response.user as AuthUser | null) ?? 'author';
      router.push(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión. Por favor verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Conectando con tu cabina editorial..." />;
  }

  return (
    <main className="min-h-screen bg-surface text-ink transition-colors duration-200">
      <Navbar />

      {/* Decorative background elements */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-accent)_0%,_transparent_40%)] opacity-[0.08]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] bg-[radial-gradient(circle_at_bottom_left,_var(--color-accent)_0%,_transparent_50%)] opacity-[0.05]" />

        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <Card className="relative border-edge bg-surface-elevated/60 shadow-xl backdrop-blur-md p-8 sm:p-10 rounded-3xl">
                {/* Visual Icon Badge */}
                <div className="mb-8 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-medium uppercase tracking-[0.25em] text-accent">
                    <Sparkles className="h-3.5 w-3.5" />
                    Acceso Autor
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-edge bg-surface text-accent shadow-inner">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>

                <div className="mb-6">
                  <h1 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
                    Inicia sesión en tu Centro
                  </h1>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                    Gestiona tu producción audiocinematográfica, aprueba capítulos y descarga tus masters en alta resolución.
                  </p>
                </div>

                {error ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-600 dark:text-rose-400 font-medium"
                  >
                    {error}
                  </motion.div>
                ) : null}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-4 top-[32px] flex items-center text-ink-muted">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      label="Correo Electrónico"
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="autor@ejemplo.com"
                      className="pl-11"
                    />
                  </div>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-4 top-[32px] flex items-center text-ink-muted">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      label="Contraseña"
                      type="password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className="pl-11"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-ink-muted hover:text-ink transition">
                      <input type="checkbox" className="rounded-md border-edge text-accent focus:ring-accent" />
                      <span>Recordarme</span>
                    </label>
                    <a href="#" className="font-medium text-accent hover:underline">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full mt-6 flex items-center gap-2 py-3"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span>Ingresando...</span>
                    ) : (
                      <>
                        <span>Ingresar a mi Cuenta</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-8 border-t border-edge/60 pt-6 text-center">
                  <p className="text-xs text-ink-muted">
                    ¿Aún no eres autor de Studio Flamkit?{' '}
                    <a href="/registro" className="font-semibold text-accent hover:underline">
                      Regístrate ahora
                    </a>
                  </p>
                </div>

                {/* Trust Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-surface/50 border border-edge/40 px-4 py-2.5 text-[11px] text-ink-muted">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  <span>Conexión cifrada y resguardo de propiedad intelectual</span>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
