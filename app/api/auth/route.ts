import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  // Normalize shop domain
  shop = shop.trim().toLowerCase();
  if (!shop.includes('.')) {
    shop = `${shop}.myshopify.com`;
  }

  // Shopify domain validation regex (only alphanumeric and hyphens, ending with .myshopify.com)
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
  if (!shopRegex.test(shop)) {
    return NextResponse.json({ error: 'Invalid shop domain format. Use my-store.myshopify.com' }, { status: 400 });
  }

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const redirectUri = process.env.SHOPIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Shopify credentials not configured on the server. Please check .env.local' }, { status: 500 });
  }

  const scopes = 'read_orders,read_products';
  
  // Generate random state to protect against CSRF
  const state = crypto.randomBytes(16).toString('hex');

  const authorizeUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  const response = NextResponse.redirect(authorizeUrl);
  
  // Set cookie for CSRF state validation in callback
  response.cookies.set('shopify_oauth_state', state, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  });

  return response;
}
