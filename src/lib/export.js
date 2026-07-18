import * as XLSX from 'xlsx'

// ─────────────────────────────────────────────
// Flatten structured extraction to table row
// ─────────────────────────────────────────────
function flattenExtraction(extraction) {
  return {
    // Study Info
    'Title':                    extraction.title || '',
    'Authors':                  extraction.authors || '',
    'Year':                     extraction.year || '',
    'Journal':                  extraction.journal || '',
    'Study Design':             extraction.study_design || '',
    'Country':                  extraction.country || '',
    'Funding Source':           extraction.funding_source || '',

    // PICO - Population
    'Population Description':   extraction.population_description || '',
    'Age Range':                extraction.population_age_range || '',
    'Sample Size Total':        extraction.population_sample_size || '',
    'Inclusion Criteria':       extraction.population_inclusion || '',
    'Exclusion Criteria':       extraction.population_exclusion || '',

    // PICO - Intervention
    'Intervention Name':        extraction.intervention_name || '',
    'Intervention Dose':        extraction.intervention_dose || '',
    'Intervention Route':       extraction.intervention_route || '',
    'Intervention Duration':    extraction.intervention_duration || '',
    'Intervention Frequency':   extraction.intervention_frequency || '',

    // PICO - Comparator
    'Comparator Type':          extraction.comparator_type || '',
    'Comparator Description':   extraction.comparator_description || '',

    // PICO - Outcome
    'Primary Outcome':          extraction.outcome_primary || '',
    'Secondary Outcomes':       extraction.outcome_secondary || '',
    'Follow-up Duration':       extraction.outcome_followup || '',
    'Outcome Measurement Tool': extraction.outcome_tool || '',

    // Raw Data
    'N Treatment':              extraction.n_treatment || '',
    'N Control':                extraction.n_control || '',
    'Events Treatment':         extraction.events_treatment || '',
    'Events Control':           extraction.events_control || '',
    'Effect Measure Type':      extraction.effect_measure_type || '',
    'Effect Size':              extraction.effect_size || '',
    'CI Lower':                 extraction.ci_lower || '',
    'CI Upper':                 extraction.ci_upper || '',
    'P Value':                  extraction.p_value || '',
    'Subgroup':                 extraction.subgroup || '',

    // GRADE
    'Risk of Bias Score':       extraction.grade_risk_of_bias_score || '',
    'Risk of Bias Reason':      extraction.grade_risk_of_bias_reason || '',
    'Inconsistency Score':      extraction.grade_inconsistency_score || '',
    'Inconsistency Reason':     extraction.grade_inconsistency_reason || '',
    'Indirectness Score':       extraction.grade_indirectness_score || '',
    'Indirectness Reason':      extraction.grade_indirectness_reason || '',
    'Imprecision Score':        extraction.grade_imprecision_score || '',
    'Imprecision Reason':       extraction.grade_imprecision_reason || '',
    'Publication Bias Score':   extraction.grade_publication_bias_score || '',
    'Publication Bias Reason':  extraction.grade_publication_bias_reason || '',
    'Overall Evidence Quality': extraction.grade_overall || '',

    // Meta
    'Extractor Confidence':     extraction.extractor_confidence || '',
    'Fields Not Found':         (extraction.fields_not_found || []).join('; '),
    'Fields Needing Review':    (extraction.fields_needing_review || []).join('; ')
  }
}

// ─────────────────────────────────────────────
// Export multiple extractions to Excel
// ─────────────────────────────────────────────
export function exportToExcel(extractions, filename = 'evidorax_extraction.xlsx') {
  const rows = extractions.map(flattenExtraction)

  const workbook = XLSX.utils.book_new()

  // Main extraction sheet
  const worksheet = XLSX.utils.json_to_sheet(rows)

  // Column widths for readability
  worksheet['!cols'] = Object.keys(rows[0] || {}).map(key => ({
    wch: Math.min(Math.max(key.length, 15), 50)
  }))

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Extractions')

  // GRADE summary sheet
  const gradeRows = extractions.map(e => ({
    'Title': e.title || '',
    'Risk of Bias': e.grade_risk_of_bias_score || '',
    'Inconsistency': e.grade_inconsistency_score || '',
    'Indirectness': e.grade_indirectness_score || '',
    'Imprecision': e.grade_imprecision_score || '',
    'Publication Bias': e.grade_publication_bias_score || '',
    'Overall Quality': e.grade_overall || ''
  }))

  const gradeSheet = XLSX.utils.json_to_sheet(gradeRows)
  XLSX.utils.book_append_sheet(workbook, gradeSheet, 'GRADE Summary')

  // Raw data sheet
  const rawRows = extractions.map(e => ({
    'Title': e.title || '',
    'N Treatment': e.n_treatment || '',
    'N Control': e.n_control || '',
    'Events Treatment': e.events_treatment || '',
    'Events Control': e.events_control || '',
    'Effect Measure': e.effect_measure_type || '',
    'Effect Size': e.effect_size || '',
    'CI Lower': e.ci_lower || '',
    'CI Upper': e.ci_upper || '',
    'P Value': e.p_value || ''
  }))

  const rawSheet = XLSX.utils.json_to_sheet(rawRows)
  XLSX.utils.book_append_sheet(workbook, rawSheet, 'Raw Data')

  // Download
  XLSX.writeFile(workbook, filename)
}

// ─────────────────────────────────────────────
// Export to CSV (simple, single sheet)
// ─────────────────────────────────────────────
export function exportToCSV(extractions, filename = 'evidorax_extraction.csv') {
  const rows = extractions.map(flattenExtraction)
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Extractions')
  XLSX.writeFile(workbook, filename, { bookType: 'csv' })
}
