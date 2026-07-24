'use client'

import { useState } from 'react'
import VerificationLedger from './VerificationLedger'
import StatusPill from './StatusPill'
import FieldRow from './FieldRow'

// One paper's evidence card, collapsed by default, expands into
// PICO / Raw Data / GRADE sections. This is the primary reading
// surface — modelled on a lab dossier, not a spreadsheet.

function EvidenceCard({ paper, extraction, verification }) {
  const [expanded, setExpanded] = useState(false)

  const fv = verification?.field_verification || {}
  const getStatus = (key) => fv[key]?.status?.toLowerCase() || 'unverifiable'
  const getSource = (key) => fv[key]?.source_sentence || ''

  return (
    <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', marginBottom: 10 }}>
      {/* Header row */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          cursor: 'pointer'
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {extraction?.title || paper.filename}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
            {extraction?.authors || '—'} {extraction?.year ? `\u00b7 ${extraction.year}` : ''}
          </div>
        </div>

       <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
  <StatusPill status={paper.status} />
  {paper.status === 'error' && paper.error_message && (
    <span
      title={paper.error_message}
      className="mono"
      style={{ fontSize: 11, color: 'var(--contradicted)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
    >
      {paper.error_message}
    </span>
  )}
  {verification && (
            <VerificationLedger
              verified={verification.verified_count}
              inferred={0}
              review={verification.total_fields - verification.verified_count - verification.contradicted_count - verification.unverifiable_count}
              notFound={verification.unverifiable_count}
              compact
            />
          )}
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            {expanded ? '\u2212' : '+'}
          </span>
        </div>
      </div>

      {/* Expanded evidence */}
      {expanded && extraction && (
        <div style={{ borderTop: '1px solid var(--line)', padding: '4px 18px 18px' }}>

          <SectionLabel>Population, intervention, comparator, outcome</SectionLabel>
          <FieldRow label="Population" value={extraction.population_description} status={getStatus('population_description')} sourceSentence={getSource('population_description')} />
          <FieldRow label="Age range" value={extraction.population_age_range} status={getStatus('age_range')} sourceSentence={getSource('age_range')} />
          <FieldRow label="Sample size" value={extraction.population_sample_size} status={getStatus('sample_size_total')} sourceSentence={getSource('sample_size_total')} />
          <FieldRow label="Intervention" value={extraction.intervention_name} status={getStatus('intervention_name')} sourceSentence={getSource('intervention_name')} />
          <FieldRow label="Dose / route" value={[extraction.intervention_dose, extraction.intervention_route].filter(Boolean).join(' \u00b7 ')} status={getStatus('intervention_dose')} sourceSentence={getSource('intervention_dose')} />
          <FieldRow label="Comparator" value={extraction.comparator_type} status={getStatus('comparator_type')} sourceSentence={getSource('comparator_type')} />
          <FieldRow label="Primary outcome" value={extraction.outcome_primary} status={getStatus('primary_outcome')} sourceSentence={getSource('primary_outcome')} />
          <FieldRow label="Follow-up" value={extraction.outcome_followup} status={getStatus('follow_up_duration')} sourceSentence={getSource('follow_up_duration')} />

          <SectionLabel top>Effect estimate</SectionLabel>
          <FieldRow label="N (treatment / control)" value={extraction.n_treatment && extraction.n_control ? `${extraction.n_treatment} / ${extraction.n_control}` : null} status={getStatus('n_treatment')} sourceSentence={getSource('n_treatment')} />
          <FieldRow label="Events (treatment / control)" value={extraction.events_treatment && extraction.events_control ? `${extraction.events_treatment} / ${extraction.events_control}` : null} status={getStatus('events_treatment')} sourceSentence={getSource('events_treatment')} />
          <FieldRow label="Effect size" value={extraction.effect_measure_type && extraction.effect_size ? `${extraction.effect_measure_type} ${extraction.effect_size}` : null} status={getStatus('effect_size')} sourceSentence={getSource('effect_size')} />
          <FieldRow label="95% CI" value={extraction.ci_lower && extraction.ci_upper ? `${extraction.ci_lower} \u2013 ${extraction.ci_upper}` : null} status={getStatus('confidence_interval')} sourceSentence={getSource('confidence_interval')} />

          <SectionLabel top>GRADE assessment</SectionLabel>
          <FieldRow label="Risk of bias" value={extraction.grade_risk_of_bias_score} status={getStatus('grade_risk_of_bias')} sourceSentence={extraction.grade_risk_of_bias_reason} />
          <FieldRow label="Inconsistency" value={extraction.grade_inconsistency_score} status={getStatus('grade_inconsistency')} sourceSentence={extraction.grade_inconsistency_reason} />
          <FieldRow label="Indirectness" value={extraction.grade_indirectness_score} status={getStatus('grade_indirectness')} sourceSentence={extraction.grade_indirectness_reason} />
          <FieldRow label="Imprecision" value={extraction.grade_imprecision_score} status={getStatus('grade_imprecision')} sourceSentence={extraction.grade_imprecision_reason} />
          <FieldRow label="Overall quality" value={extraction.grade_overall} status={getStatus('grade_overall')} sourceSentence="" />

        </div>
      )}
    </div>
  )
}

function SectionLabel({ children, top }) {
  return (
    <div className="mono" style={{
      fontSize: 10,
      letterSpacing: '0.06em',
      color: 'var(--text-muted)',
      marginTop: top ? 20 : 8,
      marginBottom: 6
    }}>
      {children.toUpperCase()}
    </div>
  )
}

export default function ExtractionDossier({ papers = [] }) {
  if (papers.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 6, color: 'var(--text-secondary)' }}>
          No papers in this project yet
        </div>
        <div style={{ fontSize: 12.5 }}>Add a PDF above to begin extraction.</div>
      </div>
    )
  }

  return (
    <div>
      {papers.map((paper) => (
        <EvidenceCard
          key={paper.id}
          paper={paper}
          extraction={paper.extractions_structured?.[0]}
          verification={paper.verifications?.[0]}
        />
      ))}
    </div>
  )
}
