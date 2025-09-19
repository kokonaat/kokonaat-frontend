import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteDesignation, useUpdateDesignation } from '@/hooks/useDesignation'
import { useTransactions } from './transaction-provider'
import TransactionMutateDrawer from './TransactionMutateDrawer'

const TransactionDialogs = () => {
  const { open, setOpen, currentRow, setCurrentRow } = useTransactions()
  const shopId = localStorage.getItem('shop-storage')
    ? JSON.parse(localStorage.getItem('shop-storage')!).state?.currentShopId
    : null

  const deleteMutation = useDeleteDesignation(shopId || '')
  const updateMutation = useUpdateDesignation(shopId || '')

  return (
    <>
      {/* Create modal */}
      <TransactionMutateDrawer
        key='designation-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {/* Update & Delete modals */}
      {currentRow && (
        <>
          {/* Update modal */}
          <TransactionMutateDrawer
            key={`transaction-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={(val: boolean) => setOpen(val ? 'update' : null)}
            currentRow={currentRow}
            onSave={(updatedData: { title: string }) => {
              if (!shopId || !currentRow) return
              updateMutation.mutate(
                { id: currentRow.id, data: updatedData },
                {
                  onSuccess: () => {
                    setOpen(null)
                    setCurrentRow(null)
                  },
                }
              )
            }}
          />

          {/* Delete modal */}
          <ConfirmDialog
            key='transaction-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(val: boolean) => setOpen(val ? 'delete' : null)}
            handleConfirm={() => {
              if (!shopId || !currentRow) return
              deleteMutation.mutate(currentRow.id, {
                onSuccess: () => {
                  setOpen(null)
                  setCurrentRow(null)
                },
              })
            }}
            className='max-w-md'
            title={`Delete this transaction: ${currentRow.title} ?`}
            desc={
              <>
                You are about to delete a transaction with the Title{' '}
                <strong>{currentRow.title}</strong>. <br />
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

export default TransactionDialogs