import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { BulkActionsToolbar } from '@/components/bulk-actions-toolbar'
import { VendorMultiDeleteDialog } from './VendorMultiDeleteDialogs'

export interface DataTableBulkActionsProps<TData extends { id: string }> {
  table: Table<TData>
}

export function VendorTableBulkActions<TData extends { id: string }>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  return (
    <>
      <BulkActionsToolbar table={table} entityName='vendor'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected Vendors'
              title='Delete selected Vendors'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected Vendors</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected Vendors</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <VendorMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  )
}