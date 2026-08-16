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

  // Check if current route is a dashboard route (Author Dashboard or Admin Dashboard)
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

          // Fetch notifications
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

    // Setup Supabase Realtime subscription for notifications if user is logged in
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

    // Close popups on click outside
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
        
        {/* Brand Identity logo */}
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

        {/* Navigation - Hidden when user is logged in */}
        {!user && !loading && (
          <div className="hidden items-center gap-6 text-sm text-ink-muted md:flex">
            {links.map((link) => (
              <Link key={link.label} href={link.href} className="transition hover:text-ink">
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Notification Bell Icon - EXCLUSIVELY available on Dashboard & Admin routes for logged-in user */}
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
                {/* Unread badge */}
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
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 origin-top-right rounded-2xl border border-edge/80 bg-surface-elevated p-4 shadow-xl ring-1 ring-black/5 z-50 max-w-sm sm:max-w-none mx-auto sm:mx-0"
                  >
                    <div className="flex items-center justify-between border-b border-edge/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-accent" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-ink">
                          Notificaciones
                        </span>
                      </div>
                      {unreadCount > 0 ? (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="flex items-center gap-1 text-[10px] font-medium text-accent hover:underline cursor-pointer"
                        >
                          <CheckCheck className="h-3 w-3" />
                          <span>Marcar leídas</span>
                        </button>
                      ) : (
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-mono font-medium text-accent">
                          Al día
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
                      {activeNotifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-ink-muted">
                          <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-accent/60" />
                          <p className="font-medium text-ink">Sin notificaciones pendientes</p>
                          <p className="text-[11px] font-light mt-1 text-ink-muted/80">
                            Las actualizaciones de tu obra y avisos editoriales aparecerán aquí en tiempo real.
                          </p>
                        </div>
                      ) : (
                        activeNotifications.map((n) => {
                          const isUnread = n.status === 'pending' || n.status === 'sent';
                          return (
                            <div
                              key={n.id}
                              onClick={() => isUnread && handleMarkAsRead(n.id)}
                              className={`group relative flex items-start gap-3 rounded-xl border p-3 text-xs transition cursor-pointer ${
                                isUnread
                                  ? 'border-accent/40 bg-accent/5'
                                  : 'border-edge/50 bg-surface/50 opacity-80'
                              }`}
                            >
                              <div
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                                  isUnread
                                    ? 'bg-accent/20 text-accent'
                                    : 'bg-surface text-ink-muted'
                                }`}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </div>
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="font-medium text-ink truncate">{n.title}</p>
                                  {isUnread && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] font-light text-ink-muted leading-relaxed line-clamp-2">
                                  {n.message}
                                </p>
                                {n.createdAt && (
                                  <span className="block text-[9px] font-mono text-ink-muted/60 mt-1">
                                    {new Date(n.createdAt).toLocaleDateString('es-ES', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="mt-3 border-t border-edge/40 pt-2 text-center">
                      <span className="text-[10px] text-ink-muted/80">
                        Studio Flamkit & Art • Canal Oficial
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {loading ? (
            <div className="h-9 w-9 rounded-full border-edge/50 animate-pulse bg-surface-elevated" />
          ) : user ? (
            /* Logged In Dropdown Menu */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-edge/50 bg-surface-elevated py-1.5 px-3 sm:px-3.5 text-xs font-medium text-ink hover:border-accent hover:bg-surface transition cursor-pointer select-none active:scale-95"
                aria-label="Menú de perfil"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 text-ink-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-accent' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-edge/60 bg-surface-elevated p-2 shadow-xl ring-1 ring-black/5 z-50"
                  >
                    {/* Header profile info */}
                    <div className="px-3 py-2.5 mb-1.5 border-b border-edge/60 text-left">
                      <p className="text-xs font-semibold text-ink truncate leading-none">
                        {displayName}
                      </p>
                      <p className="mt-1 text-[10px] text-ink-muted truncate">
                        {displayEmail}
                      </p>
                      <div className="mt-2.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-accent/10 text-accent">
                        {role === 'admin' ? (
                          <>
                            <ShieldCheck className="h-2.5 w-2.5" />
                            Administrador
                          </>
                        ) : (
                          <>
                            <BookOpen className="h-2.5 w-2.5" />
                            Autor
                          </>
                        )}
                      </div>
                    </div>

                    {/* Navigation Actions */}
                    <div className="space-y-0.5">
                      {role === 'admin' ? (
                        <Link
                          href={routes.admin}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-surface transition"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                          <span>Panel de Admin</span>
                        </Link>
                      ) : (
                        <Link
                          href={routes.dashboard}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-surface transition"
                        >
                          <LayoutDashboard className="h-3.5 w-3.5 text-accent" />
                          <span>Centro del Autor</span>
                        </Link>
                      )}

                      <Link
                        href={routes.home}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink hover:bg-surface transition"
                      >
                        <Home className="h-3.5 w-3.5 text-ink-muted" />
                        <span>Volver a Inicio</span>
                      </Link>

                      {/* Divider */}
                      <div className="h-px bg-edge/60 my-1.5" />

                      {/* Studio links */}
                      <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-ink-muted select-none">
                        Explorar Estudio
                      </div>
                      
                      {links.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface transition"
                        >
                          <Compass className="h-3.5 w-3.5" />
                          <span>{link.label}</span>
                        </Link>
                      ))}

                      {/* Divider */}
                      <div className="h-px bg-edge/60 my-1.5" />

                      {/* Log out */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:text-rose-700 transition text-left cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Logged Out Actions */
            <div className="flex items-center gap-3">
              <Link href={routes.dashboard} className="hidden text-xs font-semibold text-ink-muted hover:text-ink transition sm:inline mr-1">
                Centro de Autor
              </Link>
              <Link href={routes.login} className="inline-flex">
                <Button variant="primary" className="text-xs py-1.5 px-4 h-9">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
