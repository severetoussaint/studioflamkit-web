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
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
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

  // Fetch real notifications from Supabase when on dashboard routes and authenticated
  useEffect(() => {
    let active = true;
    if (user && isDashboardRoute) {
      getUserNotifications(user.id).then((items) => {
        if (active) setNotifications(items);
      });
    }
    return () => {
      active = false;
    };
  }, [user, isDashboardRoute]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeNotifications = user && isDashboardRoute ? notifications : [];
  const unreadCount = activeNotifications.filter((n) => n.status === 'pending' || n.status === 'sent').length;

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
    );
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllNotificationsAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
