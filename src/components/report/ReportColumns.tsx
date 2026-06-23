import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import type {
  BalanceSheetTableItem,
  ExpenseReportItem,
  StockReportItem,
  StockTrackReportItem,
  TransactionLedgerDetailItem,
  TransactionReportItem,
} from '@/interface/reportInterface'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Badge } from '../ui/badge'
import { useTranslation } from '@/hooks/useTranslation'
import { formatExpenseType } from '@/utils/dashboardFormatters'

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

export function useLedgerReportColumns(): ColumnDef<TransactionLedgerDetailItem>[] {
  const { t } = useTranslation('reports')
  const { t: tEnums } = useTranslation('enums')

  return useMemo(
    () => [
      { accessorKey: 'transactionNo', header: t('ledgerColumns.refNo') },
      {
        accessorKey: 'createdAt',
        header: t('ledgerColumns.date'),
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: 'transactionType',
        header: t('ledgerColumns.type'),
        cell: ({ getValue }) => {
          const type = getValue() as string
          return (
            <Badge variant="secondary" className={`font-medium ${getTransactionTypeColor(type)}`}>
              {tEnums(`transactionType.${type}`)}
            </Badge>
          )
        },
      },
      { accessorKey: 'entityName', header: t('ledgerColumns.partyName') },
      { accessorKey: 'inventoryName', header: t('ledgerColumns.item') },
      { accessorKey: 'quantity', header: t('ledgerColumns.qty') },
      {
        accessorFn: (row) => row.unitOfMeasurement?.name ?? '',
        id: 'uom',
        header: t('ledgerColumns.uom'),
      },
      {
        accessorKey: 'price',
        header: t('ledgerColumns.price'),
        cell: ({ getValue }) => `${parseFloat(getValue() as string).toFixed(2)}`,
      },
      {
        accessorKey: 'total',
        header: t('ledgerColumns.total'),
        cell: ({ getValue }) => `${parseFloat(getValue() as string).toFixed(2)}`,
      },
      {
        accessorKey: 'paymentType',
        header: t('ledgerColumns.payment'),
        cell: ({ getValue }) => tEnums(`paymentType.${getValue() as string}`),
      },
    ],
    [t, tEnums],
  )
}

export function useTransactionReportColumns(): ColumnDef<TransactionReportItem>[] {
  const { t } = useTranslation('reports')
  const { t: tEnums } = useTranslation('enums')

  return useMemo(
    () => [
      {
        accessorKey: 'no',
        header: t('transactionReportColumns.transactionId'),
        cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
      },
      {
        accessorKey: 'createdAt',
        header: t('transactionReportColumns.date'),
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: 'transactionType',
        header: t('transactionReportColumns.type'),
        cell: ({ getValue }) => {
          const type = getValue() as string
          return (
            <Badge variant="secondary" className={`font-medium ${getTransactionTypeColor(type)}`}>
              {tEnums(`transactionType.${type}`)}
            </Badge>
          )
        },
      },
      {
        id: 'party',
        header: t('transactionReportColumns.customerVendor'),
        accessorFn: (row) => row.vendor?.name ?? row.customer?.name ?? t('common.notAvailable'),
      },
      {
        id: 'itemSummary',
        header: t('transactionReportColumns.items'),
        cell: ({ row }) => {
          const details = row.original.details || []
          const na = t('common.notAvailable')

          const fullText = details
            .map(
              (d) =>
                `${d.inventory?.name ?? na} (${d.quantity ?? na} ${d.unitOfMeasurement?.name ?? na})`,
            )
            .join(', ')

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="max-w-[250px] truncate text-xs text-muted-foreground cursor-help">
                    {fullText || na}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-md">
                  <p className="text-xs">{fullText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        },
      },
      {
        accessorKey: 'totalAmount',
        header: t('transactionReportColumns.amount'),
        cell: ({ getValue }) => `${Number(getValue()).toFixed(2)}`,
      },
      {
        accessorKey: 'paid',
        header: t('transactionReportColumns.paid'),
        cell: ({ getValue }) => (
          <span className="text-green-600">{Number(getValue()).toFixed(2)}</span>
        ),
      },
      {
        accessorKey: 'pending',
        header: t('transactionReportColumns.due'),
        cell: ({ getValue }) => (
          <span className={Number(getValue()) > 0 ? 'text-destructive font-bold' : ''}>
            {Number(getValue()).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'paymentType',
        header: t('transactionReportColumns.method'),
        cell: ({ getValue }) => tEnums(`paymentType.${getValue() as string}`),
      },
    ],
    [t, tEnums],
  )
}

export function useExpensesReportColumns(): ColumnDef<ExpenseReportItem>[] {
  const { t } = useTranslation('reports')
  const { t: tEnums } = useTranslation('enums')

  return useMemo(
    () => [
      { accessorKey: 'title', header: t('expenseReportColumns.title') },
      {
        accessorKey: 'type',
        header: t('expenseReportColumns.type'),
        cell: ({ getValue }) => formatExpenseType(getValue() as string, tEnums),
      },
      {
        accessorKey: 'amount',
        header: t('expenseReportColumns.amount'),
        cell: ({ getValue }) => `${Number(getValue()).toFixed(2)}`,
      },
      {
        accessorKey: 'remarks',
        header: t('expenseReportColumns.remarks'),
        cell: ({ getValue }) => (getValue() as string) || t('common.notAvailable'),
      },
      {
        accessorKey: 'createdAt',
        header: t('expenseReportColumns.date'),
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
    ],
    [t, tEnums],
  )
}

export function useStocksReportColumns(): ColumnDef<StockReportItem>[] {
  const { t } = useTranslation('reports')

  return useMemo(
    () => [
      { accessorKey: 'no', header: t('stockReportColumns.refNo') },
      { accessorKey: 'name', header: t('stockReportColumns.name') },
      {
        accessorKey: 'description',
        header: t('stockReportColumns.description'),
        cell: ({ getValue }) => (getValue() as string) || t('common.notAvailable'),
      },
      { accessorKey: 'quantity', header: t('stockReportColumns.quantity') },
      {
        accessorFn: (row) => row.unitOfMeasurement?.name ?? t('common.notAvailable'),
        id: 'unitOfMeasurement',
        header: t('stockReportColumns.uom'),
      },
      {
        accessorKey: 'lastPrice',
        header: t('stockReportColumns.lastPrice'),
        cell: ({ getValue }) => `${Number(getValue()).toFixed(2)}`,
      },
    ],
    [t],
  )
}

export function useStockTrackReportColumns(): ColumnDef<StockTrackReportItem>[] {
  const { t } = useTranslation('reports')
  const { t: tEnums } = useTranslation('enums')

  return useMemo(
    () => [
      {
        accessorKey: 'createdAt',
        header: t('stockTrackColumns.date'),
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: 'isPurchased',
        header: t('stockTrackColumns.type'),
        cell: ({ row }) => {
          const isPurchased = row.original.isPurchased
          const label = isPurchased ? 'PURCHASE' : 'SALE'

          return (
            <Badge variant="secondary" className={`font-medium ${getTransactionTypeColor(label)}`}>
              {tEnums(`stockTrackType.${label}`)}
            </Badge>
          )
        },
      },
      {
        id: 'inventory',
        header: t('stockTrackColumns.itemName'),
        accessorFn: (row) => row.inventory?.name ?? t('common.notAvailable'),
      },
      { accessorKey: 'stock', header: t('stockTrackColumns.stock') },
      {
        accessorKey: 'price',
        header: t('stockTrackColumns.price'),
        cell: ({ getValue }) => `${Number(getValue()).toFixed(2)}`,
      },
    ],
    [t, tEnums],
  )
}

export function useBalanceSheetReportColumns(): ColumnDef<BalanceSheetTableItem>[] {
  const { t } = useTranslation('reports')
  const { t: tEnums } = useTranslation('enums')
  const na = t('common.notAvailable')

  return useMemo(
    () => [
      {
        accessorKey: 'date',
        header: t('balanceSheet.columns.date'),
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: 'itemType',
        header: t('balanceSheet.columns.itemType'),
        cell: ({ getValue }) => {
          const type = getValue() as string
          return (
            <Badge
              variant="secondary"
              className={`font-medium ${
                type === 'transaction'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
              }`}
            >
              {type.toUpperCase()}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'no',
        header: t('balanceSheet.columns.refNo'),
        cell: ({ getValue }) => (getValue() as string) || na,
      },
      {
        id: 'type',
        header: t('balanceSheet.columns.type'),
        cell: ({ row }) => {
          const item = row.original
          if (item.itemType === 'transaction') {
            const type = item.transactionType || na
            return (
              <Badge variant="secondary" className={`font-medium ${getTransactionTypeColor(type)}`}>
                {tEnums(`transactionType.${type}`)}
              </Badge>
            )
          }
          return <span>{item.expenseType ? formatExpenseType(item.expenseType, tEnums) : na}</span>
        },
      },
      {
        id: 'description',
        header: t('balanceSheet.columns.description'),
        cell: ({ row }) => {
          const item = row.original
          if (item.itemType === 'transaction') {
            return item.customerName || item.vendorName || na
          }
          return item.expenseTitle || na
        },
      },
      {
        id: 'amount',
        header: t('balanceSheet.columns.amount'),
        cell: ({ row }) => {
          const item = row.original
          if (item.itemType === 'transaction') {
            return `${(item.totalAmount || 0).toFixed(2)}`
          }
          return `${(item.expenseAmount || 0).toFixed(2)}`
        },
      },
      {
        id: 'paid',
        header: t('balanceSheet.columns.paid'),
        cell: ({ row }) => {
          const item = row.original
          if (item.itemType === 'transaction' && item.paid !== undefined) {
            return <span className="text-green-600">{item.paid.toFixed(2)}</span>
          }
          return na
        },
      },
      {
        id: 'pending',
        header: t('balanceSheet.columns.pending'),
        cell: ({ row }) => {
          const item = row.original
          if (item.itemType === 'transaction' && item.pending !== undefined) {
            return (
              <span className={item.pending > 0 ? 'text-destructive font-bold' : ''}>
                {item.pending.toFixed(2)}
              </span>
            )
          }
          return na
        },
      },
      {
        accessorKey: 'paymentType',
        header: t('balanceSheet.columns.paymentMethod'),
        cell: ({ getValue }) => {
          const value = getValue() as string
          return value ? tEnums(`paymentType.${value}`) : na
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('balanceSheet.columns.createdAt'),
        cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
      },
    ],
    [t, tEnums, na],
  )
}
