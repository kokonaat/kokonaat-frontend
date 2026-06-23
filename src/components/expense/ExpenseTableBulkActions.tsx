import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { BulkActionsToolbar } from '@/components/bulk-actions-toolbar'
import { useDeleteExpense } from '@/hooks/useExpense'
import { ConfirmDialog } from '../confirm-dialog'
import { useTranslation } from '@/hooks/useTranslation'

export interface DataTableBulkActionsProps<TData extends { id: string }> {
    table: Table<TData>
}

export function ExpenseTableBulkActions<TData extends { id: string }>({
    table,
}: DataTableBulkActionsProps<TData>) {
    const { t } = useTranslation('expense')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [rowsToDelete, setRowsToDelete] = useState<string[]>([])
    const deleteMutation = useDeleteExpense()

    const selectedRows = table.getSelectedRowModel().rows

    const handleBulkDeleteClick = () => {
        if (!selectedRows.length) return
        setRowsToDelete(selectedRows.map((r) => r.original.id))
        setShowDeleteConfirm(true)
    }

    const handleConfirmDelete = () => {
        rowsToDelete.forEach((id) => {
            deleteMutation.mutate(
                { id },
                {
                    onSuccess: () => {
                        table.resetRowSelection()
                    },
                }
            )
        })
        setShowDeleteConfirm(false)
    }

    return (
        <>
            <BulkActionsToolbar table={table} entityName='expense'>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='destructive'
                            size='icon'
                            onClick={handleBulkDeleteClick}
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
                title={t('bulkDelete.title', { count: rowsToDelete.length })}
                desc={t('bulkDelete.description', { count: rowsToDelete.length })}
                confirmText={t('buttons.delete')}
                handleConfirm={handleConfirmDelete}
            />
        </>
    )
}
