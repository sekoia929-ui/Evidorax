import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { runFullExtraction } from '@/lib/claude'

export async function POST(request) {
  const { paperId } = await request.json()

  try {
    // 1. Fetch paper record and download PDF from storage
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

    // 2. Parse PDF to text (server-side parsing happens here via pdf-parse or similar)
    const pdfText = await extractTextFromPdf(fileData)

    // 3. Run the 3-stage Claude pipeline
    await supabaseAdmin.from('papers').update({ status: 'extracting' }).eq('id', paperId)

    const result = await runFullExtraction(pdfText, async (progress) => {
      const statusMap = { 1: 'extracting', 2: 'extracting', 3: 'verifying' }
      await supabaseAdmin.from('papers').update({ status: statusMap[progress.stage] }).eq('id', paperId)
    })

    // 4. Save raw extraction
    await supabaseAdmin.from('extractions_raw').upsert({
      paper_id: paperId,
      raw_text: pdfText,
      stage1_output: result.stage1Output
    })

    // 5. Save structured extraction (flatten nested JSON to columns)
    const d = result.structuredData
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

    // 6. Save verification report
    const v = result.verificationReport
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

    // 7. Log usage and mark complete
    await supabaseAdmin.from('usage_log').insert({
      user_id: paper.user_id,
      paper_id: paperId,
      api_calls: 3,
      estimated_cost_usd: result.estimatedCostUsd
    })

    await supabaseAdmin.from('papers').update({ status: 'complete' }).eq('id', paperId)
    await supabaseAdmin.rpc('increment_papers_used', { user_id_input: paper.user_id })

    return NextResponse.json({ success: true, paperId })

  } catch (error) {
    await supabaseAdmin.from('papers').update({
      status: 'error',
      error_message: error.message
    }).eq('id', paperId)

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Server-side PDF text extraction
// For scanned PDFs with low text yield, fall back to Claude Vision in claude.js
async function extractTextFromPdf(fileBlob) {
  const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default
  const buffer = Buffer.from(await fileBlob.arrayBuffer())
  const data = await pdfParse(buffer)
  return data.text
}
