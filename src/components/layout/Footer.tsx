import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { routes } from '@/config/routes';

const institutionalLinks = [
  { label: 'Sobre Studio Flamkit', href: '#sobre' },
  { label: 'Privacidad', href: routes.privacidad },
  { label: 'Términos', href: '#terminos' },
];

export function Footer() {
  return (
    <footer className="border-t border-edge/50 bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 text-sm text-ink-muted lg:grid lg:grid-cols-3 lg:items-center lg:justify-between lg:px-8">
        <div className="text-center lg:text-left lg:justify-self-start">
          <p className="font-serif text-base font-semibold uppercase tracking-[0.18em] text-ink">Studio Flamkit & Art</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-muted mx-auto lg:mx-0">
            Ayudamos a autores independientes a convertir sus libros en experiencias de audio que amplían el alcance de su obra.
          </p>
        </div>

        <div className="flex justify-center items-center py-4 lg:py-0 lg:justify-self-center">
          <Image
            src="/logo.svg"
            alt="Studio Flamkit & Art Logo"
            width={144}
            height={144}
            className="h-28 sm:h-36 w-auto object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex flex-wrap justify-center lg:justify-end gap-4 lg:justify-self-end w-full">
          {institutionalLinks.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-ink">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-edge/50 px-6 py-4 text-center text-xs uppercase tracking-[0.24em] text-ink-muted/70 lg:px-8">
        © 2026 Studio Flamkit & Art. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default Footer;