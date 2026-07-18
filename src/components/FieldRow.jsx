'use client'

import CitationTag from './CitationTag'

export default function FieldRow({ label, value, page, status, sourceSentence, onEdit }) {
  const isEmpty = !value || value === 'NOT_FOUND'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '160px 1fr',
      gap: 16,
      padding: '9px 0',
      borderBottom: '1px solid var(--line)',
      alignItems: 'baseline'
    }}>
      <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{label}</span>
      <div>
        <span
          className={isEmpty ? '' : 'mono'}
          style={{
            fontSize: 13,
            color: isEmpty ? 'var(--text-muted)' : 'var(--text-primary)',
            fontStyle: isEmpty ? 'italic' : 'normal'
          }}
        >
          {isEmpty ? 'Not found' : value}
        </span>
        {!isEmpty && (
          <CitationTag page={page} status={status} sourceSentence={sourceSentence} />
        )}
      </div>
    </div>
  )
}
