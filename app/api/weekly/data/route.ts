import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateWeeklyActions } from '@/lib/claude';

/**
 * Calculates the date of the Monday of the current week (YYYY-MM-DD)
 */
function getRecentMondayStr(): string {
  const d = new Date();
  const day = d.getDay();
  // If Sunday (0), go back 6 days, otherwise go back (day - 1) days
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  try {
    // 1. Fetch store info
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, shop_domain, sync_status')
      .eq('shop_domain', shop)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not connected. Connect your store first.' }, { status: 404 });
    }

    // 2. Fetch cached orders (we need this to generate actions if not cached)
    const { data: dbOrders, error: ordersError } = await supabase
      .from('orders')
      .select('shopify_order_id, created_at, subtotal_price, total_discounts, total_price, total_shipping, total_tax, total_refunded, cancelled_at, items_json')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw new Error(`Database error fetching orders: ${ordersError.message}`);
    }

    if (!dbOrders || dbOrders.length === 0) {
      return NextResponse.json({
        actions: null,
        sync_status: store.sync_status,
        message: 'No order data synced. Please synchronize store first.',
      });
    }

    // 3. Check if weekly actions are already cached for this Monday
    const currentMondayStr = getRecentMondayStr();
    
    const { data: cachedWeekly, error: fetchError } = await supabase
      .from('weekly_actions')
      .select('actions')
      .eq('store_id', store.id)
      .eq('week_start', currentMondayStr)
      .maybeSingle();

    let actions = null;

    if (cachedWeekly) {
      actions = cachedWeekly.actions;
    } else {
      // 4. No cached actions, trigger Claude to generate them
      console.log(`Generating weekly actions for store: ${shop} (Week starting: ${currentMondayStr})`);
      const newActions = await generateWeeklyActions(dbOrders);
      
      // Save to Supabase cache
      const { error: insertError } = await supabase
        .from('weekly_actions')
        .insert({
          store_id: store.id,
          week_start: currentMondayStr,
          actions: newActions,
        });

      if (insertError) {
        console.error('Failed to cache weekly actions:', insertError);
      }

      actions = newActions;
    }

    return NextResponse.json({
      actions,
      week_start: currentMondayStr,
      sync_status: store.sync_status,
    });
  } catch (error: any) {
    console.error('Weekly actions API error:', error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
