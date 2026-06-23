import { useMemo } from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "../customers/DataTableColumnHeader"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import type { UomInterface } from "@/interface/uomInterface"
import { DataTableRowActions } from "./DataTableRowActions"
import { useTranslation } from '@/hooks/useTranslation'

export function useUomColumns(): ColumnDef<UomInterface>[] {
    const { t } = useTranslation('uom')

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
            id: 'actions',
            cell: ({ row }) => <DataTableRowActions row={row} />,
        },
    ], [t])
}
