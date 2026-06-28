import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateDashboardMetrics } from '@/lib/calculations';
import { generateDailyInsight } from '@/lib/claude';

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
      .select('id, shop_domain, sync_status, last_synced_at')
      .eq('shop_domain', shop)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store not connected. Return to landing page.' }, { status: 404 });
    }

    // 2. Fetch all cached orders for calculations
    const { data: dbOrders, error: ordersError } = await supabase
      .from('orders')
      .select('shopify_order_id, order_number, created_at, subtotal_price, total_discounts, total_tax, total_shipping, total_price, total_refunded, financial_status, cancelled_at, items_json')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      throw new Error(`Database error fetching orders: ${ordersError.message}`);
    }

    // If no orders have been synced yet, return a pending sync status state
    if (!dbOrders || dbOrders.length === 0) {
      return NextResponse.json({
        metrics: null,
        insight: null,
        last_synced_at: store.last_synced_at,
        sync_status: store.sync_status,
        message: 'No order data synced. Run sync first.',
      });
    }

    // 3. Compute dashboard metrics
    const metrics = calculateDashboardMetrics(dbOrders);

    // 4. Retrieve or generate daily AI insight
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Check if daily insight is cached
    const { data: cachedInsight, error: insightFetchError } = await supabase
      .from('daily_insights')
      .select('insight_text, supporting_numbers')
      .eq('store_id', store.id)
      .eq('insight_date', todayStr)
      .maybeSingle();

    let insight = null;

    if (cachedInsight) {
      insight = {
        insight_text: cachedInsight.insight_text,
        supporting_numbers: cachedInsight.supporting_numbers,
      };
    } else {
      // No cached insight. Call Claude to generate a new one
      console.log(`Generating daily insight for store: ${shop}`);
      const newInsight = await generateDailyInsight(dbOrders);
      
      // Save newly generated insight to Supabase cache
      const { error: insertError } = await supabase
        .from('daily_insights')
        .insert({
          store_id: store.id,
          insight_date: todayStr,
          insight_text: newInsight.insight_text,
          supporting_numbers: newInsight.supporting_numbers,
        });

      if (insertError) {
        console.error('Failed to cache daily insight:', insertError);
      }

      insight = newInsight;
    }

    return NextResponse.json({
      metrics,
      insight,
      last_synced_at: store.last_synced_at,
      sync_status: store.sync_status,
    });
  } catch (error: any) {
    console.error('Dashboard Data API error:', error);
    return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
