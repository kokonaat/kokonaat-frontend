import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from '@/hooks/useTranslation'
import type { TransactionLedgerInterface } from '@/interface/transactionInterface'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

export function useTransactionLedgerColumns(): ColumnDef<TransactionLedgerInterface>[] {
  const { t } = useTranslation('customers')
  const { t: tTransactions } = useTranslation('transactions')
  const { t: tEnums } = useTranslation('enums')
  const notAvailable = tTransactions('table.columns.notAvailable')

  return useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('ledger.columns.id'),
        cell: ({ row }) => row.original.no,
      },
      {
        accessorKey: 'transactionType',
        header: t('ledger.columns.type'),
        cell: ({ row }) => {
          const type = row.original.transactionType
          return (
            <Badge
              variant={
                type === 'COMMISSION'
                  ? 'default'
                  : type === 'PAYMENT'
                    ? 'secondary'
                    : 'outline'
              }
            >
              {tEnums(`transactionType.${type}`)}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'remarks',
        header: t('ledger.columns.remarks'),
        cell: ({ row }) => {
          const text = (row.getValue('remarks') as string) || null
          return (
            <Tooltip>
              <TooltipTrigger>
                <div className='max-w-50 truncate'>{text ?? notAvailable}</div>
              </TooltipTrigger>
              <TooltipContent>
                <div className='max-w-sm wrap-break-word'>{text ?? notAvailable}</div>
              </TooltipContent>
            </Tooltip>
          )
        },
      },
      {
        accessorKey: 'amount',
        header: t('ledger.columns.amount'),
        cell: ({ row }) => {
          const amount = Number(row.original.totalAmount ?? 0)
          return `${amount.toLocaleString()}`
        },
      },
      {
        accessorKey: 'paid',
        header: t('ledger.columns.paid'),
        cell: ({ row }) => `${row.original.paid.toLocaleString()}`,
      },
      {
        accessorKey: 'pending',
        header: t('ledger.columns.pending'),
        cell: ({ row }) => `${row.original.pending.toLocaleString()}`,
      },
      {
        accessorKey: 'createdAt',
        header: t('ledger.columns.date'),
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt)

          const datePart = date.toLocaleDateString('en-GB')
          const timePart = date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })

          return (
            <div className="text-sm">
              <div>{datePart}</div>
              <div className="text-muted-foreground">{timePart}</div>
            </div>
          )
        },
      },
    ],
    [t, tEnums, notAvailable]
  )
}
