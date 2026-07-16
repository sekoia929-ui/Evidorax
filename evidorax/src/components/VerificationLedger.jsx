'use client'

// The QC strip. One segmented bar per paper showing how much of the
// extraction is verified against source text vs inferred vs flagged.
// This is the single visual signature of the product — evidence
// provenance made legible at a glance.

export default function VerificationLedger({ verified = 0, inferred = 0, review = 0, notFound = 0, compact = false }) {
  const total = verified + inferred + review + notFound || 1
  const segments = [
    { count: verified, color: 'var(--verified)', label: 'Verified' },
    { count: inferred, color: '#4C8A78', label: 'Inferred' },
    { count: review, color: 'var(--review)', label: 'Review' },
    { count: notFound, color: 'var(--line-strong)', label: 'Not found' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: compact ? 120 : 180 }}>
      <div style={{ display: 'flex', height: compact ? 5 : 6, borderRadius: 2, overflow: 'hidden', background: 'var(--line)' }}>
        {segments.map((s, i) => (
          s.count > 0 && (
            <div
              key={i}
              title={`${s.label}: ${s.count}`}
              style={{ width: `${(s.count / total) * 100}%`, background: s.color }}
            />
          )
        ))}
      </div>
      {!compact && (
        <div style={{ display: 'flex', gap: 10 }}>
          {segments.map((s, i) => (
            s.count > 0 && (
              <span key={i} className="mono" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                <span style={{ color: s.color }}>&#9632;</span> {s.count}
              </span>
            )
          ))}
        </div>
      )}
    </div>
  )
}
