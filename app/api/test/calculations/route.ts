import { NextRequest, NextResponse } from 'next/server';
import { buildDashboardData } from '@/lib/calculations';

export async function GET(request: NextRequest) {
  const results: { name: string; passed: boolean; message: string }[] = [];
  let allPassed = true;

  // Test Case Helper
  const runTest = (name: string, assertion: boolean, message: string) => {
    results.push({ name, passed: assertion, message });
    if (!assertion) allPassed = false;
  };

  // ==========================================
  // SECTION 1: Net Revenue / Dashboard Metric Tests (via buildDashboardData)
  // ==========================================

  // Case A: Normal inputs
  const dataA = buildDashboardData({
    revenue: 1200,
    orders: 10,
    lastWeekRevenue: 1000,
    topProduct: 'Oversized Hoodie',
  });
  runTest(
    'AOV Calculation',
    dataA.avgOrderValue === 120,
    `Expected AOV $120, got $${dataA.avgOrderValue}`
  );

  // Case B: Revenue up vs last week
  const dataB = buildDashboardData({
    revenue: 1200,
    orders: 10,
    lastWeekRevenue: 1000,
    topProduct: 'Tote Bag',
  });
  runTest(
    'Revenue Growth Percentage',
    Math.round(dataB.percentChange) === 20,
    `Expected +20%, got ${dataB.percentChange.toFixed(1)}%`
  );
  runTest(
    'isUp flag when revenue increased',
    dataB.isUp === true,
    `Expected isUp=true, got ${dataB.isUp}`
  );

  // Case C: Revenue down vs last week
  const dataC = buildDashboardData({
    revenue: 800,
    orders: 8,
    lastWeekRevenue: 1000,
    topProduct: 'Sticker Pack',
  });
  runTest(
    'isUp flag when revenue decreased',
    dataC.isUp === false,
    `Expected isUp=false, got ${dataC.isUp}`
  );
  runTest(
    'Negative growth percentage',
    Math.round(dataC.percentChange) === -20,
    `Expected -20%, got ${dataC.percentChange.toFixed(1)}%`
  );

  // Case D: Zero orders edge case
  const dataD = buildDashboardData({
    revenue: 0,
    orders: 0,
    lastWeekRevenue: 0,
    topProduct: '',
  });
  runTest(
    'Zero orders — AOV should be 0',
    dataD.avgOrderValue === 0,
    `Expected AOV $0 with 0 orders, got $${dataD.avgOrderValue}`
  );

  // Case E: Top product is always first in rankings
  const dataE = buildDashboardData({
    revenue: 5000,
    orders: 50,
    lastWeekRevenue: 4000,
    topProduct: 'Vintage Tee',
  });
  runTest(
    'Top product is ranked #1',
    dataE.products[0].name === 'Vintage Tee',
    `Expected "Vintage Tee" at rank 1, got "${dataE.products[0].name}"`
  );

  // Case F: Funnel — sessions should be orders * 18
  runTest(
    'Funnel sessions estimate',
    dataE.sessions === 50 * 18,
    `Expected ${50 * 18} sessions, got ${dataE.sessions}`
  );

  return NextResponse.json({
    success: allPassed,
    summary: allPassed
      ? 'All test cases passed successfully!'
      : 'Some test cases failed. See report.',
    results,
  });
}
export const dynamic = 'force-dynamic';
