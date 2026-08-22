import type { Database } from '@/types/database.types';

export type PaymentProvider = 'paypal';
export type PaymentPlanStatus = 'pending' | 'paid' | 'overdue';
export type PaymentMethod = 'paypal';

export type PaymentPlan = Database['public']['Tables']['payment_plans']['Row'];
export type PaymentPlanInsert = Database['public']['Tables']['payment_plans']['Insert'];
export type PaymentPlanUpdate = Database['public']['Tables']['payment_plans']['Update'];

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
