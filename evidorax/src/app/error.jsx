'use client'

export default function Error({ error, reset }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'monospace', background: '#F6F6F3' }}>
      <div style={{ maxWidth: 640, background: '#fff', border: '1px solid #E4E2DC', borderRadius: 4, padding: 24 }}>
        <div style={{ fontSize: 13, color: '#B23A2E', fontWeight: 600, marginBottom: 10 }}>EvidoraX crashed — here's why</div>
        <div style={{ fontSize: 13, color: '#16191C', whiteSpace: 'pre-wrap', marginBottom: 16 }}>{error?.message || 'Unknown error'}</div>
        {error?.stack && (
          <details style={{ fontSize: 11, color: '#5C5F62', marginBottom: 16 }}>
            <summary style={{ cursor: 'pointer' }}>Stack trace</summary>
            <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{error.stack}</pre>
          </details>
        )}
        <button onClick={reset} style={{ background: '#16191C', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Try again</button>
      </div>
    </div>
  )
}
