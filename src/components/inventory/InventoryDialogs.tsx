import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import InventoryMutateDrawer from './InventoryMutateDrawer'
import InventoryViewDrawer from './InventoryViewDrawer'
import { useDeleteInventory } from '@/hooks/useInventory'
import { useInventory } from './inventory-provider'
import { useDrawerStore } from '@/stores/drawerStore'
import { useTranslation } from '@/hooks/useTranslation'

const InventoryDialogs = () => {
  const { t } = useTranslation('inventory')
  const { t: tToast } = useTranslation('toast')
  const { open, setOpen, currentRow, setCurrentRow } = useInventory()
  const shopId = localStorage.getItem('shop-storage')
    ? JSON.parse(localStorage.getItem('shop-storage')!).state?.currentShopId
    : null

  const deleteMutation = useDeleteInventory()
  const setDrawerOpen = useDrawerStore((s) => s.setDrawerOpen)

  return (
    <>
      <InventoryMutateDrawer
        key='inventory-create'
        open={open === 'create'}
        onOpenChange={(val) => setOpen(val ? 'create' : null)}
        onSave={() => setOpen(null)}
      />

      {currentRow && (
        <>
          <InventoryViewDrawer
            key={`inventory-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={(val: boolean) => {
              setOpen(val ? 'view' : null)
              setDrawerOpen(val)
            }}
            currentRow={currentRow}
          />

          <InventoryMutateDrawer
            key={`inventory-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(val: boolean) => setOpen(val ? 'update' : null)}
            currentRow={{
              ...currentRow,
              shopId: currentRow.shopId ?? shopId ?? '',
            }}
            onSave={() => setOpen(null)}
          />

          <ConfirmDialog
            key='inventory-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(val: boolean) => setOpen(val ? 'delete' : null)}
            handleConfirm={() => {
              if (!shopId || !currentRow) return
              deleteMutation.mutate(
                { id: currentRow.id },
                {
                  onSuccess: () => {
                    setOpen(null)
                    setCurrentRow(null)
                    toast.success(tToast('inventory.deleted'))
                  },
                }
              )
            }}
            className='max-w-md'
            title={t('deleteDialog.title', { name: currentRow.name })}
            desc={t('deleteDialog.description', { name: currentRow.name })}
            confirmText={t('deleteDialog.confirm')}
          />
        </>
      )}
    </>
  )
}

export default InventoryDialogs
