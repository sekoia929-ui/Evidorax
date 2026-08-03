import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { extractPaper } from '@/inngest/functions'

export const maxDuration = 60

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [extractPaper]
})
