import { showSubmittedData } from '@/utils/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useCustomers } from './customer-provider'
import { useDeleteCustomer, useUpdateCustomer, useCreateCustomer } from '@/hooks/useCustomer'
import CustomersMutateDrawer from "./CustomersMutateDrawer"

const CustomersDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useCustomers()
  const shopId = localStorage.getItem('shop-storage')
    ? JSON.parse(localStorage.getItem('shop-storage')!).state?.currentShopId
    : null

  const createMutation = useCreateCustomer(shopId || '')
  const deleteMutation = useDeleteCustomer(shopId || '')
  const updateMutation = useUpdateCustomer(shopId || '')

  return (
    <>
      {/* Create modal */}
      <CustomersMutateDrawer
        key='customer-create'
        open={open === 'create'}
        onOpenChange={(val) => setOpen(val ? 'create' : null)}
        onSave={(data) => {
          if (!shopId) return
          createMutation.mutate(data, {
            onSuccess: () => {
              showSubmittedData(data, 'Customer created successfully:')
              setOpen(null)
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
          <CustomersMutateDrawer
            key={`customer-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(val: boolean) => setOpen(val ? 'update' : null)}
            currentRow={currentRow}
            onSave={(updatedData) => {
              if (!shopId || !currentRow) return
              updateMutation.mutate(
                { id: currentRow.id, data: updatedData },
                {
                  onSuccess: () => {
                    showSubmittedData(updatedData, 'Customer updated successfully:')
                    setOpen(null)
                    setCurrentRow(null)
                  },
                }
              )
            }}
          />

          {/* Delete modal */}
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
                    showSubmittedData(currentRow, 'The following customer has been deleted:')
                    setOpen(null)
                    setCurrentRow(null)
                  },
                }
              )
            }}
            className='max-w-md'
            title={`Delete this customer: ${currentRow.name} ?`}
            desc={
              <>
                You are about to delete a customer with the name{' '}
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

export default CustomersDialogs