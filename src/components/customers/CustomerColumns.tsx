import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { DataTableRowActions } from './DataTableRowActions'
import type { CustomerListInterface } from '@/interface/customerInterface'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { ChevronRight } from 'lucide-react'
import { CustomerLedgerDownload } from './CustomerLedgerDownload'
import { useTranslation } from '@/hooks/useTranslation'

export function useCustomerColumns(): ColumnDef<CustomerListInterface>[] {
  const { t } = useTranslation('customers')

  return useMemo(
    () => [
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
        accessorKey: 'no',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.columns.id')} />
        ),
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.columns.name')} />
        ),
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.columns.email')} />
        ),
      },
      {
        accessorKey: 'phone',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.columns.phone')} />
        ),
      },
      {
        accessorKey: 'address',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.columns.address')} />
        ),
        cell: ({ row }) => {
          const address = row.getValue<string>('address')
          if (!address) return null

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="max-w-50 truncate cursor-help">
                    {address}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs wrap-break-word">{address}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        },
      },
      {
        accessorKey: 'city',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.columns.city')} />
        ),
      },
      {
        accessorKey: 'country',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.columns.country')} />
        ),
      },
      {
        accessorKey: 'isB2B',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.columns.isB2B')} />
        ),
      },
      {
        accessorKey: 'contactPerson',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.columns.contactPerson')} />
        ),
      },
      {
        accessorKey: 'contactPersonPhone',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.columns.contactPersonPhone')} />
        ),
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
        id: 'ledger',
        header: '',
        cell: ({ row }) => (
          <CustomerLedgerDownload customer={row.original} />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} />,
      },
    ],
    [t]
  )
}
