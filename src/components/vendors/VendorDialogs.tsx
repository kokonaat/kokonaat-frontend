import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useCustomers } from '../customers/customer-provider'
import { useDeleteVendor } from '@/hooks/useVendor'
import VendorMutateDrawer from './VendorMutateDrawer'
import VendorViewDrawer from './VendorViewDrawer'
import { useDrawerStore } from '@/stores/drawerStore'
import { useTranslation } from '@/hooks/useTranslation'

const VendorDialogs = () => {
  const { t } = useTranslation('vendors')
  const { t: tToast } = useTranslation('toast')
  const { open, setOpen, currentRow, setCurrentRow } = useCustomers()
  const shopId = localStorage.getItem('shop-storage')
    ? JSON.parse(localStorage.getItem('shop-storage')!).state?.currentShopId
    : null

  const deleteMutation = useDeleteVendor(shopId || '')
  const setDrawerOpen = useDrawerStore((s) => s.setDrawerOpen)

  return (
    <>
      <VendorMutateDrawer
        key='vendor-create'
        open={open === 'create'}
        onOpenChange={(val) => setOpen(val ? 'create' : null)}
        onSave={() => setOpen(null)}
      />

      {currentRow && (
        <>
          <VendorViewDrawer
            key={`vendor-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={(val: boolean) => {
              setOpen(val ? 'view' : null)
              setDrawerOpen(val)
            }}
            currentRow={currentRow}
          />

          <VendorMutateDrawer
            key={`vendor-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(val: boolean) => setOpen(val ? 'update' : null)}
            currentRow={currentRow}
            onSave={() => setOpen(null)}
          />

          <ConfirmDialog
            key='vendor-delete'
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
                    toast.success(tToast('vendor.deleted'))
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

export default VendorDialogs
