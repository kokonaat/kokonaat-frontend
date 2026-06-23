import type { TFunction } from 'i18next'
import autoTable from 'jspdf-autotable'
import type { TransactionLedgerDetailItem } from '@/interface/reportInterface'
import {
  drawPdfFooter,
  formatCurrencyTaka,
  formatGeneratedDate,
  formatReportPeriod,
  getAutoTableFont,
  type ExportTFunction,
} from '@/utils/exportPdfHelpers'
import { createPdfDocument, setPdfFont } from '@/utils/pdfFont'

interface Summary {
  totalAmount: number
  totalPaid: number
}

export const generateLedgerPDF = async (
  t: TFunction<'export'>,
  entityName: string,
  shopName: string,
  data: TransactionLedgerDetailItem[],
  summary: Summary,
  dateRange?: { from: string; to: string },
  entityType?: 'customer' | 'vendor',
) => {
  const doc = await createPdfDocument()
  const pageWidth = doc.internal.pageSize.getWidth()
  const na = t('common.fallbacks.notAvailable')
  const tableFont = getAutoTableFont()

  setPdfFont(doc, 'bold')
  doc.setFontSize(20)
  doc.text(shopName.toUpperCase(), pageWidth / 2, 15, { align: 'center' })

  doc.setFontSize(10)
  setPdfFont(doc, 'normal')
  doc.text(t('customerOrVendorLedgerPdf.title'), pageWidth / 2, 22, { align: 'center' })

  doc.setLineWidth(0.5)
  doc.line(14, 28, pageWidth - 14, 28)

  const accountLabel =
    entityType === 'customer'
      ? t('customerOrVendorLedgerPdf.labels.customer')
      : t('customerOrVendorLedgerPdf.labels.vendor')
  const accountName =
    data.length > 0 && data[0].entityName ? data[0].entityName : entityName

  doc.setFontSize(11)
  setPdfFont(doc, 'bold')
  doc.text(accountLabel, 14, 38)
  setPdfFont(doc, 'normal')
  doc.text(accountName, 48, 38)

  setPdfFont(doc, 'bold')
  doc.text(t('customerOrVendorLedgerPdf.labels.reportPeriod'), 14, 45)
  setPdfFont(doc, 'normal')
  doc.text(formatReportPeriod(t as ExportTFunction, dateRange), 48, 45)

  setPdfFont(doc, 'bold')
  doc.text(t('customerOrVendorLedgerPdf.labels.generatedOn'), pageWidth - 14, 38, {
    align: 'right',
  })
  setPdfFont(doc, 'normal')
  doc.text(formatGeneratedDate(), pageWidth - 14, 45, { align: 'right' })

  const tableRows = data.map((item) => [
    new Date(item.createdAt).toLocaleDateString(),
    item.transactionNo,
    item.inventoryName,
    item.unitOfMeasurement?.name || na,
    item.transactionType,
    item.quantity,
    Number(item.price).toLocaleString(),
    Number(item.total).toLocaleString(),
  ])

  const subtotal = data.reduce((acc, item) => acc + Number(item.total), 0)
  tableRows.push([
    '',
    '',
    '',
    '',
    t('customerOrVendorLedgerPdf.totals.subtotalRow'),
    '',
    '',
    subtotal.toLocaleString(),
  ])

  autoTable(doc, {
    startY: 55,
    head: [[
      t('customerOrVendorLedgerPdf.tableHeaders.date'),
      t('customerOrVendorLedgerPdf.tableHeaders.trxNo'),
      t('customerOrVendorLedgerPdf.tableHeaders.item'),
      t('customerOrVendorLedgerPdf.tableHeaders.uom'),
      t('customerOrVendorLedgerPdf.tableHeaders.type'),
      t('customerOrVendorLedgerPdf.tableHeaders.qty'),
      t('customerOrVendorLedgerPdf.tableHeaders.price'),
      t('customerOrVendorLedgerPdf.tableHeaders.total'),
    ]],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: 255,
      halign: 'center',
      font: tableFont,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      6: { halign: 'right' },
      7: { halign: 'right' },
    },
    styles: { fontSize: 9, font: tableFont },
    didParseCell: (dataCell) => {
      if (dataCell.row.index === tableRows.length - 1) {
        dataCell.cell.styles.fontStyle = 'bold'
      }
    },
  })

  const finalY = (doc as any).lastAutoTable.finalY + 10
  const summaryX = pageWidth - 90

  doc.setFillColor(248, 250, 252)
  doc.rect(summaryX, finalY, 76, 28, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.rect(summaryX, finalY, 76, 28, 'S')

  const drawRow = (label: string, value: number, y: number, isBold = false) => {
    setPdfFont(doc, isBold ? 'bold' : 'normal')
    doc.text(label, summaryX + 2, y)
    doc.text(
      formatCurrencyTaka(t as ExportTFunction, value || 0),
      pageWidth - 16,
      y,
      { align: 'right' },
    )
    setPdfFont(doc, 'normal')
  }

  drawRow(t('customerOrVendorLedgerPdf.summary.totalAmount'), summary.totalAmount, finalY + 7)
  drawRow(t('customerOrVendorLedgerPdf.summary.totalPaid'), summary.totalPaid, finalY + 14)

  doc.setDrawColor(200)
  doc.line(summaryX + 2, finalY + 17, pageWidth - 16, finalY + 17)
  drawRow(
    t('customerOrVendorLedgerPdf.summary.balanceDue'),
    summary.totalAmount - summary.totalPaid,
    finalY + 24,
    true,
  )

  drawPdfFooter(doc, t as ExportTFunction, pageWidth)
  doc.save(`Ledger_${accountName.replace(/\s+/g, '_')}_${Date.now()}.pdf`)
}
