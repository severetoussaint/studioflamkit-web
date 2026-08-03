import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { routes } from '@/config/routes';

const links = [
  { label: 'Servicios', href: routes.servicios },
  { label: 'Calculadora', href: routes.calculadora },
  { label: 'Contacto', href: routes.contacto },
  { label: 'FAQ', href: routes.faq },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-edge bg-surface/85 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href={routes.home} className="font-serif text-lg font-semibold tracking-[0.18em] text-ink uppercase">
          Studio Flamkit & Art
        </Link>

        <div className="hidden items-center gap-6 text-sm text-ink-muted md:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-ink">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href={routes.dashboard} className="hidden text-sm text-ink-muted transition hover:text-ink sm:inline">
            Centro del Autor
          </Link>
          <Link href={routes.login} className="inline-flex">
            <Button variant="primary">Iniciar sesión</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;