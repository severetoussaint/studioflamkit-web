export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type PaymentStatus = 'pending' | 'partial' | 'paid';

export interface Quote {
  id: string;
  project_id: string;
  amount: number;
  deposit_percentage: number;
  status: QuoteStatus;
  created_at: string;
}

export interface Payment {
  id: string;
  quote_id: string;
  amount: number;
  status: PaymentStatus;
  paid_at?: string;
  created_at: string;
}

export interface PaymentSummary {
  quoteAmount: number;
  paidAmount: number;
  remainingAmount: number;
}
