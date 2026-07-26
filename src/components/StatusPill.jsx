'use client'

import { useState, useEffect } from 'react'

const STAGES = {
  uploaded:   { label: 'Queued',      color: 'var(--text-muted)', percent: 5 },
  parsing:    { label: 'Parsing',     color: 'var(--review)',     percent: 20 },
  extracting: { label: 'Extracting',  color: 'var(--review)',     percent: 60 },
  verifying:  { label: 'Verifying',   color: 'var(--review)',     percent: 90 },
  complete:   { label: 'Complete',    color: 'var(--verified)',   percent: 100 },
  error:      { label: 'Error',       color: 'var(--contradicted)', percent: 100 }
}

function formatElapsed(seconds) {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export default function StatusPill({ status, startedAt }) {
  const s = STAGES[status] || STAGES.uploaded
  const pulsing = ['parsing', 'extracting', 'verifying'].includes(status)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startedAt || !pulsing) return
    const start = new Date(startedAt).getTime()
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [startedAt, pulsing])

  if (status === 'complete') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--verified)' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="7" fill="var(--verified)" />
          <path d="M4 7L6 9L10 4.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Complete
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--contradicted)' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="7" fill="var(--contradicted)" />
          <path d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        Error
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 110 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: s.color }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: s.color,
          animation: pulsing ? 'evx-pulse 1.4s ease-in-out infinite' : 'none'
        }} />
        {s.label}
        {pulsing && (
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
            {formatElapsed(elapsed)}
          </span>
        )}
        <style>{`
          @keyframes evx-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.35; }
          }
        `}</style>
      </div>
      <div style={{ height: 3, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${s.percent}%`, background: s.color, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}
