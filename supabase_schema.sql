-- SQL Schema Migration for ClarityMetrics
-- Run this in the Supabase SQL Editor to set up the database tables

-- 1. Stores Table
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_domain TEXT NOT NULL UNIQUE,
    access_token TEXT NOT NULL, -- NOTE: Stored as plain-text for MVP. Must be encrypted before real customers are boarded.
    scopes TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending', -- 'pending', 'syncing', 'completed', 'failed'
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for domain lookups
CREATE INDEX IF NOT EXISTS idx_stores_shop_domain ON public.stores(shop_domain);

-- 2. Orders Table (Cached Shopify Order Details for Net Revenue Calculation)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    shopify_order_id TEXT NOT NULL,
    order_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    subtotal_price NUMERIC(12, 2) NOT NULL, -- Net of line item discounts, before shipping & taxes
    total_discounts NUMERIC(12, 2) DEFAULT 0.00,
    total_tax NUMERIC(12, 2) DEFAULT 0.00,
    total_shipping NUMERIC(12, 2) DEFAULT 0.00,
    total_price NUMERIC(12, 2) NOT NULL, -- Gross total including tax & shipping
    total_refunded NUMERIC(12, 2) DEFAULT 0.00,
    financial_status TEXT, -- 'paid', 'refunded', 'partially_refunded', etc.
    cancelled_at TIMESTAMP WITH TIME ZONE,
    items_json JSONB, -- Brief representation of items (id, title, quantity, price) for AI analysis
    UNIQUE(store_id, shopify_order_id)
);

CREATE INDEX IF NOT EXISTS idx_orders_store_created ON public.orders(store_id, created_at DESC);

-- 3. Daily Insights Table (Cached Insights)
CREATE TABLE IF NOT EXISTS public.daily_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    insight_date DATE NOT NULL DEFAULT CURRENT_DATE,
    insight_text TEXT NOT NULL,
    supporting_numbers JSONB, -- e.g., {"sold": 32, "average": 10}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(store_id, insight_date)
);

-- 4. Weekly Actions Table (Cached Weekly Priorities)
CREATE TABLE IF NOT EXISTS public.weekly_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    week_start DATE NOT NULL, -- The Monday of the week
    actions JSONB NOT NULL, -- Array of 3 items: { text: "...", numbers: [...] }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(store_id, week_start)
);
