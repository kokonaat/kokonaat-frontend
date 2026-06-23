import type { TFunction } from 'i18next'
import autoTable from 'jspdf-autotable'
import {
  drawPdfFooter,
  getAutoTableFont,
  type ExportTFunction,
} from '@/utils/exportPdfHelpers'
import { createPdfDocument, setPdfFont } from '@/utils/pdfFont'

interface Inventory {
  id: string
  name: string
}

interface InventoryTracking {
  id: string
  inventory: Inventory
  stock: number
  price: number
  isPurchased: boolean
  createdAt: string
  updatedAt: string
}

interface InventoryDetails {
  no: string
  name: string
  description?: string | null
  quantity: number
  lastPrice: number
  unitOfMeasurement?: {
    id: string
    name: string
  }
}

const formatNumber = (num: number | string | undefined | null) => {
  const n = Number(num) || 0
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const generateInventoryTrackingPDF = async (
  t: TFunction<'export'>,
  inventoryDetails: InventoryDetails,
  trackingData: InventoryTracking[],
  shopName: string = 'Shop Name',
) => {
  const doc = await createPdfDocument()
  const pageWidth = doc.internal.pageSize.getWidth()
  const tableFont = getAutoTableFont()
  const uom = inventoryDetails.unitOfMeasurement?.name || ''

  setPdfFont(doc, 'bold')
  doc.setFontSize(20)
  doc.text(shopName.toUpperCase(), pageWidth / 2, 15, { align: 'center' })

  doc.setFontSize(10)
  setPdfFont(doc, 'normal')
  doc.text(t('inventoryTrackingReportPdf.title'), pageWidth / 2, 22, { align: 'center' })

  doc.setLineWidth(0.5)
  doc.line(14, 28, pageWidth - 14, 28)

  setPdfFont(doc, 'bold')
  doc.setFontSize(11)
  doc.text(t('inventoryTrackingReportPdf.labels.inventory'), 14, 38)
  setPdfFont(doc, 'normal')
  doc.text(inventoryDetails.name, 38, 38)

  setPdfFont(doc, 'bold')
  doc.text(t('inventoryTrackingReportPdf.labels.itemNo'), 14, 46)
  setPdfFont(doc, 'normal')
  doc.text(inventoryDetails.no, 38, 46)

  setPdfFont(doc, 'bold')
  doc.text(t('inventoryTrackingReportPdf.labels.currentStock'), pageWidth - 60, 38, {
    align: 'right',
  })
  setPdfFont(doc, 'normal')
  doc.text(`${inventoryDetails.quantity} ${uom}`, pageWidth - 14, 38, { align: 'right' })

  setPdfFont(doc, 'bold')
  doc.text(t('inventoryTrackingReportPdf.labels.lastPrice'), pageWidth - 60, 46, {
    align: 'right',
  })
  setPdfFont(doc, 'normal')
  doc.text(formatNumber(inventoryDetails.lastPrice), pageWidth - 20, 46, { align: 'right' })

  setPdfFont(doc, 'bold')
  doc.text(t('inventoryTrackingReportPdf.labels.generatedOn'), pageWidth - 60, 54, {
    align: 'right',
  })
  setPdfFont(doc, 'normal')
  doc.text(new Date().toLocaleDateString(), pageWidth - 14, 54, { align: 'right' })

  const tableRows: any[] = []
  let runningStock = 0
  let totalPurchased = 0
  let totalSold = 0

  const sortedData = [...trackingData].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  sortedData.forEach((item, index) => {
    const transactionType = item.isPurchased
      ? t('common.transactionTypes.purchase')
      : t('common.transactionTypes.sale')
    const stockChange = item.isPurchased ? item.stock : -item.stock
    runningStock += stockChange

    if (item.isPurchased) {
      totalPurchased += item.stock
    } else {
      totalSold += item.stock
    }

    tableRows.push([
      (index + 1).toString(),
      new Date(item.createdAt).toLocaleDateString(),
      new Date(item.createdAt).toLocaleTimeString(),
      transactionType,
      item.isPurchased ? item.stock.toString() : '-',
      item.isPurchased ? '-' : item.stock.toString(),
      formatNumber(item.price),
      formatNumber(item.stock * item.price),
      runningStock.toString(),
    ])
  })

  tableRows.push([
    '',
    '',
    '',
    {
      content: t('common.labels.subtotalUppercase'),
      styles: { fontStyle: 'bold', fillColor: [226, 232, 240] },
    },
    {
      content: totalPurchased.toString(),
      styles: { fontStyle: 'bold', fillColor: [226, 232, 240], halign: 'center' },
    },
    {
      content: totalSold.toString(),
      styles: { fontStyle: 'bold', fillColor: [226, 232, 240], halign: 'center' },
    },
    { content: '', styles: { fillColor: [226, 232, 240] } },
    { content: '', styles: { fillColor: [226, 232, 240] } },
    {
      content: runningStock.toString(),
      styles: { fontStyle: 'bold', fillColor: [226, 232, 240], halign: 'center' },
    },
  ])

  autoTable(doc, {
    startY: 65,
    head: [[
      t('inventoryTrackingReportPdf.tableHeaders.number'),
      t('inventoryTrackingReportPdf.tableHeaders.date'),
      t('inventoryTrackingReportPdf.tableHeaders.time'),
      t('inventoryTrackingReportPdf.tableHeaders.type'),
      t('inventoryTrackingReportPdf.tableHeaders.purchased'),
      t('inventoryTrackingReportPdf.tableHeaders.sold'),
      t('inventoryTrackingReportPdf.tableHeaders.price'),
      t('inventoryTrackingReportPdf.tableHeaders.amount'),
      t('inventoryTrackingReportPdf.tableHeaders.stockInHand'),
    ]],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: 255,
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 9,
      font: tableFont,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 25 },
      2: { cellWidth: 22 },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 20, halign: 'center' },
      6: { halign: 'right', cellWidth: 20 },
      7: { halign: 'right', cellWidth: 22 },
      8: { halign: 'center', cellWidth: 20 },
    },
    styles: { fontSize: 8, cellPadding: 2, font: tableFont },
  })

  const finalY = (doc as any).lastAutoTable.finalY + 10
  const summaryX = pageWidth - 90

  doc.setFillColor(248, 250, 252)
  doc.rect(summaryX, finalY, 76, 38, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.rect(summaryX, finalY, 76, 38, 'S')

  const drawRow = (label: string, value: string | number, y: number, isBold = false) => {
    setPdfFont(doc, isBold ? 'bold' : 'normal')
    doc.text(label, summaryX + 2, y)
    doc.text(String(value), pageWidth - 16, y, { align: 'right' })
  }

  doc.setFontSize(10)
  drawRow(
    t('inventoryTrackingReportPdf.summary.totalPurchased'),
    `${totalPurchased} ${uom}`,
    finalY + 8,
  )
  drawRow(
    t('inventoryTrackingReportPdf.summary.totalSold'),
    `${totalSold} ${uom}`,
    finalY + 16,
  )

  doc.setDrawColor(200)
  doc.line(summaryX + 2, finalY + 20, pageWidth - 16, finalY + 20)

  drawRow(
    t('inventoryTrackingReportPdf.summary.currentStock'),
    `${inventoryDetails.quantity} ${uom}`,
    finalY + 26,
    true,
  )

  drawPdfFooter(doc, t as ExportTFunction, pageWidth)
  doc.save(
    `Inventory_Tracking_${inventoryDetails.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
  )
}
