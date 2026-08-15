import type { TFunction } from 'i18next'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import i18n from '@/i18n'
import type { Transaction } from '@/interface/transactionInterface'
import { getAutoTableFont } from '@/utils/exportPdfHelpers'
import { setPdfFont } from '@/utils/pdfFont'

// 80mm thermal paper, height auto-extends via jsPDF format trick
const PAGE_W = 80
const MARGIN = 4
const CONTENT_W = PAGE_W - MARGIN * 2

const fmt = (n: number | string | undefined | null) => {
  const v = Number(n) || 0
  return v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const translateType = (type: string) =>
  i18n.t(`enums:transactionType.${type}`, { defaultValue: type })

const translatePaymentType = (type: string) =>
  i18n.t(`enums:paymentType.${type}`, { defaultValue: type })

const divider = (doc: jsPDF, y: number) => {
  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.2)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
}

export const generateThermalPDF = async (
  t: TFunction<'export'>,
  transaction: Transaction,
  shopName: string,
) => {
  // Use a tall page; jsPDF will clip at bottom — we track Y manually
  const doc = new jsPDF({ unit: 'mm', format: [PAGE_W, 400], orientation: 'portrait' })
  const tableFont = getAutoTableFont()
  const na = t('common.fallbacks.notAvailable')

  let y = 6

  // Shop name
  setPdfFont(doc, 'bold')
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text(shopName.toUpperCase(), PAGE_W / 2, y, { align: 'center' })
  y += 5

  // Transaction type title
  setPdfFont(doc, 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(80, 80, 80)
  doc.text(translateType(transaction.transactionType).toUpperCase(), PAGE_W / 2, y, { align: 'center' })
  y += 4

  divider(doc, y)
  y += 3

  // Transaction no + date in two columns
  const date = new Date(transaction.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
  const time = new Date(transaction.createdAt).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  })

  const drawKV = (label: string, value: string, yPos: number) => {
    setPdfFont(doc, 'normal')
    doc.setFontSize(7)
    doc.setTextColor(100, 100, 100)
    doc.text(label, MARGIN, yPos)
    setPdfFont(doc, 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(0, 0, 0)
    doc.text(value, PAGE_W - MARGIN, yPos, { align: 'right' })
  }

  drawKV(t('thermal.no'), transaction.no, y)
  y += 4
  drawKV(t('thermal.date'), `${date} ${time}`, y)
  y += 4

  const partnerName = transaction.vendor?.name ?? transaction.customer?.name ?? na
  const partnerLabel = transaction.vendor
    ? t('common.partnerTypes.vendor')
    : t('common.partnerTypes.customer')
  drawKV(partnerLabel, partnerName, y)
  y += 3

  divider(doc, y)
  y += 4

  // Items table (if any)
  const hasItems = transaction.details && transaction.details.length > 0
  if (hasItems) {
    const rows = transaction.details.map((d) => [
      d.inventory?.name ?? na,
      `${Number(d.quantity || 0)}`,
      fmt(d.price),
      fmt(d.total),
    ])

    autoTable(doc, {
      startY: y,
      head: [[
        t('thermal.item'),
        t('thermal.qty'),
        t('thermal.price'),
        t('thermal.total'),
      ]],
      body: rows,
      theme: 'plain',
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: [0, 0, 0],
        fontSize: 6.5,
        cellPadding: 1.5,
        font: tableFont,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' },
        1: { cellWidth: 10, halign: 'center' },
        2: { cellWidth: 16, halign: 'right' },
        3: { cellWidth: 16, halign: 'right' },
      },
      styles: { fontSize: 7, cellPadding: 1.5, font: tableFont, lineWidth: 0 },
      margin: { left: MARGIN, right: MARGIN },
    })

    y = (doc as any).lastAutoTable.finalY + 2
    divider(doc, y)
    y += 3

    // Extra costs
    const cnf = Number(transaction.cnfCost) || 0
    const labour = Number(transaction.labourCost) || 0
    const transport = Number(transaction.transportCost) || 0
    const discount = Number(transaction.discount) || 0
    const subtotal = transaction.details.reduce((s, d) => s + Number(d.total || 0), 0)

    drawKV(t('thermal.subtotal'), fmt(subtotal), y); y += 4
    if (cnf > 0) { drawKV(t('transactionDetailsPdf.fields.cnfCost'), fmt(cnf), y); y += 4 }
    if (labour > 0) { drawKV(t('transactionDetailsPdf.fields.labourCost'), fmt(labour), y); y += 4 }
    if (transport > 0) { drawKV(t('transactionDetailsPdf.fields.transportCost'), fmt(transport), y); y += 4 }
    if (discount > 0) { drawKV(`${t('transactionDetailsPdf.summary.discount')} (-)`, fmt(discount), y); y += 4 }
  }

  // Total / Paid / Due
  setPdfFont(doc, 'bold')
  doc.setFontSize(8)
  doc.text(t('thermal.total'), MARGIN, y)
  doc.text(fmt(transaction.totalAmount), PAGE_W - MARGIN, y, { align: 'right' })
  y += 4

  setPdfFont(doc, 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(22, 101, 52)
  doc.text(t('thermal.paid'), MARGIN, y)
  doc.text(fmt(transaction.paid), PAGE_W - MARGIN, y, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  y += 4

  const pending = Number(transaction.pending) || 0
  if (pending > 0) {
    setPdfFont(doc, 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(185, 28, 28)
    doc.text(t('thermal.due'), MARGIN, y)
    doc.text(fmt(pending), PAGE_W - MARGIN, y, { align: 'right' })
    doc.setTextColor(0, 0, 0)
    y += 4
  }

  // Payment breakdown
  const paymentEntries = (transaction.payments ?? []).filter((p) => Number(p.amount) > 0)
  if (paymentEntries.length > 0) {
    divider(doc, y); y += 3
    paymentEntries.forEach((p) => {
      const label = translatePaymentType(p.paymentType)
      setPdfFont(doc, 'normal')
      doc.setFontSize(7)
      doc.setTextColor(80, 80, 80)
      doc.text(label, MARGIN, y)
      setPdfFont(doc, 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(0, 0, 0)
      doc.text(fmt(p.amount), PAGE_W - MARGIN, y, { align: 'right' })
      y += 4
    })
  } else if (transaction.paymentType) {
    divider(doc, y); y += 3
    setPdfFont(doc, 'normal')
    doc.setFontSize(7)
    doc.setTextColor(80, 80, 80)
    doc.text(`${t('thermal.paymentType')}: ${translatePaymentType(transaction.paymentType)}`, PAGE_W / 2, y, { align: 'center' })
    y += 4
  }

  // Remarks
  if (transaction.remarks) {
    divider(doc, y); y += 3
    setPdfFont(doc, 'normal')
    doc.setFontSize(7)
    doc.setTextColor(80, 80, 80)
    const lines = doc.splitTextToSize(transaction.remarks, CONTENT_W) as string[]
    lines.forEach((line: string) => {
      doc.text(line, PAGE_W / 2, y, { align: 'center' })
      y += 3.5
    })
  }

  divider(doc, y); y += 4

  // Thank you
  setPdfFont(doc, 'bold')
  doc.setFontSize(8)
  doc.setTextColor(0, 0, 0)
  doc.text(t('thermal.thankYou'), PAGE_W / 2, y, { align: 'center' })
  y += 5

  doc.save(`Receipt_${transaction.no}.pdf`)
}
