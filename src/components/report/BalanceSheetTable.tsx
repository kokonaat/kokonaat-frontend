import { useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { NoDataFound } from "@/components/NoDataFound"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"
import type { BalanceSheetDayItem, BalanceSheetItem } from "@/interface/reportInterface"
import { useTranslation } from "@/hooks/useTranslation"

interface BalanceSheetTableProps {
  data: BalanceSheetDayItem[]
  pageIndex: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onDownloadPdf: () => void
  onDownloadExcel?: () => void
  title?: string
}

const getTransactionTypeColor = (type: string) => {
  switch (type) {
    case 'PURCHASE':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'SALE':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'PAYMENT':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'RECEIVABLE':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'COMMISSION':
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }
}

export const BalanceSheetTable = ({
  data,
  pageIndex,
  pageSize,
  total,
  onPageChange,
  onDownloadPdf,
  onDownloadExcel,
  title,
}: BalanceSheetTableProps) => {
  const { t } = useTranslation('reports')
  const { t: tEnums } = useTranslation('enums')
  const na = t('common.notAvailable')

  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize
    const end = start + pageSize
    return data.slice(start, end)
  }, [data, pageIndex, pageSize])

  const pageCount = Math.ceil(total / pageSize)

  const handlePreviousPage = () => {
    if (pageIndex > 0) {
      onPageChange(pageIndex - 1)
    }
  }

  const handleNextPage = () => {
    if (pageIndex < pageCount - 1) {
      onPageChange(pageIndex + 1)
    }
  }

  const renderItem = (item: BalanceSheetItem, index: number) => {
    if (item.type === "transaction") {
      return (
        <TableRow key={`${item.id}-${index}`}>
          <TableCell className="text-center">{item.no || na}</TableCell>
          <TableCell>
            <Badge variant="secondary" className={`font-medium ${getTransactionTypeColor(item.transactionType)}`}>
              {tEnums(`transactionType.${item.transactionType}`)}
            </Badge>
          </TableCell>
          <TableCell>{item.customerName || item.vendorName || na}</TableCell>
          <TableCell className="text-right">{item.totalAmount.toFixed(2)}</TableCell>
          <TableCell className="text-right text-green-600">{item.paid.toFixed(2)}</TableCell>
          <TableCell className={`text-right ${item.pending > 0 ? "text-destructive font-bold" : ""}`}>
            {item.pending.toFixed(2)}
          </TableCell>
          <TableCell>{item.paymentType ? tEnums(`paymentType.${item.paymentType}`) : na}</TableCell>
          <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
        </TableRow>
      )
    }

    return (
      <TableRow key={`${item.id}-${index}`}>
        <TableCell className="text-center">{na}</TableCell>
        <TableCell>
          <Badge variant="secondary" className="font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            {t('balanceSheet.expenseBadge')}
          </Badge>
        </TableCell>
        <TableCell>{item.expenseTitle}</TableCell>
        <TableCell className="text-right">{item.expenseAmount.toFixed(2)}</TableCell>
        <TableCell className="text-right">{na}</TableCell>
        <TableCell className="text-right">{na}</TableCell>
        <TableCell>{na}</TableCell>
        <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
      </TableRow>
    )
  }

  return (
    <div className="space-y-4 mt-5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
        <div className="flex flex-col md:items-center gap-2">
          {onDownloadExcel && (
            <Button onClick={onDownloadExcel}>{t('tables.downloadExcel')}</Button>
          )}
          <Button onClick={onDownloadPdf} className="gap-2">
            <Download className="h-4 w-4" />
            {t('tables.downloadPdf')}
          </Button>
        </div>
      </div>

      {paginatedData.length === 0 ? (
        <Card className="m-4">
          <CardContent>
            <NoDataFound
              message={t('balanceSheet.emptyMessage')}
              details={t('balanceSheet.emptyDetails')}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {paginatedData.map((dayItem) => (
            <div key={dayItem.date} className="rounded-md border">
              <div className="bg-muted/50 px-4 py-3 border-b">
                <h3 className="text-lg font-semibold">
                  {new Date(dayItem.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">{t('balanceSheet.columns.refNo')}</TableHead>
                    <TableHead>{t('balanceSheet.columns.type')}</TableHead>
                    <TableHead>{t('balanceSheet.columns.description')}</TableHead>
                    <TableHead className="text-right">{t('balanceSheet.columns.amount')}</TableHead>
                    <TableHead className="text-right">{t('balanceSheet.columns.paid')}</TableHead>
                    <TableHead className="text-right">{t('balanceSheet.columns.pending')}</TableHead>
                    <TableHead>{t('balanceSheet.columns.paymentMethod')}</TableHead>
                    <TableHead>{t('balanceSheet.columns.createdAt')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dayItem.items.length > 0 ? (
                    dayItem.items.map((item, itemIndex) => renderItem(item, itemIndex))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        {t('balanceSheet.noItemsForDate')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="bg-muted/30 px-4 py-3 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t('balanceSheet.openingBalance')}</span>
                    <span className="ml-2 font-semibold">{dayItem.closingBalance.openingBalance.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-green-600">{t('balanceSheet.totalIn')}</span>
                    <span className="ml-2 font-semibold">{dayItem.closingBalance.totalInflow.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-red-600">{t('balanceSheet.totalOut')}</span>
                    <span className="ml-2 font-semibold">{dayItem.closingBalance.totalOutflow.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">{t('balanceSheet.closingBalance')}</span>
                    <span className="ml-2 font-semibold">{dayItem.closingBalance.closingBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {t('balanceSheet.paginationShowing', {
              from: pageIndex * pageSize + 1,
              to: Math.min((pageIndex + 1) * pageSize, total),
              total,
            })}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={pageIndex === 0}
            >
              {t('balanceSheet.previous')}
            </Button>
            <div className="text-sm">
              {t('balanceSheet.pageOf', { current: pageIndex + 1, total: pageCount })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={pageIndex >= pageCount - 1}
            >
              {t('balanceSheet.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
