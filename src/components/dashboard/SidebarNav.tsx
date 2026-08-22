'use client';

import React from 'react';
import Link from 'next/link';
import { Headphones, MessageCircle } from 'lucide-react';

export interface NavSection<T extends string = string> {
  id: T;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export interface SidebarNavProps<T extends string = string> {
  sections: NavSection<T>[];
  activeSection: T;
  onSectionChange: (sectionId: T) => void;
  onContactClick?: () => void;
}

export function SidebarNav<T extends string = string>({
  sections,
  activeSection,
  onSectionChange,
  onContactClick,
}: SidebarNavProps<T>) {
  return (
    <aside className="hidden lg:block space-y-6 lg:sticky lg:top-20 self-start">
      <div className="rounded-3xl border-edge bg-surface-elevated p-3 shadow-xs">
        <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
          Navegación
        </p>
        <nav className="mt-1 flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSectionChange(section.id)}
                className={`group relative flex shrink-0 items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ease-out cursor-pointer active:scale-[0.98] ${
                  isActive
                    ? 'border-accent/30 bg-accent/10 text-accent shadow-2xs font-semibold'
                    : 'border-transparent text-ink-muted hover:border-edge hover:bg-surface hover:text-ink hover:-translate-y-0.5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-transform duration-200 ease-out group-hover:scale-110 ${
                      isActive ? 'text-accent' : 'text-ink-muted'
                    }`}
                    strokeWidth={1.75}
                  />
                  <span>{section.label}</span>
                </div>
                {section.badge ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-accent/20 text-accent'
                        : 'bg-surface border-edge text-ink-muted'
                    }`}
                  >
                    {section.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Widget informativo de soporte en la columna izquierda */}
      <div className="hidden rounded-3xl border-edge bg-surface-elevated p-5 shadow-xs lg:block">
        <div className="flex items-center gap-2 text-accent">
          <Headphones className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Atención Directa
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          ¿Tienes alguna consulta sobre la locución o edición? Tu productor asignado está disponible.
        </p>
        {onContactClick ? (
          <button
            type="button"
            onClick={onContactClick}
            className="group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-edge bg-surface px-3 py-2.5 text-xs font-medium text-ink transition-all duration-200 ease-out hover:border-accent/40 hover:text-accent hover:-translate-y-0.5 active:scale-[0.98] shadow-2xs cursor-pointer"
          >
            <MessageCircle className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:scale-110" />
            <span>Contactar Productor</span>
          </button>
        ) : (
          <Link
            href="/contacto"
            className="group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-edge bg-surface px-3 py-2.5 text-xs font-medium text-ink transition-all duration-200 ease-out hover:border-accent/40 hover:text-accent hover:-translate-y-0.5 active:scale-[0.98] shadow-2xs"
          >
            <MessageCircle className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:scale-110" />
            <span>Contactar Productor</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
