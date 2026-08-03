import { inngest } from '@/lib/inngest'
import { parsePaper, runStage1ForPaper, runStage2ForPaper, runStage3ForPaper, markPaperError } from '@/lib/pipeline'

export const extractPaper = inngest.createFunction(
  {
    id: 'extract-paper',
    retries: 2, // each step retries up to 2x automatically on failure
    onFailure: async ({ event }) => {
      const paperId = event.data.event.data.paperId
      await markPaperError(paperId, 'Extraction failed after retries — the paper may be malformed or too complex to process.')
    }
  },
  { event: 'paper/uploaded' },
  async ({ event, step }) => {
    const { paperId } = event.data

    await step.run('parse', () => parsePaper(paperId))
    await step.run('stage1-extract', () => runStage1ForPaper(paperId))
    await step.run('stage2-structure', () => runStage2ForPaper(paperId))
    await step.run('stage3-verify', () => runStage3ForPaper(paperId))

    return { paperId, status: 'complete' }
  }
)
