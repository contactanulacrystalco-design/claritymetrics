"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { Calendar, Sparkles, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

function WeeklyActionsContent() {
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop') || '';

  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<any[] | null>(null);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('pending');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shop) return;

    async function fetchWeeklyActions() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/weekly/data?shop=${encodeURIComponent(shop)}`);
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const data = await res.json();
        
        setActions(data.actions);
        setWeekStart(data.week_start);
        setSyncStatus(data.sync_status);
      } catch (err: any) {
        console.error('Fetch weekly actions error:', err);
        setError('Failed to load your weekly actions. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchWeeklyActions();
  }, [shop]);

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

  // Format week start date to a friendly format (e.g. "June 22, 2026")
  const formattedWeekOf = weekStart
    ? new Date(weekStart).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <>
      <Header />
      <main className="container" style={{ paddingBottom: '60px' }}>
        
        {/* Page title header */}
        <div style={{ marginBottom: '40px' }}>
          <div className="insight-tag" style={{ width: 'fit-content', marginBottom: '12px' }}>
            <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            <span>Weekly Priorities</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
            Actions for this week
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '1rem' }}>
            Your 3 prioritized actions for the week of <strong>{formattedWeekOf}</strong> based on 7-day store trends.
          </p>
        </div>

        {error && (
          <div className="error-banner" style={{ marginBottom: '24px' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          // Loading state skeleton
          <div className="weekly-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="weekly-item-card" style={{ opacity: 0.7 }}>
                <div className="shimmer" style={{ width: '48px', height: '48px', borderRadius: '50%' }}></div>
                <div style={{ flexGrow: 1 }}>
                  <div className="shimmer skeleton-title" style={{ width: '80%', height: '20px' }}></div>
                  <div className="shimmer skeleton-text" style={{ width: '40%', height: '14px', marginTop: '16px' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : syncStatus === 'pending' || !actions ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <AlertCircle size={36} className="text-warning" style={{ marginBottom: '16px' }} />
            <h3 style={{ marginBottom: '8px' }}>No Sales Data Found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
              We need to pull in your Shopify orders before we can analyze trends.
            </p>
            <a href={`/dashboard?shop=${encodeURIComponent(shop)}`} className="btn btn-primary">
              Go to Dashboard to Sync
            </a>
          </div>
        ) : (
          // Render Weekly Actions Checklist
          <div className="weekly-list">
            {actions.map((item: any, index: number) => (
              <div key={index} className="weekly-item-card">
                <div className="action-number-badge">
                  {index + 1}
                </div>
                
                <div className="action-content">
                  <p className="action-text">
                    {item.action}
                  </p>
                  
                  {item.supporting_numbers && (
                    <div className="action-stats">
                      {Object.values(item.supporting_numbers).map((stat: any, statIdx: number) => (
                        <div key={statIdx} className="supporting-number-box">
                          <span className="supporting-val" style={{ fontSize: '1.1rem' }}>{stat.value}</span>
                          <span className="supporting-lbl" style={{ fontSize: '0.75rem' }}>{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Action disclaimer */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                background: 'rgba(255,255,255,0.01)',
                border: '1px dashed var(--card-border)', 
                padding: '20px 24px', 
                borderRadius: 'var(--border-radius-md)',
                marginTop: '16px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}
            >
              <Sparkles size={16} className="text-warning" style={{ flexShrink: 0 }} />
              <span>
                These priorities compare the last 7 days of sales activity with historical patterns. They refresh once per week.
              </span>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default function WeeklyActions() {
  return (
    <Suspense fallback={
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <h3>Loading Weekly Actions...</h3>
      </div>
    }>
      <WeeklyActionsContent />
    </Suspense>
  );
}
export const dynamic = 'force-dynamic';
