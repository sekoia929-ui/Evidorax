import Link from 'next/link'
import { posts } from '@/lib/posts'
import { notFound } from 'next/navigation'

const dark = { bg: '#0D0F12', text: '#F2F1EC', muted: '#9296A0', line: '#25282E' }

export function generateStaticParams() {
  return posts.map(post => ({ slug: post.slug }))
}

export function generateMetadata({ params }) {
  const post = posts.find(p => p.slug === params.slug)
  if (!post) return {}
  return { title: `${post.title} — EvidoraX`, description: post.description }
}

export default function BlogPost({ params }) {
  const post = posts.find(p => p.slug === params.slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { '@type': 'Organization', name: 'EvidoraX' }
  }

  return (
    <div style={{ background: dark.bg, color: dark.text, minHeight: '100vh', padding: '60px 40px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/blog" style={{ color: dark.muted, fontSize: 13 }}>← All posts</Link>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, margin: '24px 0 8px', maxWidth: 720 }}>{post.title}</h1>
      <div className="mono" style={{ fontSize: 11.5, color: dark.muted, marginBottom: 32 }}>{post.date}</div>
      <div
        style={{ fontSize: 15.5, lineHeight: 1.8, color: '#D6D8DB', maxWidth: 680, whiteSpace: 'pre-line' }}
        dangerouslySetInnerHTML={{ __html: post.content.replace(/## (.+)/g, '<h2 style="font-family: var(--font-display); font-size: 22px; margin: 32px 0 12px; color: white;">$1</h2>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
      />
    </div>
  )
}
