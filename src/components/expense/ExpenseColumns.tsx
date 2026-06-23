import { useMemo } from 'react'
import type { ExpenseItemInterface } from '@/interface/expenseInterface'
import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '../customers/DataTableColumnHeader'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { DataTableRowActions } from './DataTableRowActions'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export function useExpenseColumns(): ColumnDef<ExpenseItemInterface>[] {
    const { t } = useTranslation('expense')
    const { t: tEnums } = useTranslation('enums')

    return useMemo(() => [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && 'indeterminate')
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={t('table.columns.selectAll')}
                    className='translate-y-0.5'
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={t('table.columns.selectRow')}
                    className='translate-y-0.5'
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'title',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.title')} />,
        },
        {
            accessorKey: 'type',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.type')} />,
            cell: ({ row }) => tEnums(`expenseType.${row.original.type}`),
        },
        {
            accessorKey: 'amount',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.amount')} />,
            cell: ({ row }) => {
                const value = row.getValue<number>('amount')
                return <>{value}</>
            },
        },
        {
            accessorKey: 'remarks',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.remarks')} />,
            cell: ({ row }) => {
                const text = row.getValue<string>('remarks')
                if (!text) return null
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className='max-w-50 truncate cursor-help'>{text}</div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className='max-w-xs wrap-break-word'>{text}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            },
        },
        {
            id: 'open',
            header: '',
            cell: () => (
                <div className="flex justify-center">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            id: 'actions',
            cell: ({ row }) => <DataTableRowActions row={row} />,
        },
    ], [t, tEnums])
}
