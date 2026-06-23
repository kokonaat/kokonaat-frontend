import type { TFunction } from 'i18next'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { StockTrackReportItem } from '@/interface/reportInterface'
import { formatGeneratedDate, formatReportPeriod, type ExportTFunction } from '@/utils/exportPdfHelpers'

export const generateStockTrackReportExcel = (
  t: TFunction<'export'>,
  data: StockTrackReportItem[],
  shopName: string,
  dateRange?: { from: string; to: string },
) => {
  const exportT = t as ExportTFunction

  const headerInfo = [
    [shopName.toUpperCase()],
    [t('stockTrackReportExcel.title')],
    [],
    [t('stockTrackReportExcel.labels.reportPeriod'), formatReportPeriod(exportT, dateRange)],
    [t('stockTrackReportExcel.labels.generatedOn'), formatGeneratedDate()],
    [],
  ]

  const rows = data.map((item) => ({
    Date: new Date(item.createdAt).toLocaleDateString(),
    Name: item.inventory.name,
    Price: Number(item.price),
    Total: Number(item.price),
  }))

  const totalStock = data.reduce((acc, item) => acc + Number(item.stock), 0)
  const totalAmount = data.reduce((acc, item) => acc + Number(item.price), 0)

  const summaryRows = [
    {},
    {
      Date: '',
      Name: '',
      Stock: totalStock,
      Price: '',
      Total: totalAmount,
    },
  ]

  const ws = XLSX.utils.aoa_to_sheet(headerInfo)

  XLSX.utils.sheet_add_json(ws, rows, { origin: -1, skipHeader: false })
  XLSX.utils.sheet_add_json(ws, summaryRows, { origin: -1, skipHeader: false })

  ws['!cols'] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
  ]

  const headerStyle = { font: { bold: true, sz: 14 } }
  const titleStyle = { font: { bold: true, sz: 12 } }

  if (ws['A1']) ws['A1'].s = headerStyle
  if (ws['A2']) ws['A2'].s = titleStyle

  const headerRowIndex = headerInfo.length
  const headers = [
    t('stockTrackReportExcel.tableHeaders.date'),
    t('stockTrackReportExcel.tableHeaders.name'),
    t('stockTrackReportExcel.tableHeaders.price'),
    t('stockTrackReportExcel.tableHeaders.total'),
  ]
  headers.forEach((header, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIndex })
    if (ws[cellRef]) ws[cellRef].v = header
  })

  const summaryRowIndex = headerInfo.length + rows.length + 2
  const summaryStyle = { font: { bold: true }, fill: { fgColor: { rgb: 'F1F5F9' } } }

  ;['A', 'B', 'C', 'D', 'E'].forEach((col) => {
    const cellRef = `${col}${summaryRowIndex}`
    if (ws[cellRef]) ws[cellRef].s = summaryStyle
  })

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, t('stockTrackReportExcel.sheetName'))

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `Stock_Track_Report_${Date.now()}.xlsx`)
}
