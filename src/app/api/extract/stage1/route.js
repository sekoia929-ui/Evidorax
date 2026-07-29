import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

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
    const { data: raw, error: rawError } = await supabaseAdmin
      .from('extractions_raw')
      .select('raw_text')
      .eq('paper_id', paperId)
      .single()

    if (rawError) throw rawError
    if (!raw?.raw_text) throw new Error('Parsed text missing — run /parse first')

    await supabaseAdmin.from('papers').update({ status: 'extracting' }).eq('id', paperId)

    console.log(`[stage1] starting Haiku call: ${Date.now() - t0}ms, input chars=${raw.raw_text.length}`)

    const stage1Output = await runStage1(raw.raw_text)

    console.log(`[stage1] Haiku call finished: ${Date.now() - t0}ms`)

    await supabaseAdmin.from('extractions_raw').update({ stage1_output: stage1Output }).eq('paper_id', paperId)

    console.log(`[stage1] saved output: ${Date.now() - t0}ms`)

    return NextResponse.json({ success: true, paperId })

  } catch (error) {
    console.log(`[stage1] FAILED at ${Date.now() - t0}ms: ${error.message}`)
    await supabaseAdmin.from('papers').update({
      status: 'error',
      error_message: `Stage 1 failed: ${error.message}`
    }).eq('id', paperId)

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
