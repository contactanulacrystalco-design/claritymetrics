import React from 'react';

export default function SkeletonDashboard() {
  return (
    <div style={{ marginTop: '24px' }}>
      {/* 3 Metric Cards Skeletons */}
      <div className="metrics-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card metric-card" style={{ minHeight: '160px' }}>
            <div>
              <div className="shimmer skeleton-title" style={{ width: '50%' }}></div>
              <div className="shimmer skeleton-val" style={{ width: '70%', height: '40px' }}></div>
            </div>
            <div className="shimmer skeleton-text" style={{ width: '30%', height: '20px', margin: 0 }}></div>
          </div>
        ))}
      </div>

      {/* AI Insight Card Skeleton */}
      <div className="insight-container" style={{ marginTop: '32px' }}>
        <div className="card insight-card" style={{ padding: '32px', minHeight: '180px' }}>
          <div className="insight-title-row">
            <div className="shimmer skeleton-title" style={{ width: '120px', height: '24px', borderRadius: '50px' }}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            <div className="shimmer skeleton-text" style={{ width: '100%' }}></div>
            <div className="shimmer skeleton-text" style={{ width: '95%' }}></div>
            <div className="shimmer skeleton-text" style={{ width: '70%' }}></div>
          </div>
          <div className="insight-numbers-row" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', gap: '32px' }}>
              <div>
                <div className="shimmer skeleton-text" style={{ width: '60px', height: '20px' }}></div>
                <div className="shimmer skeleton-text" style={{ width: '80px', height: '12px', marginTop: '6px' }}></div>
              </div>
              <div>
                <div className="shimmer skeleton-text" style={{ width: '60px', height: '20px' }}></div>
                <div className="shimmer skeleton-text" style={{ width: '80px', height: '12px', marginTop: '6px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Status Bar Skeleton */}
      <div className="sync-bar" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="sync-dot syncing"></div>
          <div className="shimmer skeleton-text" style={{ width: '200px', height: '14px', marginBottom: 0 }}></div>
        </div>
        <div className="shimmer skeleton-text" style={{ width: '80px', height: '32px', borderRadius: '8px', marginBottom: 0 }}></div>
      </div>
    </div>
  );
}
