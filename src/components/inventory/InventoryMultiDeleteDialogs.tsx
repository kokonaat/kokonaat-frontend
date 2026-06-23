import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { VendorMultiDeleteDialogProps } from '@/interface/vendorInterface'
import { useDeleteInventory } from '@/hooks/useInventory'
import { useTranslation } from '@/hooks/useTranslation'

const CONFIRM_WORD = 'DELETE'

export function InventoryMultiDeleteDialog<TData extends { id: string }>({
  open,
  onOpenChange,
  table,
}: VendorMultiDeleteDialogProps<TData>) {
  const { t } = useTranslation('inventory')
  const { t: tCommon } = useTranslation('common')
  const { t: tToast } = useTranslation('toast')
  const [value, setValue] = useState('')

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const deleteMutation = useDeleteInventory()
  const entityLabel = t('page.title')

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
        loading: tToast('common.bulkDeleteLoading', { entity: entityLabel }),
        success: () => {
          table.resetRowSelection()
          return tToast('common.bulkDeleteSuccess', {
            count: selectedRows.length,
            entity: entityLabel,
          })
        },
        error: tToast('common.bulkDeleteError', { entity: entityLabel }),
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
          {t('bulkDelete.title', { count: selectedRows.length })}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>{t('bulkDelete.description', { count: selectedRows.length })}</p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>{tCommon('dialog.confirmByTyping', { word: CONFIRM_WORD })}</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={tCommon('dialog.typeToConfirm')}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>{tCommon('dialog.warningTitle')}</AlertTitle>
            <AlertDescription>
              {tCommon('dialog.warningDesc')}
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t('buttons.delete')}
      destructive
    />
  )
}
