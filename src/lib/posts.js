export const posts = [
  {
    slug: 'what-is-grade-certainty-rating',
    title: 'What is GRADE certainty rating, and why does it matter for systematic reviews?',
    description: 'A plain-language explanation of the GRADE framework — risk of bias, inconsistency, indirectness, imprecision, and publication bias — and how it determines evidence quality.',
    date: '2026-08-01',
    content: `
GRADE (Grading of Recommendations Assessment, Development and Evaluation) is the framework most guideline committees and systematic reviewers use to rate how much confidence to place in a body of evidence.

## The five GRADE domains

**Risk of bias** — Was the study well-designed and conducted? Randomization, allocation concealment, and blinding all factor in here.

**Inconsistency** — Do different studies on the same question agree with each other, or do results vary widely (measured partly through I² statistics)?

**Indirectness** — Does the study population, intervention, or outcome actually match the question you're trying to answer?

**Imprecision** — Is the confidence interval narrow enough, and the sample size large enough, to trust the effect estimate?

**Publication bias** — Is there reason to believe negative or null results were left unpublished, skewing the visible evidence?

## The four certainty levels

Based on these five domains, evidence is rated High, Moderate, Low, or Very Low certainty — starting from High for randomized trials and downgrading for each serious concern found.

## Why manual GRADE assessment is slow

Applying GRADE consistently across dozens of papers in a systematic review traditionally takes hours of careful reading per study. Tools like EvidoraX apply GRADE rules automatically during PDF extraction, flagging each domain with a cited reason pulled directly from the source text — reducing a multi-hour manual task to minutes, with every judgment traceable back to where it came from in the paper.
    `
  },
  {
    slug: 'pico-extraction-from-pdf',
    title: 'How to extract PICO elements from a research PDF (manually and with AI)',
    description: 'A practical guide to identifying Population, Intervention, Comparator, and Outcome elements in clinical trial papers.',
    date: '2026-08-03',
    content: `
PICO — Population, Intervention, Comparator, Outcome — is the standard framework for structuring a clinical research question, and it's the first thing most systematic reviewers extract from every paper.

## Where to find each PICO element in a typical RCT paper

**Population** — usually in the Methods section, under "Participants" or "Study Population." Look for inclusion/exclusion criteria and sample size.

**Intervention** — described in Methods, often with dose, route, and duration specified precisely.

**Comparator** — the control arm: placebo, standard of care, or an active comparator.

**Outcome** — typically split into primary and secondary outcomes, defined early in Methods and reported in Results.

## Manual extraction is slow and error-prone at scale

For a single paper, pulling PICO by hand takes 10-20 minutes. For a systematic review covering 40-50 papers, that's a full day or more of repetitive reading — and inconsistency creeps in when the same extractor is tired by paper 35.

## AI-assisted extraction

Tools like EvidoraX read the full PDF and extract PICO fields automatically, citing the exact source sentence for each field so it can be verified in seconds rather than re-read in full. This works for both modern text-based PDFs and is being extended to scanned/historical papers via OCR.
    `
  }
]
