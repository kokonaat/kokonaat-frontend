import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useCustomers } from '../customers/customer-provider'
import { useCreateVendor, useUpdateVendor, useDeleteVendor } from '@/hooks/useVendor'
import VendorMutateDrawer from './VendorMutateDrawer'

const VendorDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useCustomers()
  const shopId = localStorage.getItem('shop-storage')
    ? JSON.parse(localStorage.getItem('shop-storage')!).state?.currentShopId
    : null

  const createMutation = useCreateVendor(shopId || '')
  const deleteMutation = useDeleteVendor(shopId || '')
  const updateMutation = useUpdateVendor(shopId || '')

  return (
    <>
      {/* Create modal */}
      <VendorMutateDrawer
        key='vendor-create'
        open={open === 'create'}
        onOpenChange={(val) => setOpen(val ? 'create' : null)}
        onSave={(data) => {
          if (!shopId) return
          createMutation.mutate(data, {
            onSuccess: () => {
              setOpen(null)
              toast.success("Vendor created successfully")
            },
            onError: (err: any) => {
              console.error(err)
            },
          })
        }}
      />

      {/* Update & Delete modals */}
      {currentRow && (
        <>
          {/* Update modal */}
          <VendorMutateDrawer
            key={`vendor-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(val: boolean) => setOpen(val ? 'update' : null)}
            currentRow={currentRow}
            onSave={(updatedData) => {
              if (!shopId || !currentRow) return
              updateMutation.mutate(
                { id: currentRow.id, data: updatedData },
                {
                  onSuccess: () => {
                    setOpen(null)
                    setCurrentRow(null)
                    toast.success("Vendor updated successfully")
                  },
                }
              )
            }}
          />

          {/* Delete modal */}
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
                    toast.success("The following vendor has been deleted")
                  },
                }
              )
            }}
            className='max-w-md'
            title={`Delete this vendor: ${currentRow.name} ?`}
            desc={
              <>
                You are about to delete a vendor with the name{' '}
                <strong>{currentRow.name}</strong>. <br />
                This action cannot be undone.
              </>
            }
            confirmText='Delete'
          />
        </>
      )}
    </>
  )
}

export default VendorDialogs