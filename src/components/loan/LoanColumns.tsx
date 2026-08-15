import { useMemo } from 'react'
import type { LoanItemInterface } from '@/interface/loanInterface'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '../customers/DataTableColumnHeader'
import { LoanRowActions } from './LoanRowActions'
import { useTranslation } from '@/hooks/useTranslation'
import { fmtAmount } from '@/lib/utils'

export function useLoanColumns(): ColumnDef<LoanItemInterface>[] {
    const { t } = useTranslation('loans')

    return useMemo(() => [
        {
            accessorKey: 'no',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.no')} />,
            cell: ({ row }) => (
                <span className='text-xs text-muted-foreground font-mono'>{row.original.no}</span>
            ),
        },
        {
            accessorKey: 'loanFrom',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.loanFrom')} />,
        },
        {
            accessorKey: 'purpose',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.purpose')} />,
            cell: ({ row }) => row.original.purpose || <span className='text-muted-foreground'>—</span>,
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.amount')} />,
            cell: ({ row }) => (
                <span className='font-medium tabular-nums'>{fmtAmount(row.original.amount, { min: 2 })}</span>
            ),
        },
        {
            accessorKey: 'paid',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.paid')} />,
            cell: ({ row }) => (
                <span className='tabular-nums text-green-600'>{fmtAmount(row.original.paid, { min: 2 })}</span>
            ),
        },
        {
            accessorKey: 'pending',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.pending')} />,
            cell: ({ row }) => {
                const pending = Number(row.original.pending)
                return (
                    <span className={`tabular-nums font-medium ${pending > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                        {fmtAmount(pending, { min: 2 })}
                    </span>
                )
            },
        },
        {
            accessorKey: 'createdAt',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.date')} />,
            cell: ({ row }) => (
                <span className='text-sm text-muted-foreground'>
                    {new Date(row.original.createdAt).toLocaleDateString()}
                </span>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => <LoanRowActions row={row} />,
        },
    ], [t])
}
