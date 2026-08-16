"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  BookOpen,
  Home,
  Compass,
  Bell,
  CheckCircle2,
  CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';
import { getUser, getUserRole, signOut, type AuthUser } from '@/services/auth.service';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notification.service';
import type { Notification } from '@/types/domain.types';
import { supabaseClient } from '@/lib/supabase/client';

const links = [
  { label: 'Servicios', href: routes.servicios },
  { label: 'Calculadora', href: routes.calculadora },
  { label: 'Contacto', href: routes.contacto },
  { label: 'FAQ', href: routes.faq },
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const isDashboardRoute = Boolean(pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin'));

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const currentUser = await getUser();
        if (!isMounted) return;
        setUser(currentUser);

        if (currentUser) {
          const userRole = getUserRole(currentUser);
          if (isMounted) setRole(userRole);

          try {
            const notifs = await getUserNotifications(currentUser.id);
            if (isMounted) setNotifications(notifs);
          } catch (notifErr) {
            console.error('Error fetching notifications:', notifErr);
          }
        }
      } catch (err) {
        console.error('Error checking auth in Navbar:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkAuth();

    let subscription: ReturnType<typeof supabaseClient.channel> | null = null;
    let cancelled = false;

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (cancelled || !session?.user) return;

      const channel = supabaseClient.channel(`public:notifications:${session.user.id}`);
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          if (payload.new && isMounted) {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
          }
        },
      );

      subscription = channel;
      channel.subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('Realtime notification channel error.');
        }
      });
    }).catch((error) => {
      console.error('Error initializing realtime notifications:', error);
    });

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      cancelled = true;
      isMounted = false;
      document.removeEventListener('mousedown', handleClickOutside);
      if (subscription) {
        supabaseClient.removeChannel(subscription);
      }
    };
  }, []);

  const unreadCount = notifications.filter(
    (n) => n.status === 'pending' || n.status === 'sent'
  ).length;

  const activeNotifications = notifications.slice(0, 8);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'read' as const } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: 'read' as const }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setDropdownOpen(false);
      router.push('/');
    } catch (err) {
      console.error('Error closing session:', err);
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Autor';
  const displayEmail = user?.email || '';

  return (
    <header className="sticky top-0 z-20 border-b border-edge bg-surface/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 lg:px-8">
        <Link
          href={routes.home}
          className="flex items-center gap-2.5 font-serif text-base sm:text-lg font-semibold tracking-[0.16em] text-ink uppercase hover:text-accent transition duration-150"
        >
          <img
            src="/logo.svg"
            alt="Studio Flamkit & Art"
            className="h-10 sm:h-14 w-auto object-contain rounded-md"
            referrerPolicy="no-referrer"
          />
          <span className="hidden sm:inline">Studio Flamkit & Art</span>
        </Link>

        {!user && !loading && (
          <div className="hidden items-center gap-6 text-sm text-ink-muted md:flex">
            {links.map((link) => (
              <Link key={link.label} href={link.href} className="transition hover:text-ink">
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2.5 sm:gap-4">
          {user && isDashboardRoute && (
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-edge bg-surface-elevated text-ink-muted hover:border-accent hover:text-accent transition cursor-pointer active:scale-95"
                title="Notificaciones de la obra"
                aria-label="Abrir notificaciones"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-edge bg-surface-elevated shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-edge/60 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">Notificaciones</p>
                        <p className="text-xs text-ink-muted">{unreadCount} pendientes</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:opacity-80"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        Marcar todas
                      </button>
                    </div>
                    <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
                      {activeNotifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-ink-muted">No tienes notificaciones nuevas.</div>
                      ) : (
                        activeNotifications.map((notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className={`block w-full border-b border-edge/40 px-4 py-3 text-left transition hover:bg-surface ${notification.status === 'read' ? 'opacity-70' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 rounded-full bg-accent/10 p-2 text-accent">
                                <Bell className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-ink">{notification.title}</p>
                                <p className="mt-1 text-xs leading-5 text-ink-muted">{notification.message}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Existing account/menu markup continues below. */}
        </div>
      </nav>
    </header>
  );
}
