import type { TFunction } from 'i18next'
import autoTable from 'jspdf-autotable'
import type { StockTrackReportItem } from '@/interface/reportInterface'
import {
  drawPdfFooter,
  formatCurrencyTaka,
  formatGeneratedDate,
  formatReportPeriod,
  getAutoTableFont,
  type ExportTFunction,
} from '@/utils/exportPdfHelpers'
import { createPdfDocument, setPdfFont } from '@/utils/pdfFont'

export const generateStockTrackReportPDF = async (
  t: TFunction<'export'>,
  data: StockTrackReportItem[],
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
  doc.text(t('stockTrackReportPdf.title'), pageWidth / 2, 22, { align: 'center' })

  doc.setLineWidth(0.5)
  doc.line(14, 28, pageWidth - 14, 28)

  doc.setFontSize(11)
  setPdfFont(doc, 'bold')
  doc.text(t('stockTrackReportPdf.labels.reportPeriod'), 14, 38)
  setPdfFont(doc, 'normal')
  doc.text(formatReportPeriod(exportT, dateRange), 48, 38)

  setPdfFont(doc, 'bold')
  doc.text(t('stockTrackReportPdf.labels.generatedOn'), pageWidth - 14, 38, {
    align: 'right',
  })
  setPdfFont(doc, 'normal')
  doc.text(formatGeneratedDate(), pageWidth - 14, 45, { align: 'right' })

  const groupedData = data.reduce(
    (acc, item) => {
      const key = item.inventory.name || na
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    },
    {} as Record<string, StockTrackReportItem[]>,
  )

  let startY = 45

  Object.entries(groupedData).forEach(([, items], index) => {
    if (index > 0) startY += 10

    setPdfFont(doc, 'bold')
    doc.setFontSize(12)
    const currentName = items[0]?.inventory.name || na
    doc.text(t('stockTrackReportPdf.labels.inventory', { name: currentName }), 14, startY)
    startY += 7

    const tableRows = items.map((item) => [
      new Date(item.createdAt).toLocaleDateString(),
      item.isPurchased === true
        ? t('common.transactionTypes.purchaseTitleCase')
        : t('common.transactionTypes.saleTitleCase'),
      item.inventory.name || na,
      item.stock,
      Number(item.price).toLocaleString(),
    ])

    const subtotalPrice = items.reduce((acc, item) => acc + Number(item.price || 0), 0)
    const totalStock = items.reduce((acc, item) => acc + Number(item.stock || 0), 0)

    tableRows.push([
      '',
      '',
      t('common.labels.subtotalUppercase'),
      totalStock.toString(),
      subtotalPrice.toLocaleString(),
    ])

    autoTable(doc, {
      startY,
      head: [[
        t('stockTrackReportPdf.tableHeaders.date'),
        t('stockTrackReportPdf.tableHeaders.type'),
        t('stockTrackReportPdf.tableHeaders.name'),
        t('stockTrackReportPdf.tableHeaders.stock'),
        t('stockTrackReportPdf.tableHeaders.price'),
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
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 70 },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 25, halign: 'right' },
      },
      styles: { fontSize: 9, font: tableFont },
      didParseCell: (dataCell) => {
        if (dataCell.row.index === tableRows.length - 1) {
          dataCell.cell.styles.fontStyle = 'bold'
          dataCell.cell.styles.fillColor = [241, 245, 249]
        }
      },
    })

    startY = (doc as any).lastAutoTable.finalY + 5

    if (startY > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage()
      startY = 20
    }
  })

  const finalY = (doc as any).lastAutoTable.finalY + 10
  const summaryX = pageWidth - 90
  const grandTotal = data.reduce((acc, item) => acc + Number(item.price), 0)
  const grandTotalStock = data.reduce((acc, item) => acc + Number(item.stock), 0)

  const drawSummary = (y: number) => {
    doc.setFillColor(248, 250, 252)
    doc.rect(summaryX, y, 76, 20, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.rect(summaryX, y, 76, 20, 'S')

    setPdfFont(doc, 'bold')
    doc.setFontSize(11)
    doc.text(t('stockTrackReportPdf.summary.grandTotalStock'), summaryX + 2, y + 7)
    doc.text(grandTotalStock.toLocaleString(), pageWidth - 16, y + 7, { align: 'right' })

    doc.text(t('stockTrackReportPdf.summary.grandTotalAmount'), summaryX + 2, y + 15)
    doc.text(formatCurrencyTaka(exportT, grandTotal), pageWidth - 16, y + 15, {
      align: 'right',
    })
  }

  if (finalY > doc.internal.pageSize.getHeight() - 50) {
    doc.addPage()
    drawSummary(20)
  } else {
    drawSummary(finalY)
  }

  drawPdfFooter(doc, exportT, pageWidth)
  doc.save(`Stock_Track_Report_${Date.now()}.pdf`)
}
