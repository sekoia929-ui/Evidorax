import Anthropic from '@anthropic-ai/sdk'
import { STAGE1_PROMPT, STAGE2_PROMPT, PASS3_PROMPT } from './prompts'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 8000

// ─────────────────────────────────────────────
// STAGE 1: Giant Extractor
// Takes raw PDF text, dumps everything
// ─────────────────────────────────────────────
export async function runStage1(pdfText, isScanned = false, imageBase64 = null) {
  let content

  if (isScanned && imageBase64) {
    // Use vision for scanned PDFs
    content = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: imageBase64
        }
      },
      {
        type: 'text',
        text: STAGE1_PROMPT
      }
    ]
  } else {
    // Use text for normal PDFs
    content = `${STAGE1_PROMPT}\n\nRESEARCH PAPER TEXT:\n${pdfText}`
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: 'user', content }]
  })

  return response.content[0].text
}

// ─────────────────────────────────────────────
// STAGE 2: Structured Refiner
// Takes Stage 1 output, returns clean JSON
// ─────────────────────────────────────────────
export async function runStage2(stage1Output) {
  const prompt = STAGE2_PROMPT(stage1Output)

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }]
  })

  const text = response.content[0].text

  // Clean JSON fences if present
  const cleaned = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch (e) {
    throw new Error(`Stage 2 JSON parse failed: ${e.message}\nRaw output: ${text.slice(0, 500)}`)
  }
}

// ─────────────────────────────────────────────
// PASS 3: Verifier
// Verifies every field against source text
// ─────────────────────────────────────────────
export async function runPass3(stage1Output, structuredJSON) {
  const prompt = PASS3_PROMPT(stage1Output, structuredJSON)

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: 'user', content: prompt }]
  })

  const text = response.content[0].text

  const cleaned = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch (e) {
    throw new Error(`Pass 3 JSON parse failed: ${e.message}`)
  }
}

// ─────────────────────────────────────────────
// Full pipeline — runs all 3 in sequence
// ─────────────────────────────────────────────
export async function runFullExtraction(pdfText, onProgress = () => {}) {
  const startTime = Date.now()

  // Stage 1
  onProgress({ stage: 1, message: 'Extracting all content from paper...' })
  const stage1Output = await runStage1(pdfText)

  // Stage 2
  onProgress({ stage: 2, message: 'Structuring PICO + GRADE + Raw Data...' })
  const structuredData = await runStage2(stage1Output)

  // Pass 3
  onProgress({ stage: 3, message: 'Verifying every field against source...' })
  const verificationReport = await runPass3(stage1Output, structuredData)

  const durationSeconds = (Date.now() - startTime) / 1000
  const estimatedCostUsd = 0.25 // rough estimate per paper

  return {
    stage1Output,
    structuredData,
    verificationReport,
    durationSeconds,
    estimatedCostUsd
  }
}
