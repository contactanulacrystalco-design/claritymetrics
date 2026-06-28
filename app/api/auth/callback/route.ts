import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  const state = searchParams.get('state');
  const hmac = searchParams.get('hmac');

  // 1. Basic validation
  if (!code || !shop || !state || !hmac) {
    return NextResponse.json({ error: 'Missing required OAuth parameters' }, { status: 400 });
  }

  // 2. CSRF State Validation
  const stateCookie = request.cookies.get('shopify_oauth_state')?.value;
  if (!stateCookie || stateCookie !== state) {
    return NextResponse.json({ error: 'State validation failed. Anti-CSRF token mismatch.' }, { status: 403 });
  }

  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  const clientId = process.env.SHOPIFY_CLIENT_ID;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Server environment variables not configured.' }, { status: 500 });
  }

  // 3. HMAC Signature Verification
  // Reconstruct query string excluding hmac
  const params = Object.fromEntries(searchParams.entries());
  delete params.hmac;
  
  const message = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  const computedHmac = crypto
    .createHmac('sha256', clientSecret)
    .update(message)
    .digest('hex');

  if (computedHmac !== hmac) {
    return NextResponse.json({ error: 'HMAC signature verification failed' }, { status: 400 });
  }

  try {
    // 4. Exchange authorization code for permanent access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      return NextResponse.json({ error: `Token exchange failed: ${errText}` }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const scopes = tokenData.scope;

    if (!accessToken) {
      return NextResponse.json({ error: 'OAuth succeeded but no access token was returned' }, { status: 500 });
    }

    // 5. Store / update record in Supabase
    const { error: dbError } = await supabase
      .from('stores')
      .upsert({
        shop_domain: shop,
        access_token: accessToken,
        scopes: scopes || 'read_orders,read_products',
        sync_status: 'pending',
        last_synced_at: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'shop_domain' });

    if (dbError) {
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
    }

    // 6. Redirect to dashboard immediately
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.searchParams.set('shop', shop);
    
    const response = NextResponse.redirect(dashboardUrl);
    
    // Clear the OAuth state cookie
    response.cookies.delete('shopify_oauth_state');
    
    return response;
  } catch (error: any) {
    console.error('OAuth Callback Error:', error);
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
  }
}
