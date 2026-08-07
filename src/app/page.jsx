import Link from 'next/link'

const dark = {
  bg: '#0D0F12', panel: '#16181C', line: '#25282E',
  text: '#F2F1EC', muted: '#9296A0', accent: '#2DD4A8'
}

export default function LandingPage() {
  return (
    <div style={{ background: dark.bg, color: dark.text, minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: `1px solid ${dark.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: dark.accent }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600 }}>EvidoraX</span>
        </div>
        <div style={{ display: 'flex', gap: 32, fontSize: 14, color: dark.muted }}>
          <a href="#features" style={{ color: 'inherit' }}>Features</a>
          <a href="#pricing" style={{ color: 'inherit' }}>Pricing</a>
          <a href="#privacy" style={{ color: 'inherit' }}>Privacy</a>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/dashboard" style={{ color: dark.muted, fontSize: 14 }}>Sign in</Link>
          <Link href="/dashboard" style={{ background: dark.accent, color: '#08110E', padding: '9px 16px', borderRadius: 6, fontSize: 14, fontWeight: 500 }}>
            Start extracting
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '90px 40px 60px', maxWidth: 900 }}>
        <div style={{ display: 'inline-block', border: `1px solid ${dark.line}`, borderRadius: 20, padding: '6px 14px', fontSize: 11.5, color: dark.muted, marginBottom: 24 }}>
          ● RESEARCH EXTRACTION TOOL
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 1.1, marginBottom: 24 }}>
          Turn research PDFs into <em style={{ fontStyle: 'italic' }}>structured evidence</em>
        </h1>
        <p style={{ fontSize: 17, color: dark.muted, lineHeight: 1.7, marginBottom: 36, maxWidth: 680 }}>
          EvidoraX extracts structured study data from research literature — authors, design, population, intervention, comparator, outcomes — and organises it into editable, review-ready records. Built for systematic reviewers, clinicians, and research analysts.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <Link href="/dashboard" style={{ background: dark.accent, color: '#08110E', padding: '12px 22px', borderRadius: 6, fontSize: 14.5, fontWeight: 500 }}>
            Start extracting →
          </Link>
          <a href="#how" style={{ color: dark.muted, fontSize: 14.5 }}>See how it works ›</a>
        </div>
        <p style={{ color: '#5B5F66', fontSize: 13 }}>Designed for researchers who care about accuracy and reproducibility.</p>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: '0 40px 80px' }}>
        <div style={{ border: `1px solid ${dark.line}`, borderRadius: 12, padding: 36, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {[
            ['01', 'Upload PDF', 'Drop any research paper'],
            ['02', 'Extract fields', 'PICO + study details'],
            ['03', 'Review & edit', 'Correct with your expertise'],
            ['04', 'Save study', 'Build your evidence library']
          ].map(([n, title, desc]) => (
            <div key={n}>
              <div className="mono" style={{ color: dark.accent, fontSize: 12, marginBottom: 8 }}>{n}</div>
              <div style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 4 }}>{title}</div>
              <div style={{ color: dark.muted, fontSize: 13.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '0 40px 90px' }}>
        <div className="mono" style={{ color: dark.accent, fontSize: 11.5, marginBottom: 12 }}>WHAT IT DOES</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 38, marginBottom: 48 }}>Every part of the extraction workflow</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
          {[
            ['PDF-to-fields extraction', 'Upload any research PDF and receive a structured breakdown of key study characteristics — authors, design, population, intervention, comparator, and outcomes.'],
            ['Human-in-the-loop review', 'Every extracted field is editable. Review, correct, and annotate extraction results before committing a record.'],
            ['Study library management', 'Saved studies accumulate in a searchable dashboard. Track extraction status across your entire evidence library.'],
            ['Systematic review–ready', 'Fields align with PICO and standard data extraction frameworks, export-ready for evidence synthesis.'],
            ['Built for research teams', 'Focused on researchers, clinicians, and analysts who work with large volumes of primary literature.'],
            ['Private by design', 'Your documents stay in your account. No sharing, no public indexing, structured for institutional privacy requirements.']
          ].map(([title, desc]) => (
            <div key={title}>
              <div style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 8 }}>{title}</div>
              <div style={{ color: dark.muted, fontSize: 13.5, lineHeight: 1.7 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '0 40px 90px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 38, marginBottom: 12 }}>Simple plans for researchers and teams</h2>
        <p style={{ color: dark.muted, fontSize: 15, marginBottom: 48, maxWidth: 560 }}>
          Try it for a few dollars, no commitment. Upgrade only once it's part of your real workflow.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { name: 'Try it out', price: '$4.99', period: 'one-time', desc: '10 paper extractions to test on your own literature.', features: ['10 document extractions', 'All PICO + GRADE fields', 'Manual editing and review', 'No subscription'], cta: 'Try for $4.99', highlight: false },
            { name: 'Professional', price: '$29', period: '/month', desc: 'For analysts and clinicians with regular evidence workloads.', features: ['Unlimited document uploads', 'Priority extraction queue', 'Excel export for all studies', 'Email support'], cta: 'Start subscription', highlight: true },
            { name: 'Team', price: '$99', period: '/month', desc: 'For systematic review teams and research institutions.', features: ['Everything in Professional', 'Up to 5 team members', 'Role-based access', 'Priority support'], cta: 'Start subscription', highlight: false },
            { name: 'Institution', price: 'Custom', period: '', desc: 'For universities, guideline bodies, and large teams.', features: ['Unlimited team members', 'API access', 'Dedicated support', 'Custom data field mapping'], cta: 'Contact us', highlight: false }
          ].map((plan) => (
            <div key={plan.name} style={{
              border: `1px solid ${plan.highlight ? dark.accent : dark.line}`,
              borderRadius: 12, padding: 28, display: 'flex', flexDirection: 'column'
            }}>
              {plan.highlight && <div className="mono" style={{ color: dark.accent, fontSize: 10.5, marginBottom: 10 }}>MOST POPULAR</div>}
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{plan.name}</div>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 30 }}>{plan.price}</span>
                <span style={{ color: dark.muted, fontSize: 13 }}> {plan.period}</span>
              </div>
              <p style={{ color: dark.muted, fontSize: 12.5, marginBottom: 20, minHeight: 50 }}>{plan.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: 12.5, color: dark.muted, marginBottom: 8, display: 'flex', gap: 8 }}>
                    <span style={{ color: dark.accent }}>●</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" style={{
                textAlign: 'center', padding: '10px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                background: plan.highlight ? dark.accent : 'transparent',
                color: plan.highlight ? '#08110E' : dark.text,
                border: plan.highlight ? 'none' : `1px solid ${dark.line}`
              }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section id="privacy" style={{ padding: '0 40px 90px' }}>
        <div className="mono" style={{ color: dark.accent, fontSize: 11.5, marginBottom: 12 }}>PRIVACY &amp; DATA</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, marginBottom: 24 }}>Your documents are yours</h2>
        <p style={{ color: dark.muted, fontSize: 14.5, lineHeight: 1.8, maxWidth: 560, marginBottom: 12 }}>
          EvidoraX processes documents within your private account. No document content is shared, sold, or used to train external models.
        </p>
        <p style={{ color: dark.muted, fontSize: 14.5, lineHeight: 1.8, maxWidth: 560 }}>
          Document storage is isolated per account. You may delete any document or study record at any time.
        </p>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${dark.line}`, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>EvidoraX</span>
          <div style={{ display: 'flex', gap: 24, fontSize: 13, color: dark.muted }}>
            <span>Privacy</span><span>Terms</span><span>Contact</span>
          </div>
        </div>
        <p style={{ color: '#5B5F66', fontSize: 12.5 }}>© 2026 EvidoraX. All rights reserved.</p>
      </footer>
    </div>
  )
}
