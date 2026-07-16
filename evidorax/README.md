# EvidoraX

Upload research papers. Get a verified PICO + GRADE + raw-data extraction table in minutes, with every value traceable to its source sentence.

---

## What's in this build

```
src/
  app/
    page.jsx                  Main dashboard (sidebar, upload, dossier)
    layout.jsx                Root layout
    globals.css                Design tokens — clinical dossier aesthetic
    api/extract/route.js       Server route running the 3-stage pipeline
  components/
    Sidebar.jsx                Project navigator
    Topbar.jsx                 Project header + export
    UploadZone.jsx              Drag/drop PDF intake
    ExtractionDossier.jsx       Main evidence cards, expandable
    FieldRow.jsx                One extracted field + citation tag
    CitationTag.jsx             Click-to-reveal source sentence (signature element)
    VerificationLedger.jsx      QC strip — verified/inferred/review/not-found
    StatusPill.jsx               Pipeline stage indicator
  lib/
    prompts.js                  The three Claude prompts (Stage 1, Stage 2, Pass 3)
    claude.js                   Anthropic API calls, runs the full pipeline
    parser.js                    Client-side PDF.js text extraction
    supabase.js                  All database + storage functions
    export.js                    Excel/CSV export (3 sheets: full, GRADE, raw)
supabase/
  schema.sql                   Full database schema + RLS policies
  functions.sql                 Usage tracking functions
python/
  ocr_fallback.py               OCR for scanned/pre-2000 papers
  requirements.txt
```

---

## How the pipeline works

```
PDF upload
    ↓
Parse — pdf-parse (text PDFs) or python/ocr_fallback.py (scanned)
    ↓
Stage 1 — Claude extracts everything, unstructured, maximum recall
    ↓
Stage 2 — Claude structures into PICO + Raw Data + GRADE JSON
    ↓
Pass 3 — Claude verifies every field against the source text,
         tags each as verified / inferred / contradicted / unverifiable
    ↓
Stored in Supabase, shown in the dossier UI
    ↓
Human reviews only the flagged fields
    ↓
Export to Excel (3 sheets) or CSV
```

Three Claude API calls per paper. Roughly $0.15–$0.35 in API cost per paper at current pricing.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create your Supabase project

1. Go to supabase.com, create a new project
2. In the SQL editor, run `supabase/schema.sql` then `supabase/functions.sql`
3. Copy your project URL and keys into `.env.local` (copy from `.env.example`)

### 3. Get your Anthropic API key

Add it to `.env.local` as `ANTHROPIC_API_KEY`.

### 4. (Optional) Set up OCR fallback for old/scanned papers

Your BCG dataset goes back to 1948 — those PDFs will very likely be scanned photocopies with no text layer. `pdf-parse` alone will return near-empty text for those.

```bash
cd python
pip install -r requirements.txt --break-system-packages
```

Install the tesseract binary on your host (`apt install tesseract-ocr` on Linux, `brew install tesseract` on Mac). Wire `ocr_fallback.py` into the `/api/extract` route as a subprocess call when `pdf-parse` returns under ~100 characters per page — the same threshold logic already used in `parser.js`.

### 5. Run locally

```bash
npm run dev
```

Visit `localhost:3000`.

---

## What's stubbed vs complete

**Complete and working:**
- Full three-stage Claude pipeline with prompts tuned for PICO + GRADE
- Database schema with row-level security
- Excel export with 3 sheets (full table, GRADE summary, raw data)
- The dossier UI — sidebar, upload, expandable evidence cards, citation tags

**You still need to wire up:**
- Auth (Supabase Auth UI or your own login flow — `userId` is a placeholder in `page.jsx`)
- The "New project" modal (button exists, handler is empty)
- OCR fallback trigger inside `route.js` (currently only `pdf-parse`; add the Python call when char count is low)
- Dodo Payments integration for the Starter/Researcher/Institution tiers
- The human-review flow for correcting flagged fields (schema and `saveCorrection()` function exist in `supabase.js`, no UI yet)

---

## Testing before you build further

Before wiring auth and payments, validate the extraction quality manually:

1. Take one BCG paper PDF
2. Paste `STAGE1_PROMPT` from `src/lib/prompts.js` into Claude.ai along with the paper
3. Feed that output into `STAGE2_PROMPT`
4. Feed both into `PASS3_PROMPT`
5. Compare against your reference dataset

Target 85% verified fields before charging anyone. Below that, refine the prompts, not the code.
