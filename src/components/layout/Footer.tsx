import React from 'react';
import Link from 'next/link';

const institutionalLinks = [
  { label: 'Sobre Studio Flamkit', href: '#sobre' },
  { label: 'Privacidad', href: '#privacidad' },
  { label: 'Términos', href: '#terminos' },
];

export function Footer() {
  return (
    <footer className="border-t border-stone-800/80 bg-stone-950/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 text-sm text-stone-400 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-base font-semibold uppercase tracking-[0.24em] text-white">Studio Flamkit & Art</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-400">
            Producción sonora cinematográfica para autores que desean publicar una versión inmersiva de sus libros.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {institutionalLinks.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-stone-800/70 px-6 py-4 text-center text-xs uppercase tracking-[0.24em] text-stone-500 lg:px-8">
        © 2026 Studio Flamkit & Art. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default Footer;
