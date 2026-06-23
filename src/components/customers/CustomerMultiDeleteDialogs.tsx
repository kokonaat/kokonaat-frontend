import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import type { Table } from '@tanstack/react-table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteCustomer } from '@/hooks/useCustomer'
import { useTranslation } from '@/hooks/useTranslation'

export interface CustomerMultiDeleteDialogProps<TData extends { id: string }> {
    open: boolean
    onOpenChange: (open: boolean) => void
    table: Table<TData>
}

const CONFIRM_WORD = 'DELETE'

export function CustomersMultiDeleteDialog<TData extends { id: string }>({
  open,
  onOpenChange,
  table,
}: CustomerMultiDeleteDialogProps<TData>) {
  const { t } = useTranslation('customers')
  const { t: tToast } = useTranslation('toast')
  const [value, setValue] = useState('')

  const shopId = localStorage.getItem('shop-storage')
    ? JSON.parse(localStorage.getItem('shop-storage')!).state?.currentShopId
    : null

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const deleteMutation = useDeleteCustomer(shopId)

  const entityLabel =
    selectedRows.length > 1
      ? t('bulkDelete.multiEntityPlural')
      : t('bulkDelete.multiEntitySingular')

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(tToast('common.typeDeleteToConfirm'))
      return
    }

    onOpenChange(false)

    toast.promise(
      Promise.all(
        selectedRows.map((row) =>
          deleteMutation.mutateAsync({ id: row.original.id })
        )
      ),
      {
        loading: t('bulkDelete.loading'),
        success: () => {
          table.resetRowSelection()
          return t('bulkDelete.success', { count: selectedRows.length, entity: entityLabel })
        },
        error: t('bulkDelete.error'),
      }
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          {t('bulkDelete.multiTitle', { count: selectedRows.length, entity: entityLabel })}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>{t('bulkDelete.multiDescription')}</p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>{t('bulkDelete.confirmTyping')}</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('bulkDelete.confirmPlaceholder')}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>{t('bulkDelete.warningTitle')}</AlertTitle>
            <AlertDescription>
              {t('bulkDelete.warningDescription')}
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t('buttons.delete')}
      destructive
    />
  )
}
