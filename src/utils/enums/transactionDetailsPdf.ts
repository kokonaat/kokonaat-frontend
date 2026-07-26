import type { TFunction } from 'i18next'
import autoTable from 'jspdf-autotable'
import type { Transaction } from '@/interface/transactionInterface'
import {
  drawPdfFooter,
  getAutoTableFont,
  type ExportTFunction,
} from '@/utils/exportPdfHelpers'
import { createPdfDocument, setPdfFont } from '@/utils/pdfFont'

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`
}

export const generateTransactionDetailsPDF = async (
  t: TFunction<'export'>,
  transaction: Transaction,
  shopName: string,
) => {
  const doc = await createPdfDocument()
  const pageWidth = doc.internal.pageSize.getWidth()
  const na = t('common.fallbacks.notAvailable')
  const tableFont = getAutoTableFont()
  let startY = 20

  setPdfFont(doc, 'bold')
  doc.setFontSize(22)
  doc.text(shopName.toUpperCase(), pageWidth / 2, 18, { align: 'center' })

  doc.setFontSize(11)
  setPdfFont(doc, 'normal')
  doc.text(t('transactionDetailsPdf.title'), pageWidth / 2, 25, { align: 'center' })

  doc.setLineWidth(0.5)
  doc.setDrawColor(0, 0, 0)
  doc.line(14, 30, pageWidth - 14, 30)

  startY = 38
  setPdfFont(doc, 'bold')
  doc.setFontSize(12)
  doc.text(t('transactionDetailsPdf.transactionNumber', { no: transaction.no }), 14, startY)

  setPdfFont(doc, 'normal')
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text(
    t('transactionDetailsPdf.typeLabel', { type: transaction.transactionType }),
    14,
    startY + 6,
  )
  doc.setTextColor(0, 0, 0)
  startY += 15

  const name = transaction.vendor?.name ?? transaction.customer?.name ?? na
  const partnerType = transaction.vendor
    ? t('common.partnerTypes.vendor')
    : transaction.customer
      ? t('common.partnerTypes.customer')
      : na
  const paymentType = (transaction.paymentType ?? na).replace('_', ' ')
  const status =
    transaction.transactionStatus ?? t('common.fallbacks.defaultStatusPending')

  const drawSectionHeader = (
    title: string,
    y: number,
    x: number,
    lineStartX: number,
    lineEndX: number,
  ) => {
    setPdfFont(doc, 'bold')
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text(title.toUpperCase(), x, y)
    doc.setTextColor(0, 0, 0)
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.5)
    doc.line(lineStartX, y + 3, lineEndX, y + 3)
    return y + 9
  }

  const drawField = (
    label: string,
    value: string,
    x: number,
    y: number,
    isRightAlign = false,
  ) => {
    setPdfFont(doc, 'normal')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text(label, x, y, { align: isRightAlign ? 'right' : 'left' })
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    const valueY = y + 5
    doc.text(value, x, valueY, { align: isRightAlign ? 'right' : 'left' })
    return valueY + 8
  }

  const leftX = 14
  const rightX = pageWidth - 14
  const columnWidth = (pageWidth - 28 - 16) / 2
  const columnCenter = pageWidth / 2
  let currentY = startY

  currentY = drawSectionHeader(
    t('transactionDetailsPdf.sections.transactionInformation'),
    currentY,
    leftX,
    leftX,
    columnCenter - 8,
  )
  let leftY = currentY
  leftY = drawField(partnerType, name, leftX, leftY)
  leftY = drawField(t('transactionDetailsPdf.fields.paymentType'), paymentType, leftX, leftY)
  leftY = drawField(t('transactionDetailsPdf.fields.status'), status, leftX, leftY)

  let rightY = startY
  rightY = drawSectionHeader(
    t('transactionDetailsPdf.sections.financialDetails'),
    rightY,
    columnCenter + 8,
    columnCenter + 8,
    rightX,
  )
  const isInventoryTransaction =
    transaction.transactionType === 'PURCHASE' || transaction.transactionType === 'SALE'
  const subtotal = (transaction.details || []).reduce((s, d) => s + Number(d.total || 0), 0)
  const cnfCost = Number(transaction.cnfCost) || 0
  const labourCost = Number(transaction.labourCost) || 0
  const transportCost = Number(transaction.transportCost) || 0

  rightY = currentY
  if (isInventoryTransaction) {
    rightY = drawField(
      t('transactionDetailsPdf.fields.subtotal'),
      subtotal.toLocaleString(),
      rightX,
      rightY,
      true,
    )
    if (cnfCost > 0) {
      rightY = drawField(t('transactionDetailsPdf.fields.cnfCost'), cnfCost.toLocaleString(), rightX, rightY, true)
    }
    if (labourCost > 0) {
      rightY = drawField(t('transactionDetailsPdf.fields.labourCost'), labourCost.toLocaleString(), rightX, rightY, true)
    }
    if (transportCost > 0) {
      rightY = drawField(t('transactionDetailsPdf.fields.transportCost'), transportCost.toLocaleString(), rightX, rightY, true)
    }
  }
  rightY = drawField(
    t('transactionDetailsPdf.fields.totalAmount'),
    transaction.totalAmount.toLocaleString(),
    rightX,
    rightY,
    true,
  )
  rightY = drawField(
    t('transactionDetailsPdf.fields.paid'),
    transaction.paid.toLocaleString(),
    rightX,
    rightY,
    true,
  )
  rightY = drawField(
    t('transactionDetailsPdf.fields.pending'),
    transaction.pending.toLocaleString(),
    rightX,
    rightY,
    true,
  )

  startY = Math.max(leftY, rightY) + 15

  currentY = drawSectionHeader(
    t('transactionDetailsPdf.sections.timeline'),
    startY,
    leftX,
    leftX,
    columnCenter - 8,
  )
  leftY = currentY
  leftY = drawField(
    t('transactionDetailsPdf.fields.createdAt'),
    formatDateTime(transaction.createdAt),
    leftX,
    leftY,
  )
  leftY = drawField(
    t('transactionDetailsPdf.fields.updatedAt'),
    formatDateTime(transaction.updatedAt),
    leftX,
    leftY,
  )

  rightY = startY
  rightY = drawSectionHeader(
    t('transactionDetailsPdf.sections.additionalInformation'),
    rightY,
    columnCenter + 8,
    columnCenter + 8,
    rightX,
  )
  rightY = currentY
  const remarks = transaction.remarks || na

  setPdfFont(doc, 'normal')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text(t('transactionDetailsPdf.fields.remarks'), rightX, rightY, { align: 'right' })
  rightY += 5
  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)
  const remarksLines = doc.splitTextToSize(remarks, columnWidth)
  remarksLines.forEach((line: string, index: number) => {
    doc.text(line, rightX, rightY + index * 6, { align: 'right' })
  })
  rightY += remarksLines.length * 6 + 4

  startY = Math.max(leftY, rightY) + 15

  if (transaction.details && transaction.details.length > 0) {
    setPdfFont(doc, 'bold')
    doc.setFontSize(11)
    doc.text(t('transactionDetailsPdf.sections.transactionDetailsTable'), 14, startY)
    startY += 8

    const formatNumber = (num: number | string | undefined | null) => {
      const n = Number(num) || 0
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }

    const pdfCnfCost = Number(transaction.cnfCost) || 0
    const pdfLabourCost = Number(transaction.labourCost) || 0
    const pdfTransportCost = Number(transaction.transportCost) || 0
    const pdfTotalQty = transaction.details.reduce((s, d) => s + Number(d.quantity || 0), 0)
    const pdfTotalExtraCosts = pdfCnfCost + pdfLabourCost + pdfTransportCost
    const pdfExtraCostPerUnit = pdfTotalQty > 0 && pdfTotalExtraCosts > 0 ? pdfTotalExtraCosts / pdfTotalQty : 0
    const pdfHasExtraCosts = pdfTotalExtraCosts > 0

    const tableRows = transaction.details.map((detail) => {
      const row: (string | number)[] = [
        detail.inventory?.name ?? na,
        detail.unitOfMeasurement?.name ?? na,
        formatNumber(detail.quantity || 0),
        formatNumber(detail.price || 0),
      ]
      if (pdfHasExtraCosts) {
        row.push(formatNumber(Number(detail.price || 0) + pdfExtraCostPerUnit))
      }
      row.push(formatNumber(detail.total || 0))
      return row
    })

    const subtotal = transaction.details.reduce(
      (sum, detail) => sum + Number(detail.total || 0),
      0,
    )
    const total = transaction.totalAmount || subtotal
    const pending = transaction.pending || 0

    const tableHead: string[] = [
      t('transactionDetailsPdf.tableHeaders.item'),
      t('transactionDetailsPdf.tableHeaders.uom'),
      t('transactionDetailsPdf.tableHeaders.qty'),
      t('transactionDetailsPdf.tableHeaders.price'),
    ]
    if (pdfHasExtraCosts) {
      tableHead.push(t('transactionDetailsPdf.tableHeaders.landedCost'))
    }
    tableHead.push(t('transactionDetailsPdf.tableHeaders.total'))

    const colStyles: Record<number, object> = pdfHasExtraCosts ? {
      0: { cellWidth: 50, halign: 'left' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 22, halign: 'right' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' },
    } : {
      0: { cellWidth: 60, halign: 'left' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    }

    autoTable(doc, {
      startY,
      head: [tableHead],
      body: tableRows,
      theme: 'plain',
      headStyles: {
        fillColor: [31, 41, 55],
        textColor: 255,
        halign: 'center',
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 3,
        font: tableFont,
      },
      columnStyles: colStyles,
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        lineColor: [229, 231, 235],
        lineWidth: 0.1,
        font: tableFont,
      },
      alternateRowStyles: { fillColor: [255, 255, 255] },
    })

    const finalY = (doc as any).lastAutoTable.finalY + 12
    const summaryX = pageWidth - 90
    const summaryWidth = 76
    const padding = 6
    const rowH = 7

    const extraCostRows = [
      cnfCost > 0 ? { label: t('transactionDetailsPdf.fields.cnfCost'), value: cnfCost } : null,
      labourCost > 0 ? { label: t('transactionDetailsPdf.fields.labourCost'), value: labourCost } : null,
      transportCost > 0 ? { label: t('transactionDetailsPdf.fields.transportCost'), value: transportCost } : null,
    ].filter(Boolean) as { label: string; value: number }[]

    // rows: subtotal, ...extra costs, total, divider, paid, divider, pending
    const summaryRows = 2 + extraCostRows.length + 2 // subtotal + costs + total + paid + pending
    const summaryHeight = padding + summaryRows * rowH + padding

    doc.setFillColor(255, 255, 255)
    doc.rect(summaryX, finalY, summaryWidth, summaryHeight, 'F')
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.rect(summaryX, finalY, summaryWidth, summaryHeight, 'S')

    const drawSummaryRow = (label: string, value: number, y: number, isBold = false) => {
      setPdfFont(doc, isBold ? 'bold' : 'normal')
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      doc.text(label, summaryX + padding, y)
      doc.text(formatNumber(value), summaryX + summaryWidth - padding, y, { align: 'right' })
      setPdfFont(doc, 'normal')
    }

    let sy = finalY + rowH
    drawSummaryRow(t('transactionDetailsPdf.summary.subTotal'), subtotal, sy)
    extraCostRows.forEach((row) => {
      sy += rowH
      drawSummaryRow(row.label, row.value, sy)
    })
    sy += rowH
    drawSummaryRow(t('transactionDetailsPdf.summary.total'), total, sy, true)
    sy += rowH - 2
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.3)
    doc.line(summaryX + padding, sy, summaryX + summaryWidth - padding, sy)
    sy += rowH - 2
    drawSummaryRow(t('transactionDetailsPdf.summary.paid'), transaction.paid, sy)
    sy += rowH - 2
    doc.line(summaryX + padding, sy, summaryX + summaryWidth - padding, sy)
    sy += rowH - 2
    drawSummaryRow(t('transactionDetailsPdf.summary.pending'), pending, sy, true)
  }

  drawPdfFooter(doc, t as ExportTFunction, pageWidth)
  doc.save(`Transaction_${transaction.no}_${Date.now()}.pdf`)
}
