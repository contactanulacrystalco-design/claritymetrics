import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchShopifyOrders } from '@/lib/shopify';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret') || request.headers.get('Authorization')?.replace('Bearer ', '');

  const cronSecret = process.env.CRON_SECRET;

  // 1. Verify cron secret to prevent unauthorized triggers
  if (cronSecret && secret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized: invalid cron secret' }, { status: 401 });
  }

  try {
    // 2. Fetch all registered stores
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, shop_domain, access_token');

    if (storesError) {
      throw new Error(`Database error fetching stores: ${storesError.message}`);
    }

    if (!stores || stores.length === 0) {
      return NextResponse.json({ message: 'No stores found to sync' });
    }

    console.log(`Cron: starting sync for ${stores.length} stores...`);
    const results = [];

    // 3. Sync each store sequentially to prevent overloading resources
    for (const store of stores) {
      try {
        // Transition status to syncing
        await supabase
          .from('stores')
          .update({ sync_status: 'syncing' })
          .eq('id', store.id);

        // Fetch last 90 days of orders
        const orders = await fetchShopifyOrders(store.shop_domain, store.access_token);
        
        if (orders.length > 0) {
          const dbOrders = orders.map(order => ({
            store_id: store.id,
            shopify_order_id: order.shopify_order_id,
            order_number: order.order_number,
            created_at: order.created_at,
            subtotal_price: order.subtotal_price,
            total_discounts: order.total_discounts,
            total_tax: order.total_tax,
            total_shipping: order.total_shipping,
            total_price: order.total_price,
            total_refunded: order.total_refunded,
            financial_status: order.financial_status,
            cancelled_at: order.cancelled_at,
            items_json: order.items_json,
          }));

          // Upsert orders
          const batchSize = 100;
          for (let i = 0; i < dbOrders.length; i += batchSize) {
            const batch = dbOrders.slice(i, i + batchSize);
            await supabase
              .from('orders')
              .upsert(batch, { onConflict: 'store_id,shopify_order_id' });
          }
        }

        // Update status to completed
        await supabase
          .from('stores')
          .update({
            sync_status: 'completed',
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', store.id);

        // Optional: Delete today's AI insight cache to force daily regeneration
        const todayStr = new Date().toISOString().split('T')[0];
        await supabase
          .from('daily_insights')
          .delete()
          .eq('store_id', store.id)
          .eq('insight_date', todayStr);

        results.push({ shop: store.shop_domain, status: 'success', count: orders.length });
      } catch (storeSyncError: any) {
        console.error(`Cron failed for store ${store.shop_domain}:`, storeSyncError);
        
        await supabase
          .from('stores')
          .update({ sync_status: 'failed' })
          .eq('id', store.id);

        results.push({ shop: store.shop_domain, status: 'failed', error: storeSyncError.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: stores.length,
      results,
    });
  } catch (error: any) {
    console.error('Cron sync error:', error);
    return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
