'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  MessageSquare,
  BookOpen,
  Download,
  Wallet,
  Settings,
} from 'lucide-react';

export type DashboardNavSectionId = 'resumen' | 'mensajes' | 'capitulos' | 'entregables' | 'pagos' | 'perfil';

export interface BottomNavProps {
  activeSection: DashboardNavSectionId;
  onSectionChange: (section: DashboardNavSectionId) => void;
  chaptersCount?: number;
  unreadMessagesCount?: number;
}

export function BottomNav({
  activeSection,
  onSectionChange,
  chaptersCount = 0,
  unreadMessagesCount = 0,
}: BottomNavProps) {
  const navItems = [
    {
      id: 'resumen' as const,
      label: 'Resumen',
      icon: LayoutDashboard,
    },
    {
      id: 'mensajes' as const,
      label: 'Mensajes',
      icon: MessageSquare,
      badge: unreadMessagesCount > 0 ? String(unreadMessagesCount) : undefined,
    },
    {
      id: 'capitulos' as const,
      label: 'Capítulos',
      icon: BookOpen,
      badge: chaptersCount > 0 ? String(chaptersCount) : undefined,
    },
    {
      id: 'entregables' as const,
      label: 'Entregables',
      icon: Download,
    },
    {
      id: 'pagos' as const,
      label: 'Pagos',
      icon: Wallet,
    },
    {
      id: 'perfil' as const,
      label: 'Ajustes',
      icon: Settings,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block border-t border-edge/80 bg-surface-elevated/95 px-2 py-1.5 backdrop-blur-lg shadow-[0_-8px_24px_rgba(0,0,0,0.06)] lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSectionChange(item.id)}
              className={`relative flex flex-1 flex-col items-center justify-center py-1.5 px-1 text-center transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive ? 'text-accent' : 'text-ink-muted hover:text-ink'
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.75]'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-surface">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`mt-1 text-[11px] leading-none transition-all ${
                  isActive ? 'font-semibold text-accent' : 'font-normal text-ink-muted'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-1 h-1 w-6 rounded-full bg-accent"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
