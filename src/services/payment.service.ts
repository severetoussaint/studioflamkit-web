import { supabaseClient } from '@/lib/supabase/client';
import type { Invoice, Invoice as InvoiceDomain, Payment, PaymentInsert, PaymentPlan, PaymentPlanInsert, PaymentPlanUpdate } from '@/types/payment';

export type PaymentPlanRow = PaymentPlan;
export type PaymentRow = Payment;
export type InvoiceRow = InvoiceDomain;
export type InvoiceInsertRow = Invoice;

export async function listPaymentPlans(projectId: string): Promise<PaymentPlanRow[]> {
  const { data, error } = await supabaseClient
    .from('payment_plans')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PaymentPlanRow[];
}

export async function getPaymentPlanForProposal(proposalId: string): Promise<PaymentPlanRow | null> {
  const { data, error } = await supabaseClient
    .from('payment_plans')
    .select('*')
    .filter('proposal_id', 'eq', proposalId)
    .maybeSingle();
  if (error) throw error;
  return data as PaymentPlanRow | null;
}

export async function getPaymentPlanForProject(projectId: string): Promise<PaymentPlanRow | null> {
  const { data, error } = await supabaseClient
    .from('payment_plans')
    .select('*')
    .eq('project_id', projectId)
    .eq('installment_number', 1)
    .order('created_at', { ascending: false })
    .maybeSingle();
  if (error) throw error;
  return data as PaymentPlanRow | null;
}

export async function listPayments(paymentPlanId: string): Promise<PaymentRow[]> {
  const { data, error } = await supabaseClient
    .from('payments')
    .select('*')
    .eq('payment_plan_id', paymentPlanId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PaymentRow[];
}

export async function createPaymentPlanRecord(input: PaymentPlanInsert): Promise<PaymentPlanRow | null> {
  const { data, error } = await supabaseClient
    .from('payment_plans')
    .insert(input as never)
    .select()
    .single();
  if (error) throw error;
  return data as PaymentPlanRow | null;
}

export async function updatePaymentPlan(id: string, updates: PaymentPlanUpdate): Promise<PaymentPlanRow | null> {
  const { data, error } = await supabaseClient
    .from('payment_plans')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as PaymentPlanRow | null;
}

export async function recordPayment(input: PaymentInsert): Promise<PaymentRow | null> {
  const { data, error } = await supabaseClient
    .from('payments')
    .insert(input as never)
    .select()
    .single();
  if (error) throw error;
  return data as PaymentRow | null;
}

export async function createInvoice(input: InvoiceInsertRow): Promise<InvoiceRow | null> {
  const { data, error } = await supabaseClient
    .from('invoices')
    .insert(input as never)
    .select()
    .single();
  if (error) throw error;
  return data as InvoiceRow | null;
}

export async function getPayPalClientToken(): Promise<string> {
  const { data, error } = await supabaseClient.functions.invoke('paypal-client-token', {
    body: {},
  });
  if (error) throw error;
  if (!data?.accessToken) throw new Error('PayPal client token was not returned.');
  return data.accessToken as string;
}

export async function createPayPalOrder(paymentPlanId: string): Promise<{ orderId: string; status: string }> {
  const { data, error } = await supabaseClient.functions.invoke('paypal-create-order', {
    body: { paymentPlanId },
  });
  if (error) throw error;
  if (!data?.orderId) throw new Error('PayPal order was not created.');
  return data as { orderId: string; status: string };
}

export async function capturePayPalOrder(paymentPlanId: string, orderId: string): Promise<{ orderId: string; captureId: string; status: string }> {
  const { data, error } = await supabaseClient.functions.invoke('paypal-capture-order', {
    body: { paymentPlanId, orderId },
  });
  if (error) throw error;
  if (!data?.captureId) throw new Error('PayPal capture was not confirmed.');
  return data as { orderId: string; captureId: string; status: string };
}
