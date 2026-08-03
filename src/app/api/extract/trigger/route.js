import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { inngest } from '@/lib/inngest'

export async function POST(request) {
  const { paperId } = await request.json()

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

  await inngest.send({
    name: 'paper/uploaded',
    data: { paperId }
  })

  return NextResponse.json({ success: true, paperId })
}
