'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined)
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setInfo('Account created. Check your email to confirm, then sign in.')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        Loading…
      </div>
    )
  }

  if (session) {
    return children(session.user)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--panel)' }}>
      <div style={{ width: 360, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 32 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
          Evidora<span style={{ color: 'var(--verified)' }}>X</span>
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 24, letterSpacing: '0.04em' }}>
          EVIDENCE EXTRACTION
        </div>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '9px 10px', marginBottom: 14, border: '1px solid var(--line-strong)', borderRadius: 'var(--radius)', fontSize: 13, fontFamily: 'var(--font-sans)' }} />
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Password</label>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '9px 10px', marginBottom: 18, border: '1px solid var(--line-strong)', borderRadius: 'var(--radius)', fontSize: 13, fontFamily: 'var(--font-sans)' }} />
          {error && <div style={{ fontSize: 12, color: 'var(--contradicted)', marginBottom: 14 }}>{error}</div>}
          {info && <div style={{ fontSize: 12, color: 'var(--verified)', marginBottom: 14 }}>{info}</div>}
          <button type="submit" disabled={submitting}
            style={{ width: '100%', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 'var(--radius)', padding: '10px', fontSize: 13, fontWeight: 500, opacity: submitting ? 0.6 : 1 }}>
            {submitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <div style={{ marginTop: 16, fontSize: 12.5, color: 'var(--text-secondary)', textAlign: 'center' }}>
          {mode === 'signin' ? (
            <>Don't have an account?{' '}
              <button onClick={() => { setMode('signup'); setError(''); setInfo('') }} style={{ background: 'none', border: 'none', color: 'var(--verified)', fontSize: 12.5, textDecoration: 'underline' }}>Sign up</button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => { setMode('signin'); setError(''); setInfo('') }} style={{ background: 'none', border: 'none', color: 'var(--verified)', fontSize: 12.5, textDecoration: 'underline' }}>Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
