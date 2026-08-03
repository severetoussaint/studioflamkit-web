import React from 'react';
import Link from 'next/link';

const institutionalLinks = [
  { label: 'Sobre Studio Flamkit', href: '#sobre' },
  { label: 'Privacidad', href: '#privacidad' },
  { label: 'Términos', href: '#terminos' },
];

export function Footer() {
  return (
    <footer className="border-t border-edge bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 text-sm text-ink-muted lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-serif text-base font-semibold uppercase tracking-[0.18em] text-ink">Studio Flamkit & Art</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-muted">
            Ayudamos a autores independientes a convertir sus libros en experiencias de audio que amplían el alcance de su obra.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {institutionalLinks.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-ink">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-edge px-6 py-4 text-center text-xs uppercase tracking-[0.24em] text-ink-muted/70 lg:px-8">
        © 2026 Studio Flamkit & Art. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default Footer;