import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-signature')

  const hmac = crypto.createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET)
  const digest = hmac.update(rawBody).digest('hex')

  if (signature !== digest) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  if (event.meta.event_name === 'order_created') {
    const userId = event.meta.custom_data?.user_id
    const status = event.data.attributes.status

    if (userId && status === 'paid') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('papers_limit')
        .eq('id', userId)
        .single()

      await supabaseAdmin
        .from('profiles')
        .update({
          papers_limit: (profile?.papers_limit || 5) + 10,
          plan: 'paid'
        })
        .eq('id', userId)
    }
  }

  return NextResponse.json({ received: true })
}
