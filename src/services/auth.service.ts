import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

const ADMIN_EMAILS = ['joens.contact@gmail.com'];

export interface AuthUser {
  id: string;
  email?: string;
  full_name?: string;
  accessToken?: string;
  user_metadata?: {
    role?: string;
    full_name?: string;
    [key: string]: unknown;
  };
  app_metadata?: {
    role?: string;
    [key: string]: unknown;
  };
}

export type UserProfileRow = Database['public']['Tables']['authors']['Row'];
export type UserProfileInsert = Database['public']['Tables']['authors']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['authors']['Update'];

export async function signIn(email: string, password: string) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
}

export async function getUser(): Promise<AuthUser | null> {
  try {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();

    if (error) {
      if (error.name === "AuthSessionMissingError") {
        return null;
      }

      console.error(error);
      return null;
    }

    return user as AuthUser | null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function getUserRole(user: AuthUser | null | undefined): string | null {
  const normalizedEmail = user?.email?.toLowerCase();

  if (normalizedEmail && ADMIN_EMAILS.includes(normalizedEmail)) {
    return 'admin';
  }

  return user?.user_metadata?.role ?? user?.app_metadata?.role ?? null;
}

export async function upsertUserProfile(input: UserProfileInsert) {
  const { data, error } = await supabaseClient.from('authors').upsert(input as never).select().single();
  if (error) throw error;
  return data as UserProfileRow | null;
}

export async function updateUserProfile(id: string, updates: UserProfileUpdate) {
  const { data, error } = await supabaseClient.from('authors').update(updates as never).eq('id', id).select().single();
  if (error) throw error;
  return data as UserProfileRow | null;
}
