'use client'

import { useState, useRef } from 'react'

export default function UploadZone({ onFilesSelected }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf')
    if (files.length) onFilesSelected(files)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `1px solid ${dragging ? 'var(--ink)' : 'var(--line-strong)'}`,
        borderStyle: 'dashed',
        borderRadius: 'var(--radius)',
        padding: '40px 24px',
        textAlign: 'center',
        background: dragging ? 'var(--panel)' : 'var(--paper)',
        cursor: 'pointer'
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          const files = Array.from(e.target.files)
          if (files.length) onFilesSelected(files)
        }}
      />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 6 }}>
        Add papers to this project
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 4 }}>
        Drop PDFs here, or click to browse
      </div>
      <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
        TEXT PDF OR SCANNED — BOTH SUPPORTED
      </div>
    </div>
  )
}
