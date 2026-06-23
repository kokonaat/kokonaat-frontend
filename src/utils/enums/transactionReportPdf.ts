import type { TFunction } from 'i18next'
import autoTable from 'jspdf-autotable'
import {
  drawPdfFooter,
  formatCurrencyTaka,
  formatGeneratedDate,
  formatReportPeriod,
  getAutoTableFont,
  type ExportTFunction,
} from '@/utils/exportPdfHelpers'
import { createPdfDocument, setPdfFont } from '@/utils/pdfFont'

interface TransactionReportItem {
  no: string
  createdAt: string
  transactionType: string
  vendor?: { name: string }
  customer?: { name: string }
  totalAmount: number
  paid: number
  pending: number
  paymentType: string
  details: Array<{
    inventory?: { name: string }
    quantity: string
    price: string
    total: string
    unitOfMeasurement?: { name: string }
  }>
}

interface TransactionSummary {
  totalTransactions: number
  totalBillAmount: number
  totalPaid: number
  totalDue: number
}

export const generateTransactionReportPDF = async (
  t: TFunction<'export'>,
  data: TransactionReportItem[],
  shopName: string,
  dateRange?: { from: string; to: string },
  transactionType?: string,
) => {
  const doc = await createPdfDocument()
  const pageWidth = doc.internal.pageSize.getWidth()
  const na = t('common.fallbacks.notAvailable')
  const tableFont = getAutoTableFont()
  const exportT = t as ExportTFunction

  const summary: TransactionSummary = {
    totalTransactions: data.length,
    totalBillAmount: data.reduce((acc, item) => acc + Number(item.totalAmount), 0),
    totalPaid: data.reduce((acc, item) => acc + Number(item.paid), 0),
    totalDue: data.reduce((acc, item) => acc + Number(item.pending), 0),
  }

  setPdfFont(doc, 'bold')
  doc.setFontSize(20)
  doc.text(shopName.toUpperCase(), pageWidth / 2, 15, { align: 'center' })

  doc.setFontSize(10)
  setPdfFont(doc, 'normal')
  doc.text(t('transactionReportPdf.title'), pageWidth / 2, 22, { align: 'center' })

  doc.setLineWidth(0.5)
  doc.line(14, 28, pageWidth - 14, 28)

  doc.setFontSize(11)
  setPdfFont(doc, 'bold')
  doc.text(t('transactionReportPdf.labels.transactionType'), 14, 38)
  setPdfFont(doc, 'normal')
  doc.text(transactionType || t('common.fallbacks.allTypes'), 55, 38)

  setPdfFont(doc, 'bold')
  doc.text(t('transactionReportPdf.labels.reportPeriod'), 14, 45)
  setPdfFont(doc, 'normal')
  doc.text(formatReportPeriod(exportT, dateRange), 55, 45)

  setPdfFont(doc, 'bold')
  doc.text(t('transactionReportPdf.labels.generatedOn'), pageWidth - 14, 38, {
    align: 'right',
  })
  setPdfFont(doc, 'normal')
  doc.text(formatGeneratedDate(), pageWidth - 14, 45, { align: 'right' })

  const tableRows = data.map((item) => {
    const partyName = item.vendor?.name || item.customer?.name || na
    const itemsSummary = item.details
      .map((d) => `${d.inventory?.name || na} (${d.quantity})`)
      .join(', ')

    return [
      new Date(item.createdAt).toLocaleDateString(),
      partyName,
      itemsSummary,
      item.paymentType,
      Number(item.totalAmount).toLocaleString(),
      Number(item.paid).toLocaleString(),
      Number(item.pending).toLocaleString(),
    ]
  })

  const subtotalAmount = data.reduce((acc, item) => acc + Number(item.totalAmount || 0), 0)
  const subtotalPaid = data.reduce((acc, item) => acc + Number(item.paid || 0), 0)
  const subtotalDue = data.reduce((acc, item) => acc + Number(item.pending || 0), 0)

  tableRows.push([
    '',
    '',
    '',
    t('transactionReportPdf.totals.totalRow'),
    subtotalAmount.toLocaleString(),
    subtotalPaid.toLocaleString(),
    subtotalDue.toLocaleString(),
  ])

  autoTable(doc, {
    startY: 55,
    head: [[
      t('transactionReportPdf.tableHeaders.date'),
      t('transactionReportPdf.tableHeaders.party'),
      t('transactionReportPdf.tableHeaders.items'),
      t('transactionReportPdf.tableHeaders.method'),
      t('transactionReportPdf.tableHeaders.amount'),
      t('transactionReportPdf.tableHeaders.paid'),
      t('transactionReportPdf.tableHeaders.due'),
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
      0: { cellWidth: 22 },
      1: { cellWidth: 30 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 22 },
      6: { cellWidth: 18, halign: 'right' },
    },
    styles: { fontSize: 8, font: tableFont },
    didParseCell: (dataCell) => {
      if (dataCell.row.index === tableRows.length - 1) {
        dataCell.cell.styles.fontStyle = 'bold'
        dataCell.cell.styles.fillColor = [240, 240, 240]
      }
    },
  })

  const finalY = (doc as any).lastAutoTable.finalY + 10
  const summaryX = pageWidth - 90

  doc.setFillColor(248, 250, 252)
  doc.rect(summaryX, finalY, 76, 35, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.rect(summaryX, finalY, 76, 35, 'S')

  const drawRow = (
    label: string,
    value: number,
    y: number,
    isBold = false,
    showCurrency = true,
  ) => {
    setPdfFont(doc, isBold ? 'bold' : 'normal')
    doc.text(label, summaryX + 2, y)
    const formattedValue = showCurrency
      ? formatCurrencyTaka(exportT, value)
      : value.toLocaleString()
    doc.text(formattedValue, pageWidth - 16, y, { align: 'right' })
    setPdfFont(doc, 'normal')
  }

  drawRow(t('transactionReportPdf.summary.totalTransactions'), summary.totalTransactions, finalY + 7, false, false)
  drawRow(t('transactionReportPdf.summary.totalBillAmount'), summary.totalBillAmount, finalY + 14)
  drawRow(t('transactionReportPdf.summary.totalPaid'), summary.totalPaid, finalY + 21)

  doc.setDrawColor(200)
  doc.line(summaryX + 2, finalY + 24, pageWidth - 16, finalY + 24)
  drawRow(t('transactionReportPdf.summary.totalDue'), summary.totalDue, finalY + 31, true)

  drawPdfFooter(doc, exportT, pageWidth)
  doc.save(`Transaction_Report_${transactionType || 'All'}_${Date.now()}.pdf`)
}
