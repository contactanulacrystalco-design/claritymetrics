/**
 * Shopify Admin API client helpers
 */

interface ShopifyOrderInput {
  id: number;
  order_number: number;
  created_at: string;
  subtotal_price: string;
  total_discounts: string;
  total_tax: string;
  total_price: string;
  financial_status: string;
  cancelled_at: string | null;
  line_items: Array<{
    id: number;
    title: string;
    quantity: number;
    price: string;
  }>;
  shipping_lines?: Array<{
    price: string;
  }>;
  refunds?: Array<{
    transactions?: Array<{
      status: string;
      kind: string;
      amount: string;
    }>;
  }>;
}

export interface FormattedOrder {
  shopify_order_id: string;
  order_number: number;
  created_at: string;
  subtotal_price: number;
  total_discounts: number;
  total_tax: number;
  total_shipping: number;
  total_price: number;
  total_refunded: number;
  financial_status: string;
  cancelled_at: string | null;
  items_json: any;
}

/**
 * Parses Shopify pagination Link header to find the next page URL
 */
function parseLinkHeader(header: string | null): { next?: string } {
  const links: { next?: string } = {};
  if (!header) return links;

  const parts = header.split(',');
  for (const part of parts) {
    const match = part.trim().match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) {
      const url = match[1];
      const rel = match[2];
      if (rel === 'next') {
        links.next = url;
      }
    }
  }
  return links;
}

/**
 * Fetches all orders from Shopify for the last 90 days
 */
export async function fetchShopifyOrders(
  shopDomain: string,
  accessToken: string,
  daysAgo = 90
): Promise<FormattedOrder[]> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - daysAgo);
  const createdAtMin = ninetyDaysAgo.toISOString();

  // Initial orders URL
  // We fetch status="any" to get cancelled, fulfilled, paid, refunded orders.
  // Limit to 250 orders per page (max allowed by Shopify REST API)
  let url: string | undefined = `https://${shopDomain}/admin/api/2024-04/orders.json?created_at_min=${encodeURIComponent(
    createdAtMin
  )}&limit=250&status=any`;

  const allOrders: FormattedOrder[] = [];

  while (url) {
    console.log(`Fetching Shopify orders from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const orders = (data.orders || []) as ShopifyOrderInput[];

    for (const order of orders) {
      // Calculate total refunded from success refund transactions
      let totalRefunded = 0;
      if (order.refunds && Array.isArray(order.refunds)) {
        for (const refund of order.refunds) {
          if (refund.transactions && Array.isArray(refund.transactions)) {
            for (const tx of refund.transactions) {
              if (
                tx.status === 'success' &&
                (tx.kind === 'refund' || tx.kind === 'suggested_refund')
              ) {
                totalRefunded += parseFloat(tx.amount || '0');
              }
            }
          }
        }
      }

      // Calculate total shipping
      let totalShipping = 0;
      if (order.shipping_lines && Array.isArray(order.shipping_lines)) {
        totalShipping = order.shipping_lines.reduce(
          (sum, line) => sum + parseFloat(line.price || '0'),
          0
        );
      }

      // Create a lightweight JSON for items (to optimize DB space and Claude payload size)
      const items = order.line_items.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: parseFloat(item.price || '0'),
      }));

      allOrders.push({
        shopify_order_id: String(order.id),
        order_number: order.order_number,
        created_at: order.created_at,
        subtotal_price: parseFloat(order.subtotal_price || '0'),
        total_discounts: parseFloat(order.total_discounts || '0'),
        total_tax: parseFloat(order.total_tax || '0'),
        total_shipping: totalShipping,
        total_price: parseFloat(order.total_price || '0'),
        total_refunded: totalRefunded,
        financial_status: order.financial_status,
        cancelled_at: order.cancelled_at,
        items_json: items,
      });
    }

    // Shopify pagination uses Link header
    const linkHeader = response.headers.get('link');
    const links = parseLinkHeader(linkHeader);
    url = links.next; // will be undefined if no next page exists
  }

  return allOrders;
}
