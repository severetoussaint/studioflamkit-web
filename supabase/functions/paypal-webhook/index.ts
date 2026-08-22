import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

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

async function verifyWebhook(req: Request, event: unknown): Promise<boolean> {
  const accessToken = await getPayPalAccessToken();
  const webhookId = env('PAYPAL_WEBHOOK_ID');
  const payload = {
    transmission_id: req.headers.get('paypal-transmission-id'),
    transmission_time: req.headers.get('paypal-transmission-time'),
    cert_url: req.headers.get('paypal-cert-url'),
    auth_algo: req.headers.get('paypal-auth-algo'),
    transmission_sig: req.headers.get('paypal-transmission-sig'),
    webhook_id: webhookId,
    webhook_event: event,
  };

  if (Object.values(payload).some((value) => value === null || value === undefined)) return false;

  const response = await fetch(`${paypalApiBase()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  return response.ok && result.verification_status === 'SUCCESS';
}

const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('ok', { status: 200 });
  }

  try {
    const event = await req.json();
    const verified = await verifyWebhook(req, event);
    if (!verified) {
      return new Response(JSON.stringify({ error: 'Invalid PayPal webhook signature.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource ?? {};
      const orderId = resource?.supplementary_data?.related_ids?.order_id;
      const captureId = resource?.id;
      const amount = Number(resource?.amount?.value);
      const currency = String(resource?.amount?.currency_code ?? '').toUpperCase();

      if (orderId && captureId && Number.isFinite(amount) && currency) {
        const { data: plan } = await supabase
          .from('payment_plans')
          .select('id')
          .eq('provider_order_id', orderId)
          .maybeSingle();

        if (plan) {
          const { error } = await supabase.rpc('mark_paypal_payment_paid', {
            p_payment_plan_id: plan.id,
            p_order_id: orderId,
            p_capture_id: captureId,
            p_amount: amount,
            p_currency: currency,
          });
          if (error) throw error;
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('paypal-webhook error', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Webhook processing failed.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
