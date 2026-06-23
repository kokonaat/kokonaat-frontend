import { ConfirmDialog } from '@/components/confirm-dialog'
import { useCustomers } from './customer-provider'
import { useDeleteCustomer } from '@/hooks/useCustomer'
import CustomersMutateDrawer from "./CustomersMutateDrawer"
import CustomerViewDrawer from './CustomerViewDrawer'
import { useDrawerStore } from '@/stores/drawerStore'
import { useTranslation } from '@/hooks/useTranslation'

const CustomersDialogs = () => {
  const { t } = useTranslation('customers')
  const { open, setOpen, currentRow, setCurrentRow } = useCustomers()
  const shopId = localStorage.getItem('shop-storage')
    ? JSON.parse(localStorage.getItem('shop-storage')!).state?.currentShopId
    : null

  const deleteMutation = useDeleteCustomer(shopId || '')
  const setDrawerOpen = useDrawerStore((s) => s.setDrawerOpen)

  return (
    <>
      <CustomersMutateDrawer
        key='customer-create'
        open={open === 'create'}
        onOpenChange={(val) => setOpen(val ? 'create' : null)}
        onSave={() => setOpen(null)}
      />

      {currentRow && (
        <>
          <CustomerViewDrawer
            key={`customer-view-${currentRow.id}`}
            open={open === 'view'}
            onOpenChange={(val: boolean) => {
              setOpen(val ? 'view' : null)
              setDrawerOpen(val)
            }}
            currentRow={currentRow}
          />

          <CustomersMutateDrawer
            key={`customer-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(val: boolean) => setOpen(val ? 'update' : null)}
            currentRow={currentRow}
            onSave={() => setOpen(null)}
          />

          <ConfirmDialog
            key='customer-delete'
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

export default CustomersDialogs
