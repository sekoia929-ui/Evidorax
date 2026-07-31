import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { runStage2 } from '@/lib/claude'

export const maxDuration = 60

export async function POST(request) {
  const { paperId } = await request.json()
  const t0 = Date.now()

  // ── Auth check ──────────────────────────────────
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  const supabaseAuth = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 })
  }

  const { data: ownerCheck, error: ownerError } = await supabaseAdmin
    .from('papers')
    .select('user_id')
    .eq('id', paperId)
    .single()

  if (ownerError || !ownerCheck || ownerCheck.user_id !== user.id) {
    return NextResponse.json({ success: false, error: 'Not authorized for this paper' }, { status: 403 })
  }
  // ────────────────────────────────────────────────

  try {
    // ...rest of the existing route logic continues here unchanged
    const { data: raw, error: rawError } = await supabaseAdmin
      .from('extractions_raw')
      .select('stage1_output')
      .eq('paper_id', paperId)
      .single()

    if (rawError) throw rawError
    if (!raw?.stage1_output) throw new Error('Stage 1 output missing — cannot run Stage 2')

    const d = await runStage2(raw.stage1_output)

    // Save the full nested JSON for Stage 3 to read later
    await supabaseAdmin.from('extractions_raw').update({ stage2_json: d }).eq('paper_id', paperId)

    // Flatten into the structured table for the UI
    await supabaseAdmin.from('extractions_structured').upsert({
      paper_id: paperId,
      title: d.study_info?.title,
      authors: d.study_info?.authors,
      year: d.study_info?.year,
      journal: d.study_info?.journal,
      study_design: d.study_info?.study_design,
      country: d.study_info?.country,
      funding_source: d.study_info?.funding_source,

      population_description: d.pico?.population?.description,
      population_age_range: d.pico?.population?.age_range,
      population_sample_size: d.pico?.population?.sample_size_total,
      population_inclusion: d.pico?.population?.inclusion_criteria,
      population_exclusion: d.pico?.population?.exclusion_criteria,

      intervention_name: d.pico?.intervention?.name,
      intervention_dose: d.pico?.intervention?.dose,
      intervention_route: d.pico?.intervention?.route,
      intervention_duration: d.pico?.intervention?.duration,
      intervention_frequency: d.pico?.intervention?.frequency,

      comparator_type: d.pico?.comparator?.type,
      comparator_description: d.pico?.comparator?.description,

      outcome_primary: d.pico?.outcome?.primary_outcome,
      outcome_secondary: d.pico?.outcome?.secondary_outcomes,
      outcome_followup: d.pico?.outcome?.follow_up_duration,
      outcome_tool: d.pico?.outcome?.outcome_measurement_tool,

      n_treatment: d.raw_data?.n_treatment,
      n_control: d.raw_data?.n_control,
      events_treatment: d.raw_data?.events_treatment,
      events_control: d.raw_data?.events_control,
      effect_measure_type: d.raw_data?.effect_measure_type,
      effect_size: d.raw_data?.effect_size,
      ci_lower: d.raw_data?.confidence_interval_lower,
      ci_upper: d.raw_data?.confidence_interval_upper,
      p_value: d.raw_data?.p_value,
      subgroup: d.raw_data?.subgroup,

      grade_risk_of_bias_score: d.grade?.risk_of_bias?.score,
      grade_risk_of_bias_reason: d.grade?.risk_of_bias?.reason,
      grade_risk_of_bias_source: d.grade?.risk_of_bias?.source_sentence,
      grade_inconsistency_score: d.grade?.inconsistency?.score,
      grade_inconsistency_reason: d.grade?.inconsistency?.reason,
      grade_indirectness_score: d.grade?.indirectness?.score,
      grade_indirectness_reason: d.grade?.indirectness?.reason,
      grade_imprecision_score: d.grade?.imprecision?.score,
      grade_imprecision_reason: d.grade?.imprecision?.reason,
      grade_publication_bias_score: d.grade?.publication_bias?.score,
      grade_publication_bias_reason: d.grade?.publication_bias?.reason,
      grade_overall: d.grade?.overall_evidence_quality,

      fields_not_found: d.extraction_flags?.fields_not_found || [],
      fields_needing_review: d.extraction_flags?.fields_needing_review || [],
      extractor_confidence: d.extraction_flags?.extractor_confidence
    })

    await supabaseAdmin.from('papers').update({ status: 'verifying' }).eq('id', paperId)

    return NextResponse.json({ success: true, paperId })

  } catch (error) {
    await supabaseAdmin.from('papers').update({
      status: 'error',
      error_message: `Stage 2 failed: ${error.message}`
    }).eq('id', paperId)

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
