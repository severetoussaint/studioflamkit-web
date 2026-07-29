import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';

const links = [
  { label: 'Servicios', href: routes.servicios },
  { label: 'Calculadora', href: routes.calculadora },
  { label: 'Contacto', href: routes.contacto },
  { label: 'FAQ', href: routes.faq },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-800/80 bg-stone-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href={routes.home} className="text-lg font-semibold tracking-[0.24em] text-white uppercase">
          Studio Flamekit & Art
        </Link>

        <div className="hidden items-center gap-6 text-sm text-stone-400 md:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href={routes.dashboard} className="text-sm text-stone-300 transition hover:text-white">
            Centro del Autor
          </Link>
          <Link href={routes.login}>
            <Button variant="primary">Iniciar sesión</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
