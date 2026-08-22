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

const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

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
    const orderId = String(body?.orderId ?? '').trim();
    if (!paymentPlanId || !orderId) throw new Error('paymentPlanId and orderId are required.');

    const { data: plan, error: planError } = await supabase
      .from('payment_plans')
      .select('id, project_id, proposal_id, amount, currency, provider, provider_order_id, status, percentage')
      .eq('id', paymentPlanId)
      .single();
    if (planError || !plan) throw new Error('Payment plan not found.');
    if (plan.provider !== 'paypal') throw new Error('Payment plan is not configured for PayPal.');
    if (plan.status !== 'pending') throw new Error(`Payment plan is not pending (status=${plan.status}).`);
    if (plan.provider_order_id !== orderId) throw new Error('PayPal order does not match the payment plan.');

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, author_id, proposal_id')
      .eq('id', plan.project_id)
      .single();
    if (projectError || !project || project.author_id !== user.id) throw new Error('Not authorized for this payment plan.');

    const accessToken = await getPayPalAccessToken();
    const captureResponse = await fetch(`${paypalApiBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `studioflamkit-capture-${paymentPlanId}-${orderId}`,
      },
      body: '{}',
    });

    const captured = await captureResponse.json();
    if (!captureResponse.ok && captured?.name !== 'UNPROCESSABLE_ENTITY') {
      throw new Error(captured.message ?? 'PayPal capture failed.');
    }

    let captureId: string | null = null;
    let status = String(captured?.status ?? '');
    let amount = Number(plan.amount);
    let currency = String(plan.currency ?? 'USD').toUpperCase();

    if (status === 'COMPLETED') {
      captureId = captured?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
      amount = Number(captured?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? amount);
      currency = String(captured?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code ?? currency).toUpperCase();
    } else {
      const orderResponse = await fetch(`${paypalApiBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (orderResponse.ok) {
        const order = await orderResponse.json();
        status = String(order?.status ?? status);
        captureId = order?.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
        amount = Number(order?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value ?? amount);
        currency = String(order?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code ?? currency).toUpperCase();
      }
    }

    if (status !== 'COMPLETED' || !captureId) {
      return new Response(JSON.stringify({ orderId, status, captureId: null }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: paymentId, error: confirmationError } = await supabase.rpc('mark_paypal_payment_paid', {
      p_payment_plan_id: paymentPlanId,
      p_order_id: orderId,
      p_capture_id: captureId,
      p_amount: amount,
      p_currency: currency,
    });
    if (confirmationError) throw confirmationError;

    return new Response(JSON.stringify({ orderId, captureId, status, paymentId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('paypal-capture-order error', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to capture PayPal order.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
