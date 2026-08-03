import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'
import { runStage2 } from '@/lib/claude'

export const maxDuration = 60

export async function POST(request) {
  const { paperId } = await request.json()
  const t0 = Date.now()

  try {
    const { data: paper, error: paperError } = await supabaseAdmin
      .from('papers')
      .select('*')
      .eq('id', paperId)
      .single()

    if (paperError) throw paperError

    await supabaseAdmin.from('papers').update({ status: 'parsing' }).eq('id', paperId)

    console.log(`[parse] fetched paper record: ${Date.now() - t0}ms`)

    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('papers')
      .download(paper.storage_path)

    if (downloadError) throw downloadError

    console.log(`[parse] downloaded PDF from storage: ${Date.now() - t0}ms, size=${fileData.size} bytes`)

    let pdfText = await extractTextFromPdf(fileData)

    console.log(`[parse] pdf-parse finished: ${Date.now() - t0}ms, chars=${pdfText.length}`)

  const MAX_CHARS = 10000
const wasTruncated = pdfText.length > MAX_CHARS
if (wasTruncated) {
  pdfText = pdfText.slice(0, MAX_CHARS) + '\n\n[TEXT TRUNCATED — paper exceeds processing limit, later sections omitted]'
}

if (wasTruncated) {
  await supabaseAdmin.from('papers').update({ text_truncated: true }).eq('id', paperId)
}

    await supabaseAdmin.from('extractions_raw').upsert({
      paper_id: paperId,
      raw_text: pdfText
    })

    console.log(`[parse] saved raw_text to DB: ${Date.now() - t0}ms`)

    return NextResponse.json({ success: true, paperId })

  } catch (error) {
    console.log(`[parse] FAILED at ${Date.now() - t0}ms: ${error.message}`)
    await supabaseAdmin.from('papers').update({
      status: 'error',
      error_message: `Parse failed: ${error.message}`
    }).eq('id', paperId)

    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

async function extractTextFromPdf(fileBlob) {
  const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default
  const buffer = Buffer.from(await fileBlob.arrayBuffer())
  const data = await pdfParse(buffer)
  return data.text
}
