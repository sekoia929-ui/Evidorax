'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const dark = {
  bg: '#0D0F12', panel: '#16181C', line: '#25282E',
  text: '#F2F1EC', muted: '#9296A0', accent: '#2DD4A8', error: '#E0685A'
}

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: dark.bg, color: dark.muted, fontSize: 13 }}>
        Loading…
      </div>
    )
  }

  if (session) {
    return children(session.user)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: dark.bg }}>
      <div style={{ width: 380, background: dark.panel, border: `1px solid ${dark.line}`, borderRadius: 12, padding: 36 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, marginBottom: 4, color: dark.text }}>
          Evidora<span style={{ color: dark.accent }}>X</span>
        </div>
        <div className="mono" style={{ fontSize: 11, color: dark.muted, marginBottom: 28, letterSpacing: '0.04em' }}>
          EVIDENCE EXTRACTION
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 12.5, color: dark.muted, marginBottom: 6 }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', marginBottom: 18, boxSizing: 'border-box',
              background: dark.bg, border: `1px solid ${dark.line}`, borderRadius: 6,
              fontSize: 13.5, fontFamily: 'var(--font-sans)', color: dark.text, outline: 'none'
            }}
          />

          <label style={{ display: 'block', fontSize: 12.5, color: dark.muted, marginBottom: 6 }}>Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px', marginBottom: 22, boxSizing: 'border-box',
              background: dark.bg, border: `1px solid ${dark.line}`, borderRadius: 6,
              fontSize: 13.5, fontFamily: 'var(--font-sans)', color: dark.text, outline: 'none'
            }}
          />

          {error && (
            <div style={{ fontSize: 12.5, color: dark.error, marginBottom: 16 }}>{error}</div>
          )}
          {info && (
            <div style={{ fontSize: 12.5, color: dark.accent, marginBottom: 16 }}>{info}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', background: dark.accent, color: '#08110E', border: 'none',
              borderRadius: 6, padding: '11px', fontSize: 14, fontWeight: 600,
              opacity: submitting ? 0.6 : 1, cursor: submitting ? 'default' : 'pointer'
            }}
          >
            {submitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: 20, fontSize: 13, color: dark.muted, textAlign: 'center' }}>
          {mode === 'signin' ? (
            <>Don't have an account?{' '}
              <button onClick={() => { setMode('signup'); setError(''); setInfo('') }} style={{ background: 'none', border: 'none', color: dark.accent, fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}>
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => { setMode('signin'); setError(''); setInfo('') }} style={{ background: 'none', border: 'none', color: dark.accent, fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}>
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
