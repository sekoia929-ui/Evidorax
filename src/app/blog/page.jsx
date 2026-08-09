import Link from 'next/link'
import { posts } from '@/lib/posts'

const dark = { bg: '#0D0F12', panel: '#16181C', line: '#25282E', text: '#F2F1EC', muted: '#9296A0', accent: '#2DD4A8' }

export const metadata = {
  title: 'Blog — EvidoraX',
  description: 'Practical guides on PICO extraction, GRADE certainty ratings, and evidence synthesis for systematic reviewers.'
}

export default function BlogIndex() {
  return (
    <div style={{ background: dark.bg, color: dark.text, minHeight: '100vh', padding: '60px 40px' }}>
      <Link href="/" style={{ color: dark.muted, fontSize: 13 }}>← Back to EvidoraX</Link>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, margin: '24px 0 40px' }}>Evidence synthesis notes</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 720 }}>
        {posts.map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`} style={{ display: 'block', paddingBottom: 24, borderBottom: `1px solid ${dark.line}` }}>
            <div className="mono" style={{ fontSize: 11.5, color: dark.muted, marginBottom: 8 }}>{post.date}</div>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: dark.text }}>{post.title}</div>
            <div style={{ fontSize: 14, color: dark.muted, lineHeight: 1.6 }}>{post.description}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
