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
import { useTranslation } from '@/hooks/useTranslation'

type DataTableRowActionsProps<TData> = {
    row: Row<TData>
}

export function DataTableRowActions<TData>({
    row,
}: DataTableRowActionsProps<TData>) {
    const { t } = useTranslation('uom')
    const parsed = uomSchema.parse(row.original)

    const uom: UomInterface = {
        ...parsed,
        description: parsed.description ?? undefined,
        shopId: parsed.shopId!,
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
                    <span className='sr-only'>{t('buttons.edit')}</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' className='w-40'>
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation()
                        setCurrentRow(uom)
                        setOpen('update')
                    }}
                >
                    {t('buttons.edit')}
                    <DropdownMenuShortcut><Pencil size={16} /></DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation()
                        setCurrentRow(uom)
                        setOpen('delete')
                    }}
                >
                    {t('buttons.delete')}
                    <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
