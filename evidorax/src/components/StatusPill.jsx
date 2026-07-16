'use client'

const STAGES = {
  uploaded:  { label: 'Queued',       color: 'var(--text-muted)' },
  parsing:   { label: 'Parsing',      color: 'var(--review)' },
  extracting:{ label: 'Extracting',   color: 'var(--review)' },
  verifying: { label: 'Verifying',    color: 'var(--review)' },
  complete:  { label: 'Complete',     color: 'var(--verified)' },
  error:     { label: 'Error',        color: 'var(--contradicted)' }
}

export default function StatusPill({ status }) {
  const s = STAGES[status] || STAGES.uploaded
  const pulsing = ['parsing', 'extracting', 'verifying'].includes(status)

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 11.5,
      color: s.color
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: s.color,
        animation: pulsing ? 'evx-pulse 1.4s ease-in-out infinite' : 'none'
      }} />
      {s.label}
      <style>{`
        @keyframes evx-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </span>
  )
}
