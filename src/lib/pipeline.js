import { supabaseAdmin } from '@/lib/supabase'
import { runStage1, runStage2, runPass3 } from '@/lib/claude'

// ─────────────────────────────────────────────
// PARSE — download PDF, extract text, save it
// ─────────────────────────────────────────────
export async function parsePaper(paperId) {
  const { data: paper, error: paperError } = await supabaseAdmin
    .from('papers')
    .select('*')
    .eq('id', paperId)
    .single()

  if (paperError) throw paperError

  await supabaseAdmin.from('papers').update({ status: 'parsing' }).eq('id', paperId)

  const { data: fileData, error: downloadError } = await supabaseAdmin.storage
    .from('papers')
    .download(paper.storage_path)

  if (downloadError) throw downloadError

  let pdfText = await extractTextFromPdf(fileData)

  const MAX_CHARS = 30000
  const wasTruncated = pdfText.length > MAX_CHARS
  if (wasTruncated) {
    pdfText = pdfText.slice(0, MAX_CHARS) + '\n\n[TEXT TRUNCATED — paper exceeds processing limit, later sections omitted]'
  }

  await supabaseAdmin.from('extractions_raw').upsert({
    paper_id: paperId,
    raw_text: pdfText
  })

  if (wasTruncated) {
    await supabaseAdmin.from('papers').update({ text_truncated: true }).eq('id', paperId)
  }

  return { success: true }
}

async function extractTextFromPdf(fileBlob) {
  const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default
  const buffer = Buffer.from(await fileBlob.arrayBuffer())
  const data = await pdfParse(buffer)
  return data.text
}

// ─────────────────────────────────────────────
// STAGE 1 — giant extractor (Haiku)
// ─────────────────────────────────────────────
export async function runStage1ForPaper(paperId) {
  const { data: raw, error: rawError } = await supabaseAdmin
    .from('extractions_raw')
    .select('raw_text')
    .eq('paper_id', paperId)
    .single()

  if (rawError) throw rawError
  if (!raw?.raw_text) throw new Error('Parsed text missing — run parse first')

  await supabaseAdmin.from('papers').update({ status: 'extracting' }).eq('id', paperId)

  const stage1Output = await runStage1(raw.raw_text)

  await supabaseAdmin.from('extractions_raw').update({ stage1_output: stage1Output }).eq('paper_id', paperId)

  return { success: true }
}

// ─────────────────────────────────────────────
// STAGE 2 — structured refiner (Sonnet)
// ─────────────────────────────────────────────
export async function runStage2ForPaper(paperId) {
  const { data: raw, error: rawError } = await supabaseAdmin
    .from('extractions_raw')
    .select('stage1_output')
    .eq('paper_id', paperId)
    .single()

  if (rawError) throw rawError
  if (!raw?.stage1_output) throw new Error('Stage 1 output missing — cannot run Stage 2')

  const d = await runStage2(raw.stage1_output)

  await supabaseAdmin.from('extractions_raw').update({ stage2_json: d }).eq('paper_id', paperId)

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

  return { success: true }
}

// ─────────────────────────────────────────────
// STAGE 3 — verification pass (Haiku)
// ─────────────────────────────────────────────
export async function runStage3ForPaper(paperId) {
  const { data: raw, error: rawError } = await supabaseAdmin
    .from('extractions_raw')
    .select('stage1_output, stage2_json')
    .eq('paper_id', paperId)
    .single()

  if (rawError) throw rawError
  if (!raw?.stage1_output || !raw?.stage2_json) throw new Error('Stage 1/2 output missing — cannot verify')

  const v = await runPass3(raw.stage1_output, raw.stage2_json)

  await supabaseAdmin.from('verifications').upsert({
    paper_id: paperId,
    verification_report: v,
    total_fields: v.verification_summary?.total_fields || 0,
    verified_count: v.verification_summary?.verified || 0,
    inferred_count: v.verification_summary?.inferred || 0,
    contradicted_count: v.verification_summary?.contradicted || 0,
    unverifiable_count: v.verification_summary?.unverifiable || 0,
    accuracy_rate: v.verification_summary?.total_fields
      ? (v.verification_summary.verified / v.verification_summary.total_fields) * 100
      : 0
  })

  const { data: paper } = await supabaseAdmin.from('papers').select('user_id').eq('id', paperId).single()

  await supabaseAdmin.from('usage_log').insert({
    user_id: paper.user_id,
    paper_id: paperId,
    api_calls: 3,
    estimated_cost_usd: 0.25
  })

  await supabaseAdmin.from('papers').update({ status: 'complete' }).eq('id', paperId)
  await supabaseAdmin.rpc('increment_papers_used', { user_id_input: paper.user_id })

  return { success: true }
}

// Marks a paper as errored, called by the Inngest function on final failure
export async function markPaperError(paperId, message) {
  await supabaseAdmin.from('papers').update({
    status: 'error',
    error_message: message
  }).eq('id', paperId)
}
