import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { runStage1 } from '@/lib/claude'

export const maxDuration = 60

export async function POST(request) {
  const { paperId } = await request.json()

  try {
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

    const pdfText = await extractTextFromPdf(fileData)

    await supabaseAdmin.from('papers').update({ status: 'extracting' }).eq('id', paperId)

    const stage1Output = await runStage1(pdfText)

    await supabaseAdmin.from('extractions_raw').upsert({
      paper_id: paperId,
      raw_text: pdfText,
      stage1_output: stage1Output
    })

    return NextResponse.json({ success: true, paperId })

  } catch (error) {
    await supabaseAdmin.from('papers').update({
      status: 'error',
      error_message: `Stage 1 failed: ${error.message}`
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
