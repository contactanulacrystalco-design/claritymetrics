import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  try {
    const { data: store, error } = await supabase
      .from('stores')
      .select('sync_status, last_synced_at')
      .eq('shop_domain', shop)
      .single();

    if (error || !store) {
      return NextResponse.json({ error: 'Store not found or database error' }, { status: 404 });
    }

    return NextResponse.json({
      sync_status: store.sync_status || 'pending',
      last_synced_at: store.last_synced_at,
    });
  } catch (error: any) {
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}
