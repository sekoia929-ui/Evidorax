'use client'

export default function Topbar({ projectName, paperCount, onExport }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 28px',
      borderBottom: '1px solid var(--line)',
      background: 'var(--paper)'
    }}>
      <div>
        <h1 style={{ fontSize: 19 }}>{projectName || 'Select a project'}</h1>
        {projectName && (
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
            {paperCount} {paperCount === 1 ? 'PAPER' : 'PAPERS'}
          </div>
        )}
      </div>

      {projectName && (
        <button
          onClick={onExport}
          style={{
            background: 'var(--ink)',
            color: 'var(--paper)',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '9px 16px',
            fontSize: 13,
            fontWeight: 500
          }}
        >
          Export table
        </button>
      )}
    </div>
  )
}
