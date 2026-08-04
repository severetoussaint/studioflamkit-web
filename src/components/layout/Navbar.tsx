"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard, 
  ShieldCheck, 
  BookOpen, 
  Home, 
  Menu, 
  X,
  Compass,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { routes } from '@/config/routes';
import { getUser, getUserRole, signOut, type AuthUser } from '@/services/auth.service';
import { supabaseClient } from '@/lib/supabase/client';

const links = [
  { label: 'Servicios', href: routes.servicios },
  { label: 'Calculadora', href: routes.calculadora },
  { label: 'Contacto', href: routes.contacto },
  { label: 'FAQ', href: routes.faq },
];

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const currentUser = await getUser();
      if (!isMounted) return;
      if (currentUser) {
        setUser(currentUser);
        setRole(getUserRole(currentUser));
      }
      setLoading(false);
    }

    loadSession();

    // Listen to real-time auth state updates
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        const u = session.user as AuthUser;
        setUser(u);
        setRole(getUserRole(u));
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        
        {/* Brand Identity logo */}
        <Link 
          href={routes.home} 
          className="flex items-center gap-2.5 font-serif text-base sm:text-lg font-semibold tracking-[0.16em] text-ink uppercase hover:text-accent transition duration-150"
        >
          <img 
            src="/logo.svg" 
            alt="Studio Flamkit & Art" 
            className="h-12 sm:h-16 w-auto object-contain rounded-md" 
            referrerPolicy="no-referrer"
          />
          <span>Studio Flamkit & Art</span>
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
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {loading ? (
            <div className="h-8 w-8 rounded-full border border-edge animate-pulse bg-surface-elevated" />
          ) : user ? (
            /* Logged In Dropdown Menu */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-edge bg-surface-elevated py-1.5 px-3.5 text-xs font-medium text-ink hover:border-accent hover:bg-surface transition cursor-pointer select-none"
              >
                <div className="flex h-5.5 w-5.5 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <User className="h-3 w-3" />
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown className={`h-3 w-3 text-ink-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-edge bg-surface-elevated p-2 shadow-xl ring-1 ring-black/5 z-30"
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

                      {/* Repeated options hidden from navbar but visible here */}
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