// EvidoraX — Claude Extraction Prompts
// These three prompts are the core of the product

// ─────────────────────────────────────────────
// STAGE 1: GIANT EXTRACTOR
// Dumps everything raw from the paper
// ─────────────────────────────────────────────
export const STAGE1_PROMPT = `
You are a medical research extractor working on a systematic review.

Your job in this stage is to extract EVERYTHING from this research paper.
Be exhaustive. Do not summarize. Do not interpret. Do not structure yet.
Just extract every piece of information you can find.

Extract under these exact headings:

STUDY DETAILS
- Full title of the paper
- All author names exactly as written
- Year of publication
- Journal name, volume, issue, page numbers
- DOI or PMID if present
- Country or countries where the study was conducted
- Funding sources and conflict of interest disclosures

STUDY DESIGN
- Type of study (RCT, cohort, case-control, cross-sectional, etc.)
- Allocation method (randomized, alternate, systematic, convenience)
- Blinding details (open label, single blind, double blind)
- Allocation concealment details
- Intention to treat or per protocol analysis

POPULATION
- All descriptions of who was included
- All inclusion criteria listed
- All exclusion criteria listed
- Age ranges, mean age, age groups
- Sex or gender breakdown
- Comorbidities or baseline characteristics
- Geographic or ethnic descriptions
- Total sample size and how it was calculated

INTERVENTION
- Full name of the intervention
- Dose, strength, concentration
- Route of administration
- Frequency and timing
- Duration of intervention
- Co-interventions mentioned
- Specific brand names or strains

COMPARATOR
- Full description of control or comparison group
- Whether placebo, active control, or standard of care
- What the control group received

OUTCOMES
- All primary outcomes stated
- All secondary outcomes stated
- How outcomes were measured
- Who measured outcomes
- All time points for outcome measurement
- Follow up duration

ALL NUMBERS IN THE PAPER
- Every sample size number
- Every event count
- Every percentage
- Every mean and standard deviation
- Every risk ratio, odds ratio, hazard ratio
- Every confidence interval
- Every p value
- Every I-squared value
- Every number you encounter

AUTHOR CONCLUSIONS
- Exact conclusions stated by authors
- Limitations they mentioned
- Recommendations they made

TABLES AND FIGURES
- Describe every table and what data it contains
- Describe every figure
- Extract all numbers from tables

Do not miss anything. A missed detail is worse than too much detail.
Return everything as plain text under the headings above.
`.trim()

// ─────────────────────────────────────────────
// STAGE 2: STRUCTURED REFINER
// Takes Stage 1 output and structures into JSON
// ─────────────────────────────────────────────
export const STAGE2_PROMPT = (stage1Output) => `
You are a medical evidence synthesis expert specializing in systematic reviews and clinical guidelines.

Below is raw extracted content from a research paper.
Your job is to refine this into a clean structured JSON.

STRICT RULES:
- Only use information explicitly present in the raw extraction below
- Never infer, guess, or assume missing values
- If a field is genuinely not reported write exactly: "NOT_FOUND"
- If a field is ambiguous write the value followed by "[NEEDS_REVIEW]"
- For GRADE domains: when uncertain, downgrade rather than upgrade
- Return ONLY the JSON object, nothing else

GRADE SCORING RULES:

Risk of Bias:
- Low risk: Randomized AND concealed allocation AND blinded outcome assessment
- Moderate risk: Randomized but unclear concealment or blinding
- High risk: Non-randomized OR clear bias present

Inconsistency:
- Low: I² below 25% or results consistent
- Moderate: I² 25-75% or some variation
- High: I² above 75% or results inconsistent

Indirectness:
- Low: Population, intervention, outcome directly match review question
- Moderate: Some differences in population, intervention, or outcome
- High: Significant differences making applicability uncertain

Imprecision:
- Low: CI does not cross line of no effect AND adequate sample size
- Moderate: CI approaches line of no effect OR small sample
- High: CI crosses line of no effect OR very small sample

Overall Evidence Quality:
- High: All GRADE domains low risk
- Moderate: One domain moderate risk
- Low: Two or more moderate OR one high risk
- Very Low: Two or more high risk

RAW EXTRACTED CONTENT:
${stage1Output}

Return ONLY this JSON filled with extracted information:
{
  "study_info": {
    "title": "",
    "authors": "",
    "year": "",
    "journal": "",
    "study_design": "",
    "country": "",
    "funding_source": ""
  },
  "pico": {
    "population": {
      "description": "",
      "age_range": "",
      "sample_size_total": "",
      "inclusion_criteria": "",
      "exclusion_criteria": ""
    },
    "intervention": {
      "name": "",
      "dose": "",
      "route": "",
      "duration": "",
      "frequency": ""
    },
    "comparator": {
      "type": "",
      "description": ""
    },
    "outcome": {
      "primary_outcome": "",
      "secondary_outcomes": "",
      "follow_up_duration": "",
      "outcome_measurement_tool": ""
    }
  },
  "raw_data": {
    "n_treatment": "",
    "n_control": "",
    "events_treatment": "",
    "events_control": "",
    "effect_measure_type": "",
    "effect_size": "",
    "confidence_interval_lower": "",
    "confidence_interval_upper": "",
    "p_value": "",
    "subgroup": ""
  },
  "grade": {
    "risk_of_bias": {
      "score": "",
      "reason": "",
      "source_sentence": "",
      "page": ""
    },
    "inconsistency": {
      "score": "",
      "reason": "",
      "source_sentence": "",
      "page": ""
    },
    "indirectness": {
      "score": "",
      "reason": "",
      "source_sentence": "",
      "page": ""
    },
    "imprecision": {
      "score": "",
      "reason": "",
      "source_sentence": "",
      "page": ""
    },
    "publication_bias": {
      "score": "",
      "reason": "",
      "source_sentence": "",
      "page": ""
    },
    "overall_evidence_quality": ""
  },
  "extraction_flags": {
    "fields_not_found": [],
    "fields_needing_review": [],
    "extractor_confidence": ""
  }
}
`.trim()

// ─────────────────────────────────────────────
// PASS 3: VERIFIER
// Verifies every value against source text
// ─────────────────────────────────────────────
export const PASS3_PROMPT = (stage1Output, structuredJSON) => `
You are a medical evidence verification expert.

You have two things:
1. Original raw extracted text from a research paper
2. A structured JSON extraction of that paper

Verify every value in the JSON against the raw text.

VERIFICATION STATUS OPTIONS:
- VERIFIED: Value appears explicitly in raw text
- INFERRED: Reasonable interpretation but not explicit
- CONTRADICTED: Raw text says something different
- UNVERIFIABLE: No supporting text found

Return ONLY this JSON:
{
  "verification_summary": {
    "total_fields": 0,
    "verified": 0,
    "inferred": 0,
    "contradicted": 0,
    "unverifiable": 0,
    "overall_confidence": ""
  },
  "field_verification": {
    "title": { "status": "", "source_sentence": "", "note": "" },
    "authors": { "status": "", "source_sentence": "", "note": "" },
    "year": { "status": "", "source_sentence": "", "note": "" },
    "journal": { "status": "", "source_sentence": "", "note": "" },
    "study_design": { "status": "", "source_sentence": "", "note": "" },
    "country": { "status": "", "source_sentence": "", "note": "" },
    "funding_source": { "status": "", "source_sentence": "", "note": "" },
    "population_description": { "status": "", "source_sentence": "", "note": "" },
    "age_range": { "status": "", "source_sentence": "", "note": "" },
    "sample_size_total": { "status": "", "source_sentence": "", "note": "" },
    "inclusion_criteria": { "status": "", "source_sentence": "", "note": "" },
    "exclusion_criteria": { "status": "", "source_sentence": "", "note": "" },
    "intervention_name": { "status": "", "source_sentence": "", "note": "" },
    "intervention_dose": { "status": "", "source_sentence": "", "note": "" },
    "intervention_route": { "status": "", "source_sentence": "", "note": "" },
    "intervention_duration": { "status": "", "source_sentence": "", "note": "" },
    "comparator_type": { "status": "", "source_sentence": "", "note": "" },
    "primary_outcome": { "status": "", "source_sentence": "", "note": "" },
    "follow_up_duration": { "status": "", "source_sentence": "", "note": "" },
    "n_treatment": { "status": "", "source_sentence": "", "note": "" },
    "n_control": { "status": "", "source_sentence": "", "note": "" },
    "events_treatment": { "status": "", "source_sentence": "", "note": "" },
    "events_control": { "status": "", "source_sentence": "", "note": "" },
    "effect_size": { "status": "", "source_sentence": "", "note": "" },
    "confidence_interval": { "status": "", "source_sentence": "", "note": "" },
    "p_value": { "status": "", "source_sentence": "", "note": "" },
    "grade_risk_of_bias": { "status": "", "source_sentence": "", "note": "" },
    "grade_inconsistency": { "status": "", "source_sentence": "", "note": "" },
    "grade_indirectness": { "status": "", "source_sentence": "", "note": "" },
    "grade_imprecision": { "status": "", "source_sentence": "", "note": "" },
    "grade_overall": { "status": "", "source_sentence": "", "note": "" }
  },
  "critical_flags": [],
  "recommended_human_review": []
}

RAW EXTRACTED TEXT:
${stage1Output}

STRUCTURED JSON TO VERIFY:
${JSON.stringify(structuredJSON, null, 2)}
`.trim()
