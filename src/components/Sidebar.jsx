'use client'
export default function Sidebar({ projects = [], activeProjectId, onSelectProject, onNewProject, plan = 'free', papersUsed = 0, papersLimit = 5, userEmail, onSignOut }) {
  return (
    <aside style={{
      width: 260,
      minWidth: 260,
      height: '100vh',
      background: 'var(--paper)',
      borderRight: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Wordmark */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600 }}>
            Evidora<span style={{ color: 'var(--verified)' }}>X</span>
          </span>
        </div>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 3, letterSpacing: '0.04em' }}>
          EVIDENCE EXTRACTION
        </div>
      </div>

      {/* Case files */}
      <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 8px 8px'
        }}>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            PROJECTS
          </span>
          <button
            onClick={onNewProject}
            style={{
              background: 'none', border: 'none', color: 'var(--text-secondary)',
              fontSize: 16, lineHeight: 1, padding: 2
            }}
            aria-label="New project"
          >
            +
          </button>
        </div>

        {projects.length === 0 && (
          <div style={{ padding: '10px 8px', fontSize: 12.5, color: 'var(--text-muted)' }}>
            No projects yet. Start one to begin extracting.
          </div>
        )}

        {projects.map((p) => {
          const active = p.id === activeProjectId
          return (
            <button
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '9px 10px',
                marginBottom: 2,
                background: active ? 'var(--panel)' : 'transparent',
                border: 'none',
                borderLeft: active ? '2px solid var(--ink)' : '2px solid transparent',
                borderRadius: 0,
                fontSize: 13.5
              }}
            >
              <div style={{ color: 'var(--text-primary)', fontWeight: active ? 500 : 400 }}>
                {p.name}
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {p.papers?.[0]?.count ?? 0} papers
              </div>
            </button>
          )
        })}
      </div>

{userEmail && (
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
            {userEmail}
          </span>
          <button onClick={onSignOut} style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            Sign out
          </button>
        </div>
      )}
      
      {/* Usage strip */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{plan} plan</span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {papersUsed}/{plan === 'free' ? papersLimit : '\u221e'}
          </span>
        </div>
        {plan === 'free' && (
          <div style={{ height: 3, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(100, (papersUsed / papersLimit) * 100)}%`,
              background: 'var(--ink)'
            }} />
          </div>
        )}
      </div>
    </aside>
  )
}
