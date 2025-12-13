import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUom } from './uom-provider'
import type { UomInterface } from '@/interface/uomInterface'
import { uomSchema } from '@/schema/uomSchema'

type DataTableRowActionsProps<TData> = {
    row: Row<TData>
}

export function DataTableRowActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const parsed = uomSchema.parse(row.original)

    // Normalize description to match InventoryListItem type
    const uom: UomInterface = {
        ...parsed,
        description: parsed.description ?? undefined,
        shopId: parsed.shopId!, // assert that it's not undefined
    }

    const { setOpen, setCurrentRow } = useUom()

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='ghost'
                    onClick={(e) => e.stopPropagation()}
                    className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                >
                    <DotsHorizontalIcon className='h-4 w-4' />
                    <span className='sr-only'>Open menu</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' className='w-40'>
                {/* <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation()
                        setCurrentRow(uom)
                        setOpen('view')
                    }}
                >
                    View
                    <DropdownMenuShortcut><Eye size={16} /></DropdownMenuShortcut>
                </DropdownMenuItem> */}

                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation()
                        setCurrentRow(uom)
                        setOpen('update')
                    }}
                >
                    Edit
                    <DropdownMenuShortcut><Pencil size={16} /></DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation()
                        setCurrentRow(uom)
                        setOpen('delete')
                    }}
                >
                    Delete
                    <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}