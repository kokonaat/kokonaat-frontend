import type { TFunction } from 'i18next'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { TransactionLedgerDetailItem } from '@/interface/reportInterface'
import { formatGeneratedDate, formatReportPeriod, type ExportTFunction } from '@/utils/exportPdfHelpers'

export const generateLedgerExcel = (
  t: TFunction<'export'>,
  shopName: string,
  entityName: string,
  data: TransactionLedgerDetailItem[],
  dateRange?: { from: string; to: string },
) => {
  const na = t('common.fallbacks.notAvailable')
  const exportT = t as ExportTFunction

  const headerInfo = [
    [shopName.toUpperCase()],
    [entityName.toUpperCase()],
    [t('customerOrVendorLedgerExcel.title')],
    [],
    [t('customerOrVendorLedgerExcel.labels.reportPeriod'), formatReportPeriod(exportT, dateRange)],
    [t('customerOrVendorLedgerExcel.labels.generatedOn'), formatGeneratedDate()],
    [],
  ]

  const rows = data.map((item) => ({
    Date: new Date(item.createdAt).toLocaleDateString(),
    TransactionNo: item.transactionNo,
    Item: item.inventoryName,
    UOM: item.unitOfMeasurement?.name || na,
    Type: item.transactionType,
    Quantity: Number(item.quantity),
    Price: Number(item.price),
    Total: Number(item.total),
    PaymentType: item.paymentType,
    Customer: item.entityName,
  }))

  const totalQuantity = rows.reduce((acc, r) => acc + r.Quantity, 0)
  const totalAmount = rows.reduce((acc, r) => acc + r.Total, 0)

  const dataRows = rows.map((row) => [
    row.Date,
    row.TransactionNo,
    row.Item,
    row.UOM,
    row.Type,
    row.Quantity,
    row.Price,
    row.Total,
    row.PaymentType,
    row.Customer,
  ])

  const worksheetData = [
    ...headerInfo,
    [
      t('customerOrVendorLedgerExcel.tableHeaders.date'),
      t('customerOrVendorLedgerExcel.tableHeaders.transactionNo'),
      t('customerOrVendorLedgerExcel.tableHeaders.item'),
      t('customerOrVendorLedgerExcel.tableHeaders.uom'),
      t('customerOrVendorLedgerExcel.tableHeaders.type'),
      t('customerOrVendorLedgerExcel.tableHeaders.quantity'),
      t('customerOrVendorLedgerExcel.tableHeaders.price'),
      t('customerOrVendorLedgerExcel.tableHeaders.total'),
      t('customerOrVendorLedgerExcel.tableHeaders.paymentType'),
      t('customerOrVendorLedgerExcel.tableHeaders.customer'),
    ],
    ...dataRows,
    [],
    [t('customerOrVendorLedgerExcel.summary.title')],
    [t('customerOrVendorLedgerExcel.summary.totalTransactions'), data.length],
    [t('customerOrVendorLedgerExcel.summary.totalQuantity'), totalQuantity],
    [t('customerOrVendorLedgerExcel.summary.totalAmount'), totalAmount],
  ]

  const ws = XLSX.utils.aoa_to_sheet(worksheetData)

  ws['!cols'] = [
    { wch: 12 },
    { wch: 18 },
    { wch: 25 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 16 },
    { wch: 22 },
  ]

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  for (let R = 0; R < 2; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[cell]) continue
      ws[cell].s = ws[cell].s || {}
      ws[cell].s.font = { bold: true }
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, t('customerOrVendorLedgerExcel.sheetName'))

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })

  saveAs(blob, `Ledger_${entityName.replace(/\s+/g, '_')}_${Date.now()}.xlsx`)
}
