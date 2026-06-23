import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { VendorTransactionInterface } from '@/interface/vendorInterface'
import { useTranslation } from '@/hooks/useTranslation'

export function useCustomerTransactionColumns(): ColumnDef<VendorTransactionInterface>[] {
  const { t } = useTranslation('vendors')
  const { t: tEnums } = useTranslation('enums')

  return useMemo(
    () => [
      {
        accessorKey: 'no',
        header: t('transactions.columns.no'),
      },
      {
        accessorKey: 'transactionType',
        header: t('transactions.columns.type'),
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
        accessorKey: 'transactionStatus',
        header: t('transactions.columns.status'),
        cell: ({ row }) => {
          const status = row.original.transactionStatus
          return (
            <Badge variant={status === 'PAID' ? 'default' : 'destructive'}>
              {status}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'amount',
        header: t('transactions.columns.amount'),
        cell: ({ row }) => `${row.original.amount}`,
      },
      {
        accessorKey: 'paid',
        header: t('transactions.columns.paid'),
        cell: ({ row }) => `${row.original.paid}`,
      },
      {
        accessorKey: 'pending',
        header: t('transactions.columns.pending'),
        cell: ({ row }) => `${row.original.pending}`,
      },
      {
        accessorKey: 'remarks',
        header: t('transactions.columns.remarks'),
      },
      {
        accessorKey: 'createdAt',
        header: t('transactions.columns.date'),
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
      },
    ],
    [t, tEnums]
  )
}
