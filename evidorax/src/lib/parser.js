// PDF Parser
// Uses PDF.js for text-based PDFs
// Falls back to Claude Vision for scanned/old PDFs

// ─────────────────────────────────────────────
// Parse PDF file to text
// Returns { text, isScanned, pageCount }
// ─────────────────────────────────────────────
export async function parsePDF(fileBuffer) {
  // Dynamic import for PDF.js (client-side only)
  const pdfjsLib = await import('pdfjs-dist')

  // Set worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

  const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise
  const pageCount = pdf.numPages

  let fullText = ''
  let extractedChars = 0

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map(item => item.str).join(' ')
    fullText += `\n--- PAGE ${pageNum} ---\n${pageText}`
    extractedChars += pageText.length
  }

  // Detect if PDF is scanned (very low text extraction)
  // Scanned PDFs typically yield less than 100 chars per page
  const avgCharsPerPage = extractedChars / pageCount
  const isScanned = avgCharsPerPage < 100

  return {
    text: fullText.trim(),
    isScanned,
    pageCount,
    avgCharsPerPage
  }
}

// ─────────────────────────────────────────────
// Convert file to base64
// Used for sending to Claude Vision
// ─────────────────────────────────────────────
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─────────────────────────────────────────────
// Convert ArrayBuffer to base64
// ─────────────────────────────────────────────
export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
