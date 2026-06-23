import type { TFunction } from 'i18next'
import autoTable from 'jspdf-autotable'
import type { StockReportItem } from '@/interface/reportInterface'
import {
  drawPdfFooter,
  formatCurrencyTaka,
  formatGeneratedDate,
  formatReportPeriod,
  getAutoTableFont,
  type ExportTFunction,
} from '@/utils/exportPdfHelpers'
import { createPdfDocument, setPdfFont } from '@/utils/pdfFont'

export const generateStockReportPDF = async (
  t: TFunction<'export'>,
  data: StockReportItem[],
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
  doc.text(t('stockReportPdf.title'), pageWidth / 2, 22, { align: 'center' })

  doc.setLineWidth(0.5)
  doc.line(14, 28, pageWidth - 14, 28)

  doc.setFontSize(11)
  setPdfFont(doc, 'bold')
  doc.text(t('stockReportPdf.labels.reportPeriod'), 14, 38)
  setPdfFont(doc, 'normal')
  doc.text(formatReportPeriod(exportT, dateRange), 48, 38)

  setPdfFont(doc, 'bold')
  doc.text(t('stockReportPdf.labels.generatedOn'), pageWidth - 14, 38, { align: 'right' })
  setPdfFont(doc, 'normal')
  doc.text(formatGeneratedDate(), pageWidth - 14, 45, { align: 'right' })

  const tableRows = data.map((item) => [
    item.no,
    item.name,
    item.description || na,
    Number(item.quantity).toLocaleString(),
    item.unitOfMeasurement?.name || na,
    Number(item.lastPrice).toLocaleString(),
  ])

  const totalQuantity = data.reduce((acc, item) => acc + Number(item.quantity), 0)
  const totalValue = data.reduce(
    (acc, item) => acc + Number(item.quantity) * Number(item.lastPrice),
    0,
  )

  tableRows.push([
    '',
    '',
    t('stockReportPdf.totals.totalRow'),
    totalQuantity.toLocaleString(),
    '',
    totalValue.toLocaleString(),
  ])

  autoTable(doc, {
    startY: 50,
    head: [[
      t('stockReportPdf.tableHeaders.refNo'),
      t('stockReportPdf.tableHeaders.name'),
      t('stockReportPdf.tableHeaders.description'),
      t('stockReportPdf.tableHeaders.quantity'),
      t('stockReportPdf.tableHeaders.uom'),
      t('stockReportPdf.tableHeaders.lastPrice'),
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
      1: { cellWidth: 35 },
      2: { cellWidth: 45 },
      3: { halign: 'right', cellWidth: 25 },
      4: { halign: 'center', cellWidth: 20 },
      5: { halign: 'right', cellWidth: 30 },
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
  doc.rect(summaryX, finalY, 76, 25, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.rect(summaryX, finalY, 76, 25, 'S')

  setPdfFont(doc, 'bold')
  doc.text(t('stockReportPdf.summary.totalItems'), summaryX + 2, finalY + 8)
  doc.text(`${data.length}`, pageWidth - 16, finalY + 8, { align: 'right' })

  doc.text(t('stockReportPdf.summary.totalQuantity'), summaryX + 2, finalY + 15)
  doc.text(`${totalQuantity.toLocaleString()}`, pageWidth - 16, finalY + 15, {
    align: 'right',
  })

  doc.text(t('stockReportPdf.summary.totalValue'), summaryX + 2, finalY + 22)
  doc.text(formatCurrencyTaka(exportT, totalValue), pageWidth - 16, finalY + 22, {
    align: 'right',
  })

  drawPdfFooter(doc, exportT, pageWidth)
  doc.save(`Stock_Report_${Date.now()}.pdf`)
}
