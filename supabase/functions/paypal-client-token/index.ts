import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('APP_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function paypalApiBase(): string {
  return Deno.env.get('PAYPAL_ENV') === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function getBrowserSafeClientToken(origin: string | null): Promise<string> {
  const clientId = requireEnv('PAYPAL_CLIENT_ID');
  const clientSecret = requireEnv('PAYPAL_CLIENT_SECRET');
  const domain = Deno.env.get('PAYPAL_ALLOWED_DOMAIN') ?? origin ?? 'http://localhost:3000';
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const body = new URLSearchParams();
  body.set('grant_type', 'client_credentials');
  body.set('response_type', 'client_token');
  body.set('domains[]', domain);

  const response = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.message ?? 'PayPal client token request failed.');
  }

  return data.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const token = await getBrowserSafeClientToken(req.headers.get('Origin'));
    return new Response(JSON.stringify({ accessToken: token }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('paypal-client-token error', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'PayPal client token error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
