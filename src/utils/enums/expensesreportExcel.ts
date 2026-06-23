import type { TFunction } from 'i18next'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { ExpenseReportItem } from '@/interface/reportInterface'
import { formatGeneratedDate, formatReportPeriod, type ExportTFunction } from '@/utils/exportPdfHelpers'

export const generateExpenseReportExcel = (
  t: TFunction<'export'>,
  data: ExpenseReportItem[],
  shopName: string,
  dateRange?: { from: string; to: string },
) => {
  const na = t('common.fallbacks.notAvailable')
  const exportT = t as ExportTFunction

  const headerInfo = [
    [shopName.toUpperCase()],
    [t('expenseReportExcel.title')],
    [],
    [t('expenseReportExcel.labels.reportPeriod'), formatReportPeriod(exportT, dateRange)],
    [t('expenseReportExcel.labels.generatedOn'), formatGeneratedDate()],
    [],
  ]

  const rows = data.map((item) => ({
    Date: new Date(item.createdAt).toLocaleDateString(),
    Title: item.title,
    Type: item.type,
    Amount: Number(item.amount),
    Remarks: item.remarks || na,
  }))

  const totalExpenses = data.reduce((acc, item) => acc + Number(item.amount), 0)

  rows.push({
    Date: '',
    Title: '',
    Type: t('expenseReportExcel.totals.totalExpensesRow'),
    Amount: totalExpenses,
    Remarks: '',
  })

  const dataRows = rows.map((row) => [
    row.Date,
    row.Title,
    row.Type,
    row.Amount,
    row.Remarks,
  ])

  const worksheetData = [
    ...headerInfo,
    [
      t('expenseReportExcel.tableHeaders.date'),
      t('expenseReportExcel.tableHeaders.title'),
      t('expenseReportExcel.tableHeaders.type'),
      t('expenseReportExcel.tableHeaders.amount'),
      t('expenseReportExcel.tableHeaders.remarks'),
    ],
    ...dataRows,
  ]

  const ws = XLSX.utils.aoa_to_sheet(worksheetData)

  ws['!cols'] = [
    { wch: 12 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 40 },
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
  XLSX.utils.book_append_sheet(wb, ws, t('expenseReportExcel.sheetName'))

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
  saveAs(blob, `Expense_Report_${Date.now()}.xlsx`)
}
