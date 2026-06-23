import type { TFunction } from 'i18next'

export enum ReportType {
  CUSTOMER_LEDGER = 'CUSTOMER_LEDGER',
  VENDOR_LEDGER = 'VENDOR_LEDGER',
  TRANSACTION_REPORT = 'TRANSACTION_REPORT',
  STOCK_REPORT = 'STOCK_REPORT',
  STOCK_TRACK_REPORT = 'STOCK_TRACK_REPORT',
  EXPENSE_REPORT = 'EXPENSE_REPORT',
  BALANCE_SHEET = 'BALANCE_SHEET',
}

export const getReportTypeLabel = (
  t: TFunction<'export'>,
  reportType: ReportType,
): string => {
  const labels: Record<ReportType, string> = {
    [ReportType.CUSTOMER_LEDGER]: t('reportTypes.customerLedger'),
    [ReportType.VENDOR_LEDGER]: t('reportTypes.vendorLedger'),
    [ReportType.TRANSACTION_REPORT]: t('reportTypes.transactionReport'),
    [ReportType.STOCK_REPORT]: t('reportTypes.stockReport'),
    [ReportType.STOCK_TRACK_REPORT]: t('reportTypes.stockTrackReport'),
    [ReportType.EXPENSE_REPORT]: t('reportTypes.expenseReport'),
    [ReportType.BALANCE_SHEET]: t('reportTypes.balanceSheet'),
  }
  return labels[reportType]
}
