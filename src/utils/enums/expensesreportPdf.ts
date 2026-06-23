import type { TFunction } from 'i18next'
import autoTable from 'jspdf-autotable'
import type { ExpenseReportItem } from '@/interface/reportInterface'
import {
  drawPdfFooter,
  formatCurrencyTaka,
  formatGeneratedDate,
  formatReportPeriod,
  getAutoTableFont,
  type ExportTFunction,
} from '@/utils/exportPdfHelpers'
import { createPdfDocument, setPdfFont } from '@/utils/pdfFont'

export const generateExpenseReportPDF = async (
  t: TFunction<'export'>,
  data: ExpenseReportItem[],
  shopName: string,
  dateRange?: { from: string; to: string },
) => {
  const doc = await createPdfDocument()
  const pageWidth = doc.internal.pageSize.getWidth()
  const na = t('common.fallbacks.notAvailable')
  const tableFont = getAutoTableFont()
  const exportT = t as ExportTFunction

  setPdfFont(doc, 'bold')
  doc.setFontSize(20)
  doc.text(shopName.toUpperCase(), pageWidth / 2, 15, { align: 'center' })

  doc.setFontSize(10)
  setPdfFont(doc, 'normal')
  doc.text(t('expenseReportPdf.title'), pageWidth / 2, 22, { align: 'center' })

  doc.setLineWidth(0.5)
  doc.line(14, 28, pageWidth - 14, 28)

  doc.setFontSize(11)
  setPdfFont(doc, 'bold')
  doc.text(t('expenseReportPdf.labels.reportPeriod'), 14, 38)
  setPdfFont(doc, 'normal')
  doc.text(formatReportPeriod(exportT, dateRange), 48, 38)

  setPdfFont(doc, 'bold')
  doc.text(t('expenseReportPdf.labels.generatedOn'), pageWidth - 14, 38, { align: 'right' })
  setPdfFont(doc, 'normal')
  doc.text(formatGeneratedDate(), pageWidth - 14, 45, { align: 'right' })

  const tableRows = data.map((item) => [
    new Date(item.createdAt).toLocaleDateString(),
    item.title,
    item.remarks || na,
    item.type,
    Number(item.amount).toLocaleString(),
  ])

  const totalExpenses = data.reduce((acc, item) => acc + Number(item.amount), 0)
  tableRows.push([
    '',
    '',
    '',
    t('expenseReportPdf.totals.totalExpensesRow'),
    totalExpenses.toLocaleString(),
  ])

  autoTable(doc, {
    startY: 50,
    head: [[
      t('expenseReportPdf.tableHeaders.date'),
      t('expenseReportPdf.tableHeaders.title'),
      t('expenseReportPdf.tableHeaders.remarks'),
      t('expenseReportPdf.tableHeaders.type'),
      t('expenseReportPdf.tableHeaders.amount'),
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
      1: { cellWidth: 40 },
      2: { cellWidth: 45 },
      3: { cellWidth: 40 },
      4: { halign: 'right', cellWidth: 40 },
    },
    styles: { fontSize: 9, font: tableFont },
    didParseCell: (dataCell) => {
      if (dataCell.row.index === tableRows.length - 1) {
        dataCell.cell.styles.fontStyle = 'bold'
        dataCell.cell.styles.fillColor = [248, 250, 252]
      }
    },
  })

  const finalY = (doc as any).lastAutoTable.finalY + 10
  const summaryX = pageWidth - 90

  doc.setFillColor(248, 250, 252)
  doc.rect(summaryX, finalY, 76, 15, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.rect(summaryX, finalY, 76, 15, 'S')

  setPdfFont(doc, 'bold')
  doc.text(t('expenseReportPdf.summary.totalExpenses'), summaryX + 2, finalY + 10)
  doc.text(formatCurrencyTaka(exportT, totalExpenses), pageWidth - 16, finalY + 10, {
    align: 'right',
  })

  drawPdfFooter(doc, exportT, pageWidth)
  doc.save(`Expense_Report_${Date.now()}.pdf`)
}
