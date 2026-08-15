import type { TFunction } from 'i18next'
import autoTable from 'jspdf-autotable'
import i18n from '@/i18n'
import {
  drawLeftLabelValue,
  drawPdfFooter,
  drawRightAlignedMetaLine,
  formatGeneratedDate,
  getAutoTableFont,
  type ExportTFunction,
} from '@/utils/exportPdfHelpers'
import { createPdfDocument, setPdfFont } from '@/utils/pdfFont'

interface Inventory {
  id: string
  name: string
}

interface TransactionDetail {
  id: string
  no: string
  quantity?: number | null
  price?: number | null
  total?: number | null
  inventory?: Inventory | null
  [key: string]: unknown
}

interface Transaction {
  id: string
  no: string
  transactionType: string
  paymentType: string
  customer?: { id: string; name: string }
  vendor?: { id: string; name: string }
  details: TransactionDetail[]
  payments?: { paymentType: string; amount: number }[]
  totalAmount: number
  paid: number
  pending: number
  discount?: number
  createdAt: string
}

interface Summary {
  totalAmount: number
  totalPaid: number
}

export interface Entity {
  name: string
  no?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  shop: {
    name: string
    address?: string | null
  }
}

const getItemName = (item: TransactionDetail, na: string) =>
  item.inventory?.name || (item.itemName as string) || (item.name as string) || na

const getQuantity = (item: TransactionDetail) =>
  Number(item.quantity ?? item.qty ?? 0)

const getPrice = (item: TransactionDetail) =>
  Number(item.price ?? item.unitPrice ?? 0)

const getTotal = (item: TransactionDetail) => {
  if (item.total != null) return Number(item.total)
  if (item.amount != null) return Number(item.amount)
  return getQuantity(item) * getPrice(item)
}

const formatNumber = (num: number | string | undefined | null) => {
  const n = Number(num) || 0
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const translateTransactionType = (type: string) =>
  i18n.t(`enums:transactionType.${type}`, { defaultValue: type })

const translatePaymentType = (type: string) =>
  i18n.t(`enums:paymentType.${type}`, { defaultValue: type })

export const generatePDF = async (
  t: TFunction<'export'>,
  entity: Entity,
  transactions: Transaction[],
  summary: Summary,
) => {
  const doc = await createPdfDocument()
  const pageWidth = doc.internal.pageSize.getWidth()
  const rightMargin = pageWidth - 14
  const na = t('common.fallbacks.notAvailable')
  const tableFont = getAutoTableFont()

  setPdfFont(doc, 'bold')
  doc.setFontSize(20)
  doc.text(entity.shop.name.toUpperCase(), pageWidth / 2, 16, { align: 'center' })

  setPdfFont(doc, 'normal')
  doc.setFontSize(11)
  doc.text(t('transactionReportWithDetailsPdf.title'), pageWidth / 2, 23, {
    align: 'center',
  })

  doc.setLineWidth(0.4)
  doc.setDrawColor(31, 41, 55)
  doc.line(14, 28, pageWidth - 14, 28)

  let accountLabel = t('common.accountLabels.accountHolder')
  let accountName = entity.name

  if (transactions.length > 0) {
    const firstTrx = transactions[0]
    if (firstTrx.customer) {
      accountLabel = t('common.accountLabels.customer')
      accountName = firstTrx.customer.name
    } else if (firstTrx.vendor) {
      accountLabel = `${t('common.accountLabels.vendor')}:`
      accountName = firstTrx.vendor.name
    }
  }

  drawLeftLabelValue(doc, accountLabel, accountName, 14, 37)

  drawRightAlignedMetaLine(
    doc,
    t('common.labels.generatedOn'),
    formatGeneratedDate(),
    rightMargin,
    37,
  )

  if (entity.phone) {
    drawRightAlignedMetaLine(
      doc,
      t('common.labels.phone'),
      entity.phone,
      rightMargin,
      44,
    )
  }

  // Summary boxes: Total | Paid | Receivable/Payable
  const balanceDueTop = summary.totalAmount - summary.totalPaid
  const isVendor = transactions.length > 0 && !!transactions[0].vendor
  const balanceLabel = isVendor
    ? t('transactionReportWithDetailsPdf.summary.payable')
    : t('transactionReportWithDetailsPdf.summary.receivable')

  const boxY = entity.phone ? 52 : 46
  const boxH = 18
  const usableWidth = pageWidth - 28
  const gap = 4
  const boxW = (usableWidth - gap * 2) / 3

  const summaryBoxes = [
    { label: t('transactionReportWithDetailsPdf.summary.totalAmount'), value: summary.totalAmount, color: [17, 24, 39] as [number, number, number] },
    { label: t('transactionReportWithDetailsPdf.summary.totalPaid'), value: summary.totalPaid, color: [22, 101, 52] as [number, number, number] },
    { label: balanceLabel, value: balanceDueTop, color: balanceDueTop > 0 ? [185, 28, 28] as [number, number, number] : [17, 24, 39] as [number, number, number] },
  ]

  summaryBoxes.forEach((box, i) => {
    const bx = 14 + i * (boxW + gap)
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(203, 213, 225)
    doc.setLineWidth(0.3)
    doc.rect(bx, boxY, boxW, boxH, 'FD')

    setPdfFont(doc, 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(100, 116, 139)
    doc.text(box.label.toUpperCase(), bx + boxW / 2, boxY + 6, { align: 'center' })

    setPdfFont(doc, 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...box.color)
    doc.text(formatNumber(box.value), bx + boxW / 2, boxY + 13, { align: 'center' })
    doc.setTextColor(0, 0, 0)
  })

  const tableRows: (string | Record<string, unknown>)[][] = []
  let subtotalQty = 0
  let subtotalTotal = 0

  transactions.forEach((trx) => {
    const trxDate = new Date(trx.createdAt).toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    const headerStyles = {
      fontStyle: 'bold' as const,
      fillColor: [241, 245, 249] as [number, number, number],
      textColor: [17, 24, 39] as [number, number, number],
    }

    tableRows.push([
      { content: trxDate, styles: headerStyles },
      { content: trx.no, styles: { ...headerStyles, overflow: 'visible' as const } },
      {
        content: translateTransactionType(trx.transactionType),
        styles: headerStyles,
      },
      {
        content: (() => {
          const entries = (trx.payments ?? []).filter((p) => Number(p.amount) > 0)
          if (entries.length > 0) return entries.map((p) => translatePaymentType(p.paymentType)).join(', ')
          return trx.paymentType ? translatePaymentType(trx.paymentType) : '-'
        })(),
        styles: { ...headerStyles, halign: 'center' as const },
      },
      { content: '', styles: { fillColor: [241, 245, 249] } },
      { content: '', styles: { fillColor: [241, 245, 249] } },
      {
        content: formatNumber(trx.totalAmount),
        styles: { ...headerStyles, halign: 'right' as const },
      },
    ])

    if (trx.details && trx.details.length > 0) {
      trx.details.forEach((item, idx) => {
        const qty = getQuantity(item)
        const total = getTotal(item)
        subtotalQty += qty
        subtotalTotal += total

        tableRows.push([
          '',
          `${idx + 1}.`,
          getItemName(item, na),
          '',
          { content: qty.toString(), styles: { halign: 'center' as const } },
          { content: formatNumber(getPrice(item)), styles: { halign: 'right' as const } },
          { content: formatNumber(total), styles: { halign: 'right' as const } },
        ])
      })

      if (trx.paid > 0 || trx.pending > 0) {
        tableRows.push([
          '',
          '',
          {
            content: t('common.financial.paidAndPending', {
              paid: formatNumber(trx.paid),
              pending: formatNumber(trx.pending),
            }),
            colSpan: 5,
            styles: {
              fontStyle: 'italic' as const,
              textColor: [100, 116, 139] as [number, number, number],
              fontSize: 8,
            },
          },
        ])
      }
    } else {
      const amount = trx.paid || trx.totalAmount || 0
      // Only SALE/PURCHASE rows count toward the subtotal; RECEIVABLE/PAYMENT are collections, not new amounts
      const isInventoryTrx = trx.transactionType === 'SALE' || trx.transactionType === 'PURCHASE'
      if (isInventoryTrx) subtotalTotal += amount

      const paymentEntries = (trx.payments ?? []).filter((p) => Number(p.amount) > 0)
      if (paymentEntries.length > 0) {
        paymentEntries.forEach((p) => {
          tableRows.push([
            '',
            '',
            translatePaymentType(p.paymentType),
            '',
            { content: '-', styles: { halign: 'center' as const } },
            { content: '-', styles: { halign: 'right' as const } },
            { content: formatNumber(Number(p.amount)), styles: { halign: 'right' as const } },
          ])
        })
      } else {
        tableRows.push([
          '',
          '',
          translateTransactionType(trx.transactionType),
          '',
          { content: '-', styles: { halign: 'center' as const } },
          { content: '-', styles: { halign: 'right' as const } },
          { content: formatNumber(amount), styles: { halign: 'right' as const } },
        ])

        if (trx.paid > 0) {
          tableRows.push([
            '',
            '',
            {
              content: t('common.financial.paidWithAmount', {
                amount: formatNumber(trx.paid),
              }),
              colSpan: 5,
              styles: {
                fontStyle: 'italic' as const,
                textColor: [100, 116, 139] as [number, number, number],
                fontSize: 8,
              },
            },
          ])
        }
      }
    }

    tableRows.push([
      {
        content: '',
        colSpan: 7,
        styles: { minCellHeight: 3, fillColor: [255, 255, 255], lineWidth: 0 },
      },
    ])
  })

  const subtotalStyles = {
    fontStyle: 'bold' as const,
    fillColor: [226, 232, 240] as [number, number, number],
    textColor: [17, 24, 39] as [number, number, number],
  }

  tableRows.push([
    { content: '', colSpan: 2, styles: subtotalStyles },
    {
      content: t('common.labels.subtotal'),
      styles: { ...subtotalStyles, halign: 'right' as const },
    },
    { content: '', styles: subtotalStyles },
    {
      content: subtotalQty > 0 ? subtotalQty.toString() : '-',
      styles: { ...subtotalStyles, halign: 'center' as const },
    },
    { content: '', styles: subtotalStyles },
    {
      content: formatNumber(subtotalTotal),
      styles: { ...subtotalStyles, halign: 'right' as const },
    },
  ])

  autoTable(doc, {
    startY: entity.phone ? 76 : 70,
    head: [[
      t('transactionReportWithDetailsPdf.tableHeaders.date'),
      t('transactionReportWithDetailsPdf.tableHeaders.trxNo'),
      t('transactionReportWithDetailsPdf.tableHeaders.description'),
      t('transactionReportWithDetailsPdf.tableHeaders.payment'),
      t('transactionReportWithDetailsPdf.tableHeaders.qty'),
      t('transactionReportWithDetailsPdf.tableHeaders.price'),
      t('transactionReportWithDetailsPdf.tableHeaders.amount'),
    ]],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [31, 41, 55],
      textColor: 255,
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 3,
      font: tableFont,
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'left' },
      1: { cellWidth: 34, halign: 'left', overflow: 'visible' },
      2: { cellWidth: 'auto', halign: 'left' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 24, halign: 'right' },
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: [203, 213, 225],
      lineWidth: 0.1,
      font: tableFont,
      valign: 'middle',
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) return
      doc.setDrawColor(203, 213, 225)
      doc.setLineWidth(0.2)
    },
  })

  drawPdfFooter(doc, t as ExportTFunction, pageWidth)
  doc.save(`Transaction_Report_${entity.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`)
}
