// lib/calculations.ts
// Takes the 4 manual form inputs and generates everything the dashboard
// needs: a believable 7-day week, AOV, traffic funnel, product rankings,
// hourly distribution, inventory alert, AI opportunity, and a plain-English
// insight.
//
// IMPORTANT: this is all synthetic/estimated data derived from 4 numbers.
// When real Shopify + Claude APIs come in later, this file's OUTPUT SHAPE
// stays the same — only the inside of this function changes from
// "generate estimates" to "fetch real data". The UI never needs to change.

export type DashboardInputs = {
    revenue: number;
    orders: number;
    lastWeekRevenue: number;
    topProduct: string;
};

export type DayData = {
    label: string; // "Mon", "Tue", ...
    revenue: number;
    orders: number;
};

export type ProductRanking = {
    name: string;
    revenue: number;
    share: number; // percent
    changePct: number; // vs last week, for "winning products"
};

export type DashboardData = {
    revenue: number;
    orders: number;
    avgOrderValue: number;
    lastWeekRevenue: number;
    percentChange: number;
    isUp: boolean;
    topProduct: string;

    // 7-day arrays, today is the last entry
    thisWeek: DayData[];
    lastWeek: DayData[];

    // Estimated funnel (sessions -> ... -> purchase)
    sessions: number;
    funnel: { label: string; value: number }[];

    // Product rankings, topProduct is always #1
    products: ProductRanking[];

    // Hourly distribution for "today", 24 values
    hourly: number[];

    // Traffic source breakdown (estimated split)
    trafficSources: { label: string; value: number }[];

    // Best single day this week, e.g. "Friday"
    bestDay: string;

    // Inventory alert — lowest-estimated-stock product
    inventoryAlert: {
        product: string;
        unitsLeft: number;
    };

    // AI Opportunity — a single actionable suggestion, separate from the
    // main insight, used for the "AI Opportunity" card
    aiOpportunity: {
        title: string;
        text: string;
    };

    // Best time to post (estimated, consistent with hourly distribution)
    bestPostWindow: string;
    bestPostLift: number; // e.g. 2.3 = "2.3x higher"

    insightText: string;
};

// Simple deterministic pseudo-random so numbers don't jump around
// every time the component re-renders.
function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function buildDashboardData(input: DashboardInputs): DashboardData {
    const { revenue, orders, lastWeekRevenue, topProduct } = input;
    const avgOrderValue = orders > 0 ? revenue / orders : 0;

    let percentChange = 0;
    if (lastWeekRevenue > 0) {
        percentChange = ((revenue - lastWeekRevenue) / lastWeekRevenue) * 100;
    }
    const isUp = percentChange >= 0;
    const productName = topProduct.trim() || "your top product";

    // ---- Build a 7-day week ending in "today" with realistic fluctuation ----
    const todayIndex = new Date().getDay(); // 0 = Sun

    function buildWeek(endRevenue: number, endOrders: number, seedBase: number): DayData[] {
        const days: DayData[] = [];
        for (let i = 6; i >= 0; i--) {
            const fluct = 0.75 + seededRandom(seedBase + i) * 0.5; // 0.75x - 1.25x
            const isToday = i === 0;
            const dLabel = DAY_LABELS[(((todayIndex - i) % 7) + 7) % 7];
            days.unshift({
                label: dLabel,
                revenue: isToday ? endRevenue : Math.round(endRevenue * fluct * 0.9),
                orders: isToday ? endOrders : Math.max(1, Math.round(endOrders * fluct * 0.9)),
            });
        }
        return days;
    }

    const thisWeek = buildWeek(revenue, orders, 1);
    const lastWeekEndOrders = orders > 0 && revenue > 0 ? Math.round((lastWeekRevenue / revenue) * orders) : orders;
    const lastWeek = buildWeek(lastWeekRevenue, Math.max(1, lastWeekEndOrders), 50);

    // Best single day this week, by revenue
    const bestDayEntry = thisWeek.reduce((best, d) => (d.revenue > best.revenue ? d : best), thisWeek[0]);
    const fullDayNames: Record<string, string> = {
        Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
        Thu: "Thursday", Fri: "Friday", Sat: "Saturday",
    };
    const bestDay = fullDayNames[bestDayEntry.label] || bestDayEntry.label;

    // ---- Estimated funnel ----
    const sessions = Math.max(orders * 18, 50);
    const funnel = [
        { label: "Sessions", value: sessions },
        { label: "Product views", value: Math.round(sessions * 0.55) },
        { label: "Added to cart", value: Math.round(sessions * 0.22) },
        { label: "Checkout started", value: Math.round(sessions * 0.12) },
        { label: "Purchased", value: orders },
    ];

    // ---- Product rankings, topProduct always #1 ----
    const otherNames = ["Vintage Tee", "Sticker Pack", "Tote Bag"];
    const topShare = 38 + seededRandom(3) * 10;
    const remaining = 100 - topShare;
    const products: ProductRanking[] = [
        {
            name: productName,
            revenue: Math.round(revenue * (topShare / 100)),
            share: Math.round(topShare),
            changePct: Math.round(20 + seededRandom(7) * 10),
        },
        ...otherNames.map((name, i) => {
            const share = (remaining / 3) * (1 - i * 0.15);
            return {
                name,
                revenue: Math.round(revenue * (share / 100)),
                share: Math.round(share),
                changePct: Math.round(8 + seededRandom(10 + i) * 12),
            };
        }),
    ];

    // ---- Hourly distribution for today (24 values, peak evening) ----
    const hourly: number[] = [];
    for (let h = 0; h < 24; h++) {
        let weight = 0.2;
        if (h >= 9 && h <= 12) weight = 0.6;
        if (h >= 13 && h <= 16) weight = 0.8;
        if (h >= 17 && h <= 21) weight = 1; // evening peak
        if (h >= 22 || h <= 6) weight = 0.15;
        const noise = 0.85 + seededRandom(h + 100) * 0.3;
        hourly.push(Math.max(0, Math.round(weight * noise * (orders / 8))));
    }

    // ---- Traffic sources (estimated split) ----
    const trafficSources = [
        { label: "Direct", value: 32 },
        { label: "Instagram", value: 28 },
        { label: "Google", value: 22 },
        { label: "Email", value: 12 },
        { label: "Other", value: 6 },
    ];

    // ---- Inventory alert — pick a product with an estimated low stock ----
    const lowStockProduct = products[products.length - 1].name; // lowest-revenue product, framed as "running low"
    const inventoryAlert = {
        product: lowStockProduct,
        unitsLeft: Math.max(3, Math.round(8 + seededRandom(20) * 10)),
    };

    // ---- Best post window + lift (estimate, tied to hourly peak) ----
    const bestPostWindow = "7 PM – 9 PM";
    const bestPostLift = Math.round((2 + seededRandom(30) * 0.8) * 10) / 10;

    // ---- AI Opportunity card (separate from main insight) ----
    const aiOpportunity = {
        title: "Increase Instagram sales",
        text: `Engagement is high between ${bestPostWindow} but sales are comparatively low during that window. Consider a post or story promotion in this slot.`,
    };

    // ---- Plain-English insight (template-based, swap for Claude API later) ----
    const insightText = isUp
        ? `Your revenue is up ${Math.abs(percentChange).toFixed(0)}% vs last week. ${productName} is your top performer — keep the momentum!`
        : `Your revenue is down ${Math.abs(percentChange).toFixed(0)}% vs last week. ${productName} is still your top mover — consider a flash sale to recover momentum.`;

    return {
        revenue,
        orders,
        avgOrderValue,
        lastWeekRevenue,
        percentChange,
        isUp,
        topProduct: productName,
        thisWeek,
        lastWeek,
        sessions,
        funnel,
        products,
        hourly,
        trafficSources,
        bestDay,
        inventoryAlert,
        aiOpportunity,
        bestPostWindow,
        bestPostLift,
        insightText,
    };
}