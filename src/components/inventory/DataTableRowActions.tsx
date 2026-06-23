import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useInventory } from './inventory-provider'
import { inventorySchema } from '@/schema/inventorySchema'
import type { InventoryListItem } from '@/interface/inventoryInterface'
import { useTranslation } from '@/hooks/useTranslation'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { t } = useTranslation('inventory')
  const { t: tCommon } = useTranslation('common')
  const parsed = inventorySchema.parse(row.original)

  const inventory: InventoryListItem = {
    ...parsed,
    description: parsed.description ?? undefined,
  }

  const { setOpen, setCurrentRow } = useInventory()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          onClick={(e) => e.stopPropagation()}
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>{tCommon('actions.view')}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-40'>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            setCurrentRow(inventory)
            setOpen('view')
          }}
        >
          {tCommon('actions.view')}
          <DropdownMenuShortcut><Eye size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            setCurrentRow(inventory)
            setOpen('update')
          }}
        >
          {tCommon('actions.edit')}
          <DropdownMenuShortcut><Pencil size={16} /></DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            setCurrentRow(inventory)
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
