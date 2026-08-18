import type { TFunction } from 'i18next'
import autoTable from 'jspdf-autotable'
import i18n from '@/i18n'
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
  const paymentBreakdown = (transaction.payments ?? []).filter((p) => Number(p.amount) > 0)
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

  if (paymentBreakdown.length > 0) {
    setPdfFont(doc, 'normal')
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text(t('transactionDetailsPdf.fields.paymentType'), leftX, leftY)
    leftY += 5
    paymentBreakdown.forEach((p) => {
      const pLabel = i18n.t(`enums:paymentType.${p.paymentType}`, { defaultValue: p.paymentType })
      const pValue = Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      setPdfFont(doc, 'bold')
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      doc.text(pLabel, leftX, leftY)
      doc.text(pValue, leftX + columnWidth, leftY, { align: 'right' })
      leftY += 6
    })
    leftY += 2
  } else {
    leftY = drawField(t('transactionDetailsPdf.fields.paymentType'), paymentType, leftX, leftY)
  }

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
  const discount = Number(transaction.discount) || 0

  rightY = currentY
  if (isInventoryTransaction) {
    rightY = drawField(
      t('transactionDetailsPdf.fields.subtotal'),
      subtotal.toLocaleString('en-IN'),
      rightX,
      rightY,
      true,
    )
    if (cnfCost > 0) {
      rightY = drawField(t('transactionDetailsPdf.fields.cnfCost'), cnfCost.toLocaleString('en-IN'), rightX, rightY, true)
    }
    if (labourCost > 0) {
      rightY = drawField(t('transactionDetailsPdf.fields.labourCost'), labourCost.toLocaleString('en-IN'), rightX, rightY, true)
    }
    if (transportCost > 0) {
      rightY = drawField(t('transactionDetailsPdf.fields.transportCost'), transportCost.toLocaleString('en-IN'), rightX, rightY, true)
    }
    if (discount > 0) {
      rightY = drawField(t('transactionDetailsPdf.fields.discount'), `-${discount.toLocaleString('en-IN')}`, rightX, rightY, true)
    }
  }
  rightY = drawField(
    t('transactionDetailsPdf.fields.totalAmount'),
    transaction.totalAmount.toLocaleString('en-IN'),
    rightX,
    rightY,
    true,
  )
  rightY = drawField(
    t('transactionDetailsPdf.fields.paid'),
    transaction.paid.toLocaleString('en-IN'),
    rightX,
    rightY,
    true,
  )
  rightY = drawField(
    t('transactionDetailsPdf.fields.pending'),
    transaction.pending.toLocaleString('en-IN'),
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

  let ledgerTableY = startY

  if (transaction.details && transaction.details.length > 0) {
    setPdfFont(doc, 'bold')
    doc.setFontSize(11)
    doc.text(t('transactionDetailsPdf.sections.transactionDetailsTable'), 14, startY)
    startY += 8

    const formatNumber = (num: number | string | undefined | null) => {
      const n = Number(num) || 0
      return n.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }

    const pdfCnfCost = Number(transaction.cnfCost) || 0
    const pdfLabourCost = Number(transaction.labourCost) || 0
    const pdfTransportCost = Number(transaction.transportCost) || 0
    const pdfDiscount = Number(transaction.discount) || 0
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

    const discountRow = pdfDiscount > 0
      ? { label: t('transactionDetailsPdf.summary.discount'), value: -pdfDiscount }
      : null

    // rows: subtotal, ...extra costs, discount?, total, divider, paid, divider, pending
    const summaryRows = 2 + extraCostRows.length + (discountRow ? 1 : 0) + 2 // subtotal + costs + discount + total + paid + pending
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
    if (discountRow) {
      sy += rowH
      drawSummaryRow(discountRow.label, discountRow.value, sy)
    }
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
    ledgerTableY = finalY + summaryHeight + 14
  }

  // Transaction Ledger table (shows for all types, especially useful for RECEIVABLE/PAYMENT)
  setPdfFont(doc, 'bold')
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text(t('transactionLedgerTable.title'), 14, ledgerTableY)

  const translateType = (type: string) =>
    i18n.t(`enums:transactionType.${type}`, { defaultValue: type })

  const ledgerBalance = Math.max(0, Number(transaction.totalAmount) - Number(transaction.paid))
  autoTable(doc, {
    startY: ledgerTableY + 5,
    head: [[
      t('transactionLedgerTable.headers.date'),
      t('transactionLedgerTable.headers.no'),
      t('transactionLedgerTable.headers.type'),
      t('transactionLedgerTable.headers.amount'),
      t('transactionLedgerTable.headers.paid'),
      t('transactionLedgerTable.headers.balance'),
    ]],
    body: [[
      new Date(transaction.createdAt).toLocaleDateString('en-GB'),
      transaction.no,
      translateType(transaction.transactionType),
      { content: Number(transaction.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right' as const } },
      { content: Number(transaction.paid).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right' as const } },
      { content: ledgerBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { halign: 'right' as const, textColor: ledgerBalance > 0 ? [220, 38, 38] as [number, number, number] : [0, 0, 0] as [number, number, number] } },
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: [31, 41, 55] as [number, number, number],
      textColor: 255,
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 3,
      font: tableFont,
    },
    columnStyles: {
      0: { cellWidth: 24, halign: 'left' },
      1: { cellWidth: 34, halign: 'left' },
      2: { cellWidth: 'auto', halign: 'left' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 28, halign: 'right' },
    },
    styles: { fontSize: 8.5, font: tableFont, cellPadding: 2.5 },
  })

  drawPdfFooter(doc, t as ExportTFunction, pageWidth)
  doc.save(`Transaction_${transaction.no}_${Date.now()}.pdf`)
}
