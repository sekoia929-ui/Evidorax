'use client'

import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const stored = localStorage.getItem('evidorax-theme') || 'light'
    setTheme(stored)
    document.documentElement.setAttribute('data-theme', stored)
  }, [])

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('evidorax-theme', next)
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      style={{
        background: 'none', border: '1px solid var(--line-strong)', borderRadius: 4,
        width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-secondary)', cursor: 'pointer'
      }}
    >
      {theme === 'light' ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
    </button>
  )
}
