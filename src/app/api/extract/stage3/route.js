import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { runPass3 } from '@/lib/claude'

export const maxDuration = 60

export async function POST(request) {
  const { paperId } = await request.json()

  try {
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

    return NextResponse.json({ success: true, paperId })

  } catch (error) {
    await supabaseAdmin.from('papers').update({
      status: 'error',
      error_message: `Stage 3 failed: ${error.message}`
    }).eq('id', paperId)

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
