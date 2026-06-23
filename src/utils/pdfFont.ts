import jsPDF from 'jspdf'
import i18n from '@/i18n'

const BENGALI_FONT_FILE = 'NotoSansBengali-Regular.ttf'
export const BENGALI_FONT_NAME = 'NotoSansBengali'

let cachedFontBase64: string | null = null
let fontLoadPromise: Promise<string> | null = null

export function isBengaliPdfLocale(): boolean {
  return i18n.language?.startsWith('bn') ?? false
}

async function fetchBengaliFontBase64(): Promise<string> {
  if (cachedFontBase64) return cachedFontBase64
  if (!fontLoadPromise) {
    fontLoadPromise = (async () => {
      const response = await fetch(`/fonts/${BENGALI_FONT_FILE}`)
      if (!response.ok) {
        throw new Error(`Failed to load Bengali font: ${response.statusText}`)
      }
      const buffer = await response.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      cachedFontBase64 = btoa(binary)
      return cachedFontBase64
    })()
  }
  return fontLoadPromise
}

function registerBengaliFont(doc: jsPDF, base64: string): void {
  doc.addFileToVFS(BENGALI_FONT_FILE, base64)
  doc.addFont(BENGALI_FONT_FILE, BENGALI_FONT_NAME, 'normal')
}

export async function createPdfDocument(): Promise<jsPDF> {
  const doc = new jsPDF()
  if (isBengaliPdfLocale()) {
    const base64 = await fetchBengaliFontBase64()
    registerBengaliFont(doc, base64)
  }
  return doc
}

export function getPdfFontFamily(): string {
  return isBengaliPdfLocale() ? BENGALI_FONT_NAME : 'helvetica'
}

export function setPdfFont(
  doc: jsPDF,
  style: 'normal' | 'bold' | 'italic' = 'normal',
): void {
  if (isBengaliPdfLocale()) {
    doc.setFont(BENGALI_FONT_NAME, 'normal')
  } else {
    doc.setFont('helvetica', style)
  }
}
