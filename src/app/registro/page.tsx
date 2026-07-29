"use client";

import React, { useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { signUp } from '@/services/auth.service';

export default function RegistroPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await signUp(email, password, fullName);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_25%),linear-gradient(135deg,_#09090b_0%,_#111827_50%,_#030712_100%)] text-stone-100">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-xl">
          <Card className="border-stone-800/80 bg-stone-950/80">
            <div className="mb-6">
              <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-400">Registro</p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Crea tu cuenta de autor</h1>
              <p className="mt-3 text-sm leading-7 text-stone-400">
                Regístrate para acceder a tu centro de proyecto y revisar el avance de tu obra.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input label="Nombre completo" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Ana Pérez" />
              <Input label="Correo" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="autor@ejemplo.com" />
              <Input label="Contraseña" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
              <Button variant="primary" className="w-full" type="submit">
                Crear cuenta
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
