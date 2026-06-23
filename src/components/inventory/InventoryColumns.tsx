import { useMemo } from 'react'
import type { InventoryItemInterface } from "@/interface/inventoryInterface"
import { type ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "../customers/DataTableColumnHeader"
import { DataTableRowActions } from "./DataTableRowActions"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { ChevronRight } from "lucide-react"
import { useTranslation } from '@/hooks/useTranslation'

export function useInventoryColumns(): ColumnDef<InventoryItemInterface>[] {
    const { t } = useTranslation('inventory')

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
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.name')} />,
        },
        {
            accessorKey: 'description',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.description')} />,
            cell: ({ row }) => {
                const text = row.getValue<string>('description')
                if (!text) return null

                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="max-w-50 truncate cursor-help">
                                    {text}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs wrap-break-word">{text}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            }
        },
        {
            accessorKey: 'quantity',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.quantity')} />,
        },
        {
            accessorFn: (row) => row.unitOfMeasurement?.name ?? t('viewDrawer.notAvailable'),
            id: 'unitOfMeasurement',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.uom')} />,
        },
        {
            accessorKey: 'lastPrice',
            header: ({ column }) => <DataTableColumnHeader column={column} title={t('table.columns.lastPrice')} />,
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
    ], [t])
}
