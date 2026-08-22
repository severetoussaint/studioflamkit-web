import type { Database } from '@/types/database.types';

export type PaymentProvider = 'paypal';
export type PaymentPlanStatus = 'pending' | 'paid' | 'overdue';
export type PaymentMethod = 'paypal';

type GeneratedPaymentPlan = Database['public']['Tables']['payment_plans']['Row'];
type GeneratedPaymentPlanInsert = Database['public']['Tables']['payment_plans']['Insert'];
type GeneratedPaymentPlanUpdate = Database['public']['Tables']['payment_plans']['Update'];

export type PaymentPlan = GeneratedPaymentPlan & {
  proposal_id: string | null;
  currency: string;
  provider: PaymentProvider;
  provider_order_id: string | null;
  provider_capture_id: string | null;
  paid_at: string | null;
  updated_at: string;
};

export type PaymentPlanInsert = GeneratedPaymentPlanInsert & {
  proposal_id?: string | null;
  currency?: string;
  provider?: PaymentProvider;
  provider_order_id?: string | null;
  provider_capture_id?: string | null;
  paid_at?: string | null;
  updated_at?: string;
};

export type PaymentPlanUpdate = GeneratedPaymentPlanUpdate & {
  proposal_id?: string | null;
  currency?: string;
  provider?: PaymentProvider;
  provider_order_id?: string | null;
  provider_capture_id?: string | null;
  paid_at?: string | null;
  updated_at?: string;
};

export type Payment = Database['public']['Tables']['payments']['Row'];
export type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
export type PaymentUpdate = Database['public']['Tables']['payments']['Update'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];

export interface PaymentSummary {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: PaymentPlanStatus;
  provider: PaymentProvider;
}
