import { supabaseClient } from '@/lib/supabase/client';

export interface AuthUser {
  id: string;
  email?: string;
  full_name?: string;
  accessToken?: string;
}

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

export async function getUser() {
  const { data, error } = await supabaseClient.auth.getUser();
  if (error) throw error;
  return data.user as AuthUser | null;
}
