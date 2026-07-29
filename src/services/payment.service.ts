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
