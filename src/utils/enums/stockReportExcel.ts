import type { TFunction } from 'i18next'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { StockReportItem } from '@/interface/reportInterface'
import { formatGeneratedDate, formatReportPeriod, type ExportTFunction } from '@/utils/exportPdfHelpers'

export const generateStockReportExcel = (
  t: TFunction<'export'>,
  data: StockReportItem[],
  shopName: string,
  dateRange?: { from: string; to: string },
) => {
  const na = t('common.fallbacks.notAvailable')
  const exportT = t as ExportTFunction

  const headerInfo = [
    [shopName.toUpperCase()],
    [t('stockReportExcel.title')],
    [],
    [t('stockReportExcel.labels.reportPeriod'), formatReportPeriod(exportT, dateRange)],
    [t('stockReportExcel.labels.generatedOn'), formatGeneratedDate()],
    [],
  ]

  const rows = data.map((item) => ({
    RefNo: item.no,
    Name: item.name,
    Description: item.description || na,
    Quantity: Number(item.quantity),
    UOM: item.unitOfMeasurement?.name || na,
    LastPrice: Number(item.lastPrice),
    TotalValue: Number(item.quantity) * Number(item.lastPrice),
  }))

  const totalQuantity = data.reduce((acc, item) => acc + Number(item.quantity), 0)
  const totalValue = data.reduce(
    (acc, item) => acc + Number(item.quantity) * Number(item.lastPrice),
    0,
  )

  rows.push({
    RefNo: '',
    Name: t('stockReportExcel.totals.totalRow'),
    Description: '',
    Quantity: totalQuantity,
    UOM: '',
    LastPrice: 0,
    TotalValue: totalValue,
  })

  const dataRows = rows.map((row) => [
    row.RefNo,
    row.Name,
    row.Description,
    row.Quantity,
    row.UOM,
    row.LastPrice,
    row.TotalValue,
  ])

  const worksheetData = [
    ...headerInfo,
    [
      t('stockReportExcel.tableHeaders.refNo'),
      t('stockReportExcel.tableHeaders.name'),
      t('stockReportExcel.tableHeaders.description'),
      t('stockReportExcel.tableHeaders.quantity'),
      t('stockReportExcel.tableHeaders.uom'),
      t('stockReportExcel.tableHeaders.lastPrice'),
      t('stockReportExcel.tableHeaders.totalValue'),
    ],
    ...dataRows,
    [],
    [t('stockReportExcel.summary.title')],
    [t('stockReportExcel.summary.totalItems'), data.length],
    [t('stockReportExcel.summary.totalQuantity'), totalQuantity],
    [t('stockReportExcel.summary.totalValue'), totalValue],
  ]

  const ws = XLSX.utils.aoa_to_sheet(worksheetData)

  ws['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 35 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 15 },
  ]

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  for (let R = 0; R < 2; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      if (!ws[cellAddress]) continue
      if (!ws[cellAddress].s) ws[cellAddress].s = {}
      ws[cellAddress].s.font = { bold: true }
    }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, t('stockReportExcel.sheetName'))

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `Stock_Report_${Date.now()}.xlsx`)
}
