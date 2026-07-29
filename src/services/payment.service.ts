import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export interface PaymentMilestone {
  id: 'initial' | 'final';
  label: string;
  percentage: number;
  status: 'pending' | 'paid' | 'scheduled';
}

export interface BillingStatus {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  milestones: PaymentMilestone[];
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  milestone: 'initial' | 'final';
  status: 'pending' | 'paid';
  createdAt: string;
}

export type PaymentPlanRow = Database['public']['Tables']['payment_plans']['Row'];
export type PaymentPlanInsert = Database['public']['Tables']['payment_plans']['Insert'];
export type PaymentPlanUpdate = Database['public']['Tables']['payment_plans']['Update'];

export type PaymentRow = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export type InvoiceRow = Database['public']['Tables']['invoices']['Row'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update'];

export function createPaymentPlan(totalAmount: number): PaymentMilestone[] {
  return [
    {
      id: 'initial',
      label: '50% inicial',
      percentage: 50,
      status: 'scheduled',
    },
    {
      id: 'final',
      label: '50% previo a entrega final',
      percentage: 50,
      status: 'scheduled',
    },
  ];
}

export function registerTransaction(amount: number, milestone: PaymentMilestone['id']): PaymentTransaction {
  return {
    id: `${milestone}-${Date.now()}`,
    amount,
    milestone,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

export function getBillingStatus(totalAmount: number): BillingStatus {
  const milestones = createPaymentPlan(totalAmount);
  return {
    totalAmount,
    paidAmount: 0,
    pendingAmount: totalAmount,
    milestones,
  };
}

export async function listPaymentPlans(projectId: string) {
  const { data, error } = await supabaseClient.from('payment_plans').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PaymentPlanRow[];
}

export async function createPaymentPlanRecord(input: PaymentPlanInsert) {
  const { data, error } = await supabaseClient.from('payment_plans').insert(input as never).select().single();
  if (error) throw error;
  return data as PaymentPlanRow | null;
}

export async function updatePaymentPlan(id: string, updates: PaymentPlanUpdate) {
  const { data, error } = await supabaseClient.from('payment_plans').update(updates as never).eq('id', id).select().single();
  if (error) throw error;
  return data as PaymentPlanRow | null;
}

export async function listPayments(paymentPlanId: string) {
  const { data, error } = await supabaseClient.from('payments').select('*').eq('payment_plan_id', paymentPlanId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PaymentRow[];
}

export async function recordPayment(input: PaymentInsert) {
  const { data, error } = await supabaseClient.from('payments').insert(input as never).select().single();
  if (error) throw error;
  return data as PaymentRow | null;
}

export async function createInvoice(input: InvoiceInsert) {
  const { data, error } = await supabaseClient.from('invoices').insert(input as never).select().single();
  if (error) throw error;
  return data as InvoiceRow | null;
}
