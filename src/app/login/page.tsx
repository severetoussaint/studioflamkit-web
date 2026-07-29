"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
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
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_25%),linear-gradient(135deg,_#09090b_0%,_#111827_50%,_#030712_100%)] text-stone-100">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-xl">
          <Card className="border-stone-800/80 bg-stone-950/80">
            <div className="mb-6">
              <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-400">Acceso</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Inicia sesión como autor</h1>
              <p className="mt-3 text-sm leading-7 text-stone-400">
                Gestiona tus proyectos, capítulos y entregables desde este espacio privado.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input label="Correo" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="autor@ejemplo.com" />
              <Input label="Contraseña" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
              {error ? <p className="text-sm text-rose-400">{error}</p> : null}
              <Button variant="primary" className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-stone-400">
              ¿No tienes cuenta?{' '}
              <a href="/registro" className="font-medium text-amber-400 transition hover:text-amber-300">
                Crear una cuenta
              </a>
            </p>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
