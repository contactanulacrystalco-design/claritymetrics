import { NextResponse } from 'next/server';
import { buildDashboardData } from '@/lib/calculations';
import { generateDailyInsight } from '@/lib/claude';

export async function GET() {
  try {
    const metrics = buildDashboardData({
      revenue: 82400,
      orders: 124,
      lastWeekRevenue: 75000,
      topProduct: 'Oversized Hoodie',
    });

    const insight = await generateDailyInsight();

    return NextResponse.json({
      metrics,
      insight,
      sync_status: 'demo',
      last_synced_at: null,
    });
  } catch (error: any) {
    console.error('Dashboard API error:', error);

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
