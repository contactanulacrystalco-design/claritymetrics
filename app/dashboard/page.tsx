"use client";

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import SkeletonDashboard from '@/components/SkeletonDashboard';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop') || '';

  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<string>('pending');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [insight, setInsight] = useState<any>(null);
  const [syncingActive, setSyncingActive] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch dashboard data from API
  const fetchDashboardData = useCallback(async (showSkeleton = true) => {
    if (showSkeleton) setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/dashboard/data?shop=${encodeURIComponent(shop)}`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      
      setSyncStatus(data.sync_status || 'pending');
      setLastSyncedAt(data.last_synced_at);
      setMetrics(data.metrics);
      setInsight(data.insight);
    } catch (err: any) {
      console.error('Fetch dashboard error:', err);
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [shop]);

  // 2. Trigger sync execution (either auto on mount or manually on click)
  const triggerSync = useCallback(async () => {
    if (syncingActive) return;
    
    setSyncingActive(true);
    setSyncStatus('syncing');
    setError('');
    
    try {
      const res = await fetch(`/api/sync/run?shop=${encodeURIComponent(shop)}`, {
        method: 'POST',
      });
      
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      
      // Refresh dashboard data after successful sync
      await fetchDashboardData(false);
    } catch (err: any) {
      console.error('Sync execution failed:', err);
      setError('Synchronization failed. Please check your network and retry.');
      setSyncStatus('failed');
    } finally {
      setSyncingActive(false);
    }
  }, [shop, syncingActive, fetchDashboardData]);

  // 3. Initial load and auto-trigger logic
  useEffect(() => {
    if (!shop) return;
    
    // Fetch initial state
    fetchDashboardData(true).then(() => {
      // Check status returned. If pending, trigger the first sync automatically
      // Note: we fetch data, then look at state immediately
    });
  }, [shop]);

  // Auto-trigger sync if state indicates pending after loading initial status
  useEffect(() => {
    if (syncStatus === 'pending' && !loading && !syncingActive) {
      triggerSync();
    }
  }, [syncStatus, loading, syncingActive, triggerSync]);

  // 4. Polling logic to track background status changes when status === 'syncing'
  useEffect(() => {
    if (syncStatus !== 'syncing' || syncingActive) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sync/status?shop=${encodeURIComponent(shop)}`);
        if (!res.ok) return;
        
        const data = await res.json();
        
        if (data.sync_status === 'completed') {
          clearInterval(interval);
          await fetchDashboardData(false);
        } else if (data.sync_status === 'failed') {
          clearInterval(interval);
          setSyncStatus('failed');
          setError('Synchronizing store data failed.');
        }
      } catch (err) {
        console.error('Polling status error:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [syncStatus, shop, syncingActive, fetchDashboardData]);

  if (!shop) {
    return (
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <AlertCircle size={40} className="text-danger" style={{ marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '12px' }}>No Shopify Store Connected</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
            Please return to the landing page and input your store address to connect.
          </p>
          <a href="/" className="btn btn-primary">Connect Store</a>
        </div>
      </div>
    );
  }

  // Determine if we should display the skeleton dashboard loader
  const showLoadingSkeleton = loading || syncStatus === 'pending' || (syncStatus === 'syncing' && !metrics);

  const formattedRevenue = metrics
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(metrics.revenueToday)
    : '$0';

  const isGrowthPositive = metrics ? metrics.revenueChangePercent > 0 : false;
  const isGrowthNegative = metrics ? metrics.revenueChangePercent < 0 : false;

  return (
    <>
      <Header />
      <main className="container" style={{ paddingBottom: '60px' }}>
        
        {/* Top welcome row */}
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600' }}>DAILY INSIGHTS</span>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.5px', marginTop: '4px' }}>
              {shop.replace('.myshopify.com', '')}
            </h1>
          </div>
          
          {/* Manual sync trigger indicator at top for convenience */}
          {syncStatus === 'completed' && (
            <button 
              onClick={triggerSync} 
              className="btn btn-secondary btn-small"
              disabled={syncingActive}
              style={{ padding: '8px 16px' }}
            >
              <RefreshCw size={14} className={syncingActive ? 'sync-dot syncing' : ''} />
              Refresh stats
            </button>
          )}
        </div>

        {/* Sync Failed Banner */}
        {syncStatus === 'failed' && error && (
          <div className="error-banner" style={{ marginTop: '24px' }}>
            <AlertCircle size={20} />
            <div style={{ flexGrow: 1 }}>
              <strong>Sync Error:</strong> {error}
            </div>
            <button onClick={triggerSync} className="btn btn-primary btn-small">
              Try again
            </button>
          </div>
        )}

        {/* Syncing Info Bar while loading initial data */}
        {syncStatus === 'syncing' && !metrics && (
          <div className="card" style={{ marginTop: '24px', textAlign: 'center', padding: '40px' }}>
            <RefreshCw size={36} className="text-warning" style={{ animation: 'shimmer 1.5s infinite linear', marginBottom: '16px' }} />
            <h3 style={{ marginBottom: '8px' }}>Pulling in your store data</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              This takes about a minute. We're importing 90 days of Shopify orders and calculating net sales.
            </p>
          </div>
        )}

        {showLoadingSkeleton ? (
          <SkeletonDashboard />
        ) : (
          <>
            {/* 3 Metric Cards */}
            <div className="metrics-grid">
              
              {/* Card 1: Revenue */}
              <div className="card metric-card">
                <div>
                  <div className="metric-label">
                    <DollarSign size={16} className="text-primary" />
                    <span>Net Revenue (24h)</span>
                  </div>
                  <div className="metric-value">{formattedRevenue}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Net of refunds & discounts
                </div>
              </div>

              {/* Card 2: Orders */}
              <div className="card metric-card">
                <div>
                  <div className="metric-label">
                    <ShoppingBag size={16} className="text-primary" />
                    <span>Orders (24h)</span>
                  </div>
                  <div className="metric-value">{metrics ? metrics.ordersToday : 0}</div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Total orders received
                </div>
              </div>

              {/* Card 3: Growth vs Last Week */}
              <div className="card metric-card">
                <div>
                  <div className="metric-label">
                    {isGrowthPositive ? (
                      <TrendingUp size={16} className="text-success" />
                    ) : isGrowthNegative ? (
                      <TrendingDown size={16} className="text-danger" />
                    ) : (
                      <TrendingUp size={16} className="text-secondary" />
                    )}
                    <span>Growth vs Last Week</span>
                  </div>
                  <div className="metric-value">
                    {metrics ? (
                      metrics.revenueChangePercent > 0 ? `+${metrics.revenueChangePercent}%` : `${metrics.revenueChangePercent}%`
                    ) : '0%'}
                  </div>
                </div>
                <div>
                  <span 
                    className={`metric-change ${
                      isGrowthPositive ? 'positive' : isGrowthNegative ? 'negative' : 'neutral'
                    }`}
                  >
                    Compared to same day last week
                  </span>
                </div>
              </div>
            </div>

            {/* AI Insight Card */}
            {insight && (
              <div className="insight-container">
                <div className="card insight-card">
                  <div className="insight-title-row">
                    <div className="insight-tag">
                      <Sparkles size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      <span>Daily AI Insight</span>
                    </div>
                  </div>
                  
                  <p className="insight-text">
                    "{insight.insight_text}"
                  </p>

                  {/* Supporting metrics list */}
                  {insight.supporting_numbers && (
                    <div className="insight-numbers-row">
                      {Object.values(insight.supporting_numbers).map((stat: any, index: number) => (
                        <div key={index} className="supporting-number-box">
                          <span className="supporting-val">{stat.value}</span>
                          <span className="supporting-lbl">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Status bar */}
            <div className="sync-bar">
              <div className="sync-status">
                {syncStatus === 'syncing' ? (
                  <>
                    <div className="sync-dot syncing"></div>
                    <span>Refreshing store sales...</span>
                  </>
                ) : syncStatus === 'failed' ? (
                  <>
                    <div className="sync-dot failed"></div>
                    <span>Sync failed. Click retry to resolve.</span>
                  </>
                ) : (
                  <>
                    <div className="sync-dot completed"></div>
                    <span>
                      Up to date (Last checked:{' '}
                      {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Never'})
                    </span>
                  </>
                )}
              </div>
              
              {syncStatus !== 'syncing' && (
                <button 
                  onClick={triggerSync} 
                  className="btn btn-secondary btn-small"
                  disabled={syncingActive}
                >
                  <RefreshCw size={12} />
                  Sync now
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <SkeletonDashboard />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
export const dynamic = 'force-dynamic';
