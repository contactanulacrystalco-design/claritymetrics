import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchShopifyOrders } from '@/lib/shopify';

export async function GET(request: NextRequest) {
  return handleSync(request);
}

export async function POST(request: NextRequest) {
  return handleSync(request);
}

async function handleSync(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  // 1. Get store details from Supabase
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, access_token')
    .eq('shop_domain', shop)
    .single();

  if (storeError || !store) {
    return NextResponse.json({ error: 'Store credentials not found. Connect your store first.' }, { status: 404 });
  }

  try {
    // 2. Mark store status as 'syncing'
    await supabase
      .from('stores')
      .update({ sync_status: 'syncing' })
      .eq('id', store.id);

    console.log(`Starting historical order fetch for shop: ${shop}`);
    
    // 3. Fetch 90 days of orders from Shopify
    const orders = await fetchShopifyOrders(shop, store.access_token);
    
    console.log(`Fetched ${orders.length} orders. Syncing to database...`);

    // 4. Batch upsert orders to Supabase
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

      // Upsert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < dbOrders.length; i += batchSize) {
        const batch = dbOrders.slice(i, i + batchSize);
        const { error: upsertError } = await supabase
          .from('orders')
          .upsert(batch, { onConflict: 'store_id,shopify_order_id' });

        if (upsertError) {
          throw new Error(`Failed to upsert orders batch: ${upsertError.message}`);
        }
      }
    }

    // 5. Update store status to 'completed'
    const { error: updateError } = await supabase
      .from('stores')
      .update({
        sync_status: 'completed',
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', store.id);

    if (updateError) {
      throw new Error(`Failed to update store sync status: ${updateError.message}`);
    }

    console.log(`Successfully completed order sync for ${shop}`);
    return NextResponse.json({ success: true, count: orders.length });
  } catch (error: any) {
    console.error(`Sync failed for ${shop}:`, error);
    
    // Update store status to 'failed'
    await supabase
      .from('stores')
      .update({ sync_status: 'failed' })
      .eq('id', store.id);

    return NextResponse.json({ error: `Sync failed: ${error.message}` }, { status: 500 });
  }
}
