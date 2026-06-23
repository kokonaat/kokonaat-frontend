import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useUom } from './uom-provider'
import UomMutateDrawer from './UomMutateDrawer'
import { useDeleteUom } from '@/hooks/useUom'
import { useShopStore } from '@/stores/shopStore'
import { useTranslation } from '@/hooks/useTranslation'

const UomDialogs = () => {
  const { t } = useTranslation('uom')
  const { t: tToast } = useTranslation('toast')
  const { open, setOpen, currentRow, setCurrentRow } = useUom()

  const shopId = useShopStore(s => s.currentShopId)!
  const deleteMutation = useDeleteUom(shopId)

  return (
    <>
      <UomMutateDrawer
        open={open === 'create'}
        onOpenChange={(val) => setOpen(val ? 'create' : null)}
        onSave={() => setOpen(null)}
      />

      {currentRow && (
        <>
          <UomMutateDrawer
            open={open === 'update'}
            onOpenChange={(val) => setOpen(val ? 'update' : null)}
            currentRow={{
              id: currentRow.id,
              name: currentRow.name,
              description: currentRow.description,
              shopId: currentRow.shopId,
            }}
            onSave={() => setOpen(null)}
          />

          <ConfirmDialog
            destructive
            open={open === 'delete'}
            onOpenChange={(val) => setOpen(val ? 'delete' : null)}
            handleConfirm={() => {
              if (!currentRow) return

              deleteMutation.mutate(
                { id: currentRow.id },
                {
                  onSuccess: () => {
                    setOpen(null)
                    setCurrentRow(null)
                    toast.success(tToast('uom.deleted'))
                  },
                }
              )
            }}
            title={t('deleteDialog.title', { name: currentRow.name })}
            desc={t('deleteDialog.description', { name: currentRow.name })}
            confirmText={t('deleteDialog.confirm')}
          />
        </>
      )}
    </>
  )
}

export default UomDialogs
