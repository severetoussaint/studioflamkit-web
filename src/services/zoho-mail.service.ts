import { supabaseClient } from '@/lib/supabase/client';

export interface SendStudioFlamkitEmailInput {
  toAddress: string;
  subject: string;
  content: string;
}

export async function sendStudioFlamkitEmail(input: SendStudioFlamkitEmailInput) {
  const { data, error } = await supabaseClient.functions.invoke('send-studioflamkit-email', {
    body: input,
  });

  if (error) throw error;
  if (data?.error) {
    const detail = data.code ? ` (${data.code})` : '';
    throw new Error(`${data.error}${detail}`);
  }

  return data as { ok: true; provider: 'zoho'; response: unknown };
}
