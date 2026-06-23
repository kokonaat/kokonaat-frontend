import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Link } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import type { Transaction } from '@/interface/transactionInterface'
import { Tooltip, TooltipContent } from '../ui/tooltip'
import { TooltipTrigger } from '@radix-ui/react-tooltip'
import { Badge } from '../ui/badge'
import { TransactionRowActions } from './TransactionRowActions'

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

export function useTransactionColumns(): ColumnDef<Transaction>[] {
  const { t } = useTranslation('transactions')
  const { t: tEnums } = useTranslation('enums')

  return useMemo(
    () => [
      {
        accessorKey: 'no',
        header: t('table.columns.no'),
      },
      {
        accessorKey: 'transactionType',
        header: t('table.columns.type'),
        cell: ({ row }) => {
          const type = row.original.transactionType
          return (
            <Badge
              variant="secondary"
              className={`font-medium ${getTransactionTypeColor(type)}`}
            >
              {tEnums(`transactionType.${type}`)}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'remarks',
        header: t('table.columns.remarks'),
        cell: ({ row }) => {
          const text = (row.getValue('remarks') as string) || null
          const notAvailable = t('table.columns.notAvailable')
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-50 truncate">{text ?? notAvailable}</div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-sm wrap-break-word">{text ?? notAvailable}</div>
              </TooltipContent>
            </Tooltip>
          )
        },
      },
      {
        id: 'partnerName',
        header: t('table.columns.partnerName'),
        cell: ({ row }) => {
          const data = row.original

          const handleLinkClick = (e: React.MouseEvent) => {
            e.stopPropagation()
          }

          if (data.vendor) {
            return (
              <Link
                to={`/transactions/ledger/vendor/${data.vendor.id}`}
                onClick={handleLinkClick}
                className="font-medium text-blue-600 hover:underline"
              >
                {data.vendor.name}
              </Link>
            )
          }

          if (data.customer) {
            return (
              <Link
                to={`/transactions/ledger/customer/${data.customer.id}`}
                onClick={handleLinkClick}
                className="font-medium text-blue-600 hover:underline"
              >
                {data.customer.name}
              </Link>
            )
          }
          return <span className="text-gray-500">{t('table.columns.emptyPartner')}</span>
        },
      },
      {
        id: 'amounts',
        header: t('table.columns.amounts'),
        cell: ({ row }) => {
          const data = row.original
          const total = data.totalAmount
          const paid = data.paid
          const pending = data.pending

          return (
            <div className="font-mono">
              {total.toFixed(2)} / {paid.toFixed(2)} / {pending.toFixed(2)}
            </div>
          )
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('table.columns.date'),
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt)
          return date.toLocaleDateString()
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <TransactionRowActions row={row} />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [t, tEnums]
  )
}
