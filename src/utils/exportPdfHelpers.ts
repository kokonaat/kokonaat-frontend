import type jsPDF from 'jspdf'
import type { TFunction } from 'i18next'
import i18n from '@/i18n'
import { getPdfFontFamily, setPdfFont } from '@/utils/pdfFont'

export type ExportTFunction = TFunction<'export'>

export function getCompanyName(t: ExportTFunction): string {
  return import.meta.env.VITE_COMPANY_NAME || t('common.fallbacks.companyName')
}

export function getDateLocale(): string {
  return i18n.language?.startsWith('bn') ? 'bn-BD' : 'en-GB'
}

export function formatReportPeriod(
  t: ExportTFunction,
  dateRange?: { from: string; to: string },
): string {
  if (!dateRange) return t('common.fallbacks.allTime')
  const locale = getDateLocale()
  const opts: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }
  const from = new Date(dateRange.from).toLocaleDateString(locale, opts)
  const to = new Date(dateRange.to).toLocaleDateString(locale, opts)
  return `${from} ${t('common.dateRange.to')} ${to}`
}

export function formatGeneratedDate(): string {
  return new Date().toLocaleDateString(getDateLocale())
}

export function drawPdfFooter(
  doc: jsPDF,
  t: ExportTFunction,
  pageWidth: number,
): void {
  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } })
    .internal.getNumberOfPages()
  const companyName = getCompanyName(t)

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    setPdfFont(doc, 'italic')
    doc.text(
      t('common.footer.poweredBy', { companyName }),
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' },
    )
    doc.text(
      t('common.footer.pageOf', { current: i, total: pageCount }),
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' },
    )
  }
}

export function getAutoTableFont(): string {
  return getPdfFontFamily()
}

export function formatCurrencyTaka(
  t: ExportTFunction,
  amount: number,
): string {
  return t('common.financial.currencyTakaFormatted', {
    amount: amount.toLocaleString(),
  })
}

export function drawRightAlignedMetaLine(
  doc: jsPDF,
  label: string,
  value: string,
  rightX: number,
  y: number,
): void {
  setPdfFont(doc, 'normal')
  doc.setFontSize(10)
  doc.text(`${label} ${value}`, rightX, y, { align: 'right' })
}

export function drawLeftLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
): void {
  setPdfFont(doc, 'bold')
  doc.setFontSize(10)
  doc.text(label, x, y)
  setPdfFont(doc, 'normal')
  doc.text(value, x + doc.getTextWidth(label) + 2, y)
}
