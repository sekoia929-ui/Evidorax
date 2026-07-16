'use client'

import { useState } from 'react'

// A small monospace reference tag next to any extracted value.
// Clicking it reveals the exact source sentence it was pulled from.
// This is what makes the extraction defensible to a guideline committee.

export default function CitationTag({ page, status = 'verified', sourceSentence }) {
  const [open, setOpen] = useState(false)

  const statusColor = {
    verified: 'var(--verified)',
    inferred: '#4C8A78',
    review: 'var(--review)',
    contradicted: 'var(--contradicted)',
    unverifiable: 'var(--notfound)'
  }[status] || 'var(--text-muted)'

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        className="mono"
        style={{
          background: 'none',
          border: 'none',
          color: statusColor,
          fontSize: 11,
          padding: '0 0 0 5px',
          verticalAlign: 'baseline'
        }}
      >
        [{page ? `p.${page}` : 'src'}]
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          zIndex: 20,
          top: '120%',
          left: 0,
          width: 280,
          background: 'var(--ink)',
          color: '#F6F6F3',
          padding: '10px 12px',
          borderRadius: 'var(--radius)',
          fontSize: 12,
          lineHeight: 1.5
        }}>
          <div className="mono" style={{ fontSize: 10, color: statusColor, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {status}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)' }}>
            &ldquo;{sourceSentence || 'No source sentence recorded.'}&rdquo;
          </div>
        </div>
      )}
    </span>
  )
}
