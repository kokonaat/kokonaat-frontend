import type { TFunction } from 'i18next'
import * as XLSX from 'xlsx'
import {
  formatGeneratedDate,
  formatReportPeriod,
  getDateLocale,
  type ExportTFunction,
} from '@/utils/exportPdfHelpers'

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

export const generateTransactionReportExcel = (
  t: TFunction<'export'>,
  data: TransactionReportItem[],
  shopName: string,
  dateRange?: { from: string; to: string },
  transactionType?: string,
) => {
  const na = t('common.fallbacks.notAvailable')
  const exportT = t as ExportTFunction
  const locale = getDateLocale()

  const summary: TransactionSummary = {
    totalTransactions: data.length,
    totalBillAmount: data.reduce((acc, item) => acc + Number(item.totalAmount), 0),
    totalPaid: data.reduce((acc, item) => acc + Number(item.paid), 0),
    totalDue: data.reduce((acc, item) => acc + Number(item.pending), 0),
  }

  const wb = XLSX.utils.book_new()
  const typeLabel = transactionType || t('common.fallbacks.allTypes')
  const periodLabel = dateRange
    ? formatReportPeriod(exportT, dateRange)
    : t('common.fallbacks.allTime')

  const headerData = [
    [shopName.toUpperCase()],
    [t('transactionReportExcel.title')],
    [],
    [t('transactionReportExcel.labels.transactionType', { type: typeLabel })],
    [t('transactionReportExcel.labels.reportPeriod', {
      from: dateRange
        ? new Date(dateRange.from).toLocaleDateString(locale)
        : '',
      to: dateRange ? new Date(dateRange.to).toLocaleDateString(locale) : periodLabel,
    })],
    [t('transactionReportExcel.labels.generatedOn', { date: formatGeneratedDate() })],
    [],
  ]

  const tableHeaders = [
    t('transactionReportExcel.tableHeaders.date'),
    t('transactionReportExcel.tableHeaders.transactionId'),
    t('transactionReportExcel.tableHeaders.type'),
    t('transactionReportExcel.tableHeaders.customerVendor'),
    t('transactionReportExcel.tableHeaders.items'),
    t('transactionReportExcel.tableHeaders.billAmount'),
    t('transactionReportExcel.tableHeaders.paid'),
    t('transactionReportExcel.tableHeaders.due'),
    t('transactionReportExcel.tableHeaders.paymentMethod'),
  ]

  const tableData = data.map((item) => {
    const partyName = item.vendor?.name || item.customer?.name || na
    const itemsSummary = item.details
      .map((d) => `${d.inventory?.name || na} (${d.quantity})`)
      .join(', ')

    return [
      new Date(item.createdAt).toLocaleDateString(locale),
      item.no,
      item.transactionType,
      partyName,
      itemsSummary,
      Number(item.totalAmount).toFixed(2),
      Number(item.paid).toFixed(2),
      Number(item.pending).toFixed(2),
      item.paymentType,
    ]
  })

  const summaryData = [
    [],
    [t('transactionReportExcel.summary.title')],
    [t('transactionReportExcel.summary.totalTransactions'), summary.totalTransactions],
    [t('transactionReportExcel.summary.totalBillAmount'), summary.totalBillAmount.toFixed(2)],
    [t('transactionReportExcel.summary.totalPaid'), summary.totalPaid.toFixed(2)],
    [t('transactionReportExcel.summary.totalDue'), summary.totalDue.toFixed(2)],
  ]

  const worksheetData = [...headerData, tableHeaders, ...tableData, ...summaryData]
  const ws = XLSX.utils.aoa_to_sheet(worksheetData)

  ws['!cols'] = [
    { wch: 12 },
    { wch: 18 },
    { wch: 12 },
    { wch: 20 },
    { wch: 40 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
  ]

  const headerStyle = {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: 'center' },
  }

  if (ws['A1']) ws['A1'].s = headerStyle
  if (ws['A2']) {
    ws['A2'].s = { font: { sz: 11 }, alignment: { horizontal: 'center' } }
  }

  const headerRowIndex = headerData.length + 1
  tableHeaders.forEach((_, colIndex) => {
    const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex - 1, c: colIndex })
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: '334155' } },
        alignment: { horizontal: 'center' },
      }
    }
  })

  const summaryStartRow = headerData.length + tableData.length + 2
  if (ws[`A${summaryStartRow}`]) {
    ws[`A${summaryStartRow}`].s = { font: { bold: true, sz: 12 } }
  }

  XLSX.utils.book_append_sheet(wb, ws, t('transactionReportExcel.sheetName'))
  XLSX.writeFile(wb, `Transaction_Report_${transactionType || 'All'}_${Date.now()}.xlsx`)
}
