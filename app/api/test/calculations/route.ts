import { NextRequest, NextResponse } from 'next/server';
import { calculateOrderNetRevenue, calculateDashboardMetrics } from '@/lib/calculations';
import { FormattedOrder } from '@/lib/shopify';

export async function GET(request: NextRequest) {
  const results = [];
  let allPassed = true;

  // Test Case Helper
  const runTest = (name: string, assertion: boolean, message: string) => {
    results.push({ name, passed: assertion, message });
    if (!assertion) allPassed = false;
  };

  // ==========================================
  // SECTION 1: Net Revenue Calculation Tests
  // ==========================================

  // Case A: Normal order with shipping and tax
  const orderA = {
    total_price: 120,
    total_shipping: 10,
    total_tax: 10,
    total_refunded: 0,
    cancelled_at: null,
    subtotal_price: 100,
  };
  const revA = calculateOrderNetRevenue(orderA);
  runTest(
    'Normal Order Net Revenue',
    revA === 100,
    `Expected $100, got $${revA}. (Gross: $120, Shipping: $10, Tax: $10, Refunds: $0)`
  );

  // Case B: Partially refunded order
  const orderB = {
    total_price: 120,
    total_shipping: 10,
    total_tax: 10,
    total_refunded: 30,
    cancelled_at: null,
    subtotal_price: 100,
  };
  const revB = calculateOrderNetRevenue(orderB);
  runTest(
    'Partially Refunded Order',
    revB === 70,
    `Expected $70, got $${revB}. (Gross: $120, Shipping: $10, Tax: $10, Refunds: $30)`
  );

  // Case C: Fully refunded order
  const orderC = {
    total_price: 120,
    total_shipping: 10,
    total_tax: 10,
    total_refunded: 100,
    cancelled_at: null,
    subtotal_price: 100,
  };
  const revC = calculateOrderNetRevenue(orderC);
  runTest(
    'Fully Refunded Order',
    revC === 0,
    `Expected $0, got $${revC}. (Gross: $120, Shipping: $10, Tax: $10, Refunds: $100)`
  );

  // Case D: Cancelled order
  const orderD = {
    total_price: 120,
    total_shipping: 10,
    total_tax: 10,
    total_refunded: 0,
    cancelled_at: '2026-06-22T20:00:00Z',
    subtotal_price: 100,
  };
  const revD = calculateOrderNetRevenue(orderD);
  runTest(
    'Cancelled Order',
    revD === 0,
    `Expected $0 for cancelled order, got $${revD}.`
  );

  // Case E: Complex cart-level discount order
  const orderE = {
    total_price: 85, // Original item was $90, discount of $20 applied. Shipping was $10, tax was $5. Total = 90 - 20 + 10 + 5 = 85.
    total_shipping: 10,
    total_tax: 5,
    total_refunded: 0,
    cancelled_at: null,
    subtotal_price: 90,
  };
  const revE = calculateOrderNetRevenue(orderE);
  runTest(
    'Cart-Level Discount Order',
    revE === 70,
    `Expected $70 (after applying $20 discount), got $${revE}. (Gross: $85, Shipping: $10, Tax: $5)`
  );


  // ==========================================
  // SECTION 2: Dashboard Metric Growth Percentage Tests
  // ==========================================
  const referenceDate = new Date('2026-06-22T12:00:00Z');
  
  // Create orders array
  const mockOrders: FormattedOrder[] = [
    // Today's orders (total revenue = 150 + 50 = 200)
    {
      shopify_order_id: '1',
      order_number: 101,
      created_at: new Date('2026-06-22T08:00:00Z').toISOString(),
      subtotal_price: 150,
      total_discounts: 0,
      total_tax: 0,
      total_shipping: 0,
      total_price: 150,
      total_refunded: 0,
      financial_status: 'paid',
      cancelled_at: null,
      items_json: [],
    },
    {
      shopify_order_id: '2',
      order_number: 102,
      created_at: new Date('2026-06-22T10:00:00Z').toISOString(),
      subtotal_price: 50,
      total_discounts: 0,
      total_tax: 0,
      total_shipping: 0,
      total_price: 50,
      total_refunded: 0,
      financial_status: 'paid',
      cancelled_at: null,
      items_json: [],
    },
    // Same day last week orders (total revenue = 100)
    {
      shopify_order_id: '3',
      order_number: 99,
      created_at: new Date('2026-06-15T09:00:00Z').toISOString(),
      subtotal_price: 100,
      total_discounts: 0,
      total_tax: 0,
      total_shipping: 0,
      total_price: 100,
      total_refunded: 0,
      financial_status: 'paid',
      cancelled_at: null,
      items_json: [],
    },
    // Order outside of target comparison windows (ignored)
    {
      shopify_order_id: '4',
      order_number: 100,
      created_at: new Date('2026-06-20T12:00:00Z').toISOString(),
      subtotal_price: 500,
      total_discounts: 0,
      total_tax: 0,
      total_shipping: 0,
      total_price: 500,
      total_refunded: 0,
      financial_status: 'paid',
      cancelled_at: null,
      items_json: [],
    },
  ];

  const metrics = calculateDashboardMetrics(mockOrders, referenceDate);
  
  runTest(
    'Dashboard Metric - Today Revenue Sum',
    metrics.revenueToday === 200,
    `Expected $200, got $${metrics.revenueToday}`
  );

  runTest(
    'Dashboard Metric - Today Order Count',
    metrics.ordersToday === 2,
    `Expected 2 orders, got ${metrics.ordersToday}`
  );

  // Growth calculation: ((200 - 100) / 100) * 100 = 100%
  runTest(
    'Dashboard Metric - Growth vs Last Week %',
    metrics.revenueChangePercent === 100,
    `Expected +100%, got ${metrics.revenueChangePercent}%`
  );

  return NextResponse.json({
    success: allPassed,
    summary: allPassed ? 'All test cases passed successfully!' : 'Some test cases failed. See report.',
    results,
  });
}
export const dynamic = 'force-dynamic';
