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
import { ConfirmDialog } from '../confirm-dialog'
import { useShopStore } from '@/stores/shopStore'
import { useDeleteCustomer } from '@/hooks/useCustomer'
import { useTranslation } from '@/hooks/useTranslation'

export interface DataTableBulkActionsProps<TData extends { id: string }> {
    table: Table<TData>
}

export function DataTableBulkActions<TData extends { id: string }>({
    table,
}: DataTableBulkActionsProps<TData>) {
    const { t } = useTranslation('customers')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const shopId = useShopStore((s) => s.currentShopId)
    const deleteMutation = useDeleteCustomer(shopId || '')

    const selectedRows = table.getSelectedRowModel().rows

    const handleDelete = () => {
        if (!selectedRows.length) return

        const ids = selectedRows.map((r) => r.original.id)

        ids.forEach((id) => {
            deleteMutation.mutate({ id }, {
                onSuccess: () => {
                    table.resetRowSelection()
                },
            })
        })

        setShowDeleteConfirm(false)
    }

    return (
        <>
            <BulkActionsToolbar table={table} entityName='customer'>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='destructive'
                            size='icon'
                            onClick={() => setShowDeleteConfirm(true)}
                            className='size-8'
                            aria-label={t('bulkDelete.deleteSelected')}
                            title={t('bulkDelete.deleteSelected')}
                        >
                            <Trash2 />
                            <span className='sr-only'>{t('bulkDelete.deleteSelected')}</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{t('bulkDelete.deleteSelected')}</p>
                    </TooltipContent>
                </Tooltip>
            </BulkActionsToolbar>

            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                destructive
                title={t('bulkDelete.title', { count: selectedRows.length })}
                desc={t('bulkDelete.description', { count: selectedRows.length })}
                confirmText={t('buttons.delete')}
                handleConfirm={handleDelete}
            />
        </>
    )
}
