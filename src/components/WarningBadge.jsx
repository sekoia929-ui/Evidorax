'use client'

export default function WarningBadge({ children, tooltip }) {
  return (
    <span
      title={tooltip}
      className="mono"
      style={{
        fontSize: 10.5,
        color: 'var(--review)',
        background: 'var(--review-bg)',
        padding: '2px 6px',
        borderRadius: 2,
        whiteSpace: 'nowrap'
      }}
    >
      ⚠ {children}
    </span>
  )
}
