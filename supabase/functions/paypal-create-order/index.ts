import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function env(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function paypalApiBase(): string {
  return Deno.env.get('PAYPAL_ENV') === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function getPayPalAccessToken(): Promise<string> {
  const credentials = btoa(`${env('PAYPAL_CLIENT_ID')}:${env('PAYPAL_CLIENT_SECRET')}`);
  const response = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.message ?? 'Unable to authenticate with PayPal.');
  }
  return data.access_token as string;
}

function getBearer(req: Request): string {
  const header = req.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) throw new Error('Authentication required.');
  return header.slice('Bearer '.length);
}

const supabaseUrl = env('SUPABASE_URL');
const serviceRoleKey = env('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function getAuthenticatedUser(req: Request) {
  const bearer = getBearer(req);
  const { data, error } = await supabase.auth.getUser(bearer);
  if (error || !data.user) throw new Error('Authentication required.');
  return data.user;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed.' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();
    const paymentPlanId = String(body?.paymentPlanId ?? '').trim();
    if (!paymentPlanId) throw new Error('paymentPlanId is required.');

    const { data: plan, error: planError } = await supabase
      .from('payment_plans')
      .select('id, project_id, proposal_id, amount, currency, provider, provider_order_id, status, percentage')
      .eq('id', paymentPlanId)
      .single();
    if (planError || !plan) throw new Error('Payment plan not found.');
    if (plan.provider !== 'paypal') throw new Error('Payment plan is not configured for PayPal.');
    if (plan.status !== 'pending') throw new Error(`Payment plan is not pending (status=${plan.status}).`);
    if (plan.percentage !== 100) throw new Error('Studio FLAMKIT payment plans require full payment.');

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, author_id, proposal_id, manuscript_id, status')
      .eq('id', plan.project_id)
      .single();
    if (projectError || !project || project.author_id !== user.id) throw new Error('Not authorized for this payment plan.');

    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('id, amount, currency, status, version')
      .eq('id', plan.proposal_id)
      .single();
    if (proposalError || !proposal || proposal.status !== 'accepted') throw new Error('Accepted proposal not found.');

    const { data: manuscript } = await supabase
      .from('manuscripts')
      .select('title')
      .eq('id', project.manuscript_id)
      .maybeSingle();

    const accessToken = await getPayPalAccessToken();

    if (plan.provider_order_id) {
      const existingResponse = await fetch(`${paypalApiBase()}/v2/checkout/orders/${encodeURIComponent(plan.provider_order_id)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (existingResponse.ok) {
        const existing = await existingResponse.json();
        if (existing.status === 'CREATED' || existing.status === 'APPROVED') {
          return new Response(JSON.stringify({ orderId: existing.id, status: existing.status }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (existing.status === 'COMPLETED') {
          throw new Error('PayPal order is already completed; waiting for payment confirmation.');
        }
      }
    }

    const amount = Number(plan.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid payment amount.');
    const currency = String(plan.currency || proposal.currency || 'USD').toUpperCase();

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          custom_id: paymentPlanId,
          description: `Studio FLAMKIT — ${manuscript?.title ?? 'Producción de audio'} — Propuesta v${proposal.version}`,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
      application_context: {
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
      },
    };

    const createResponse = await fetch(`${paypalApiBase()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `studioflamkit-${paymentPlanId}-${crypto.randomUUID()}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const created = await createResponse.json();
    if (!createResponse.ok || !created.id) {
      throw new Error(created.message ?? 'PayPal order creation failed.');
    }

    const { error: updateError } = await supabase
      .from('payment_plans')
      .update({ provider_order_id: created.id, updated_at: new Date().toISOString() })
      .eq('id', paymentPlanId);
    if (updateError) throw updateError;

    return new Response(JSON.stringify({ orderId: created.id, status: created.status }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('paypal-create-order error', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to create PayPal order.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
