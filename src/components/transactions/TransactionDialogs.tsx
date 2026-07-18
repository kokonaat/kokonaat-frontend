import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import TransactionMutateDrawer from './TransactionMutateDrawer'
import TransactionPaymentDrawer from './TransactionPaymentDrawer'
import { useTransactions } from './transaction-provider'
import { useDeleteTransaction } from '@/hooks/useTransaction'
import { useShopStore } from '@/stores/shopStore'
import { useTranslation } from '@/hooks/useTranslation'

const TransactionDialogs = () => {
  const { t } = useTranslation('transactions')
  const { t: tToast } = useTranslation('toast')
  const { open, setOpen, currentRow, setCurrentRow, recordPaymentMode, setRecordPaymentMode } =
    useTransactions()

  const shopId = useShopStore((s) => s.currentShopId)
  const deleteMutation = useDeleteTransaction(shopId ?? '')

  return (
    <>
      <TransactionMutateDrawer
        key="transaction-create"
        open={open === 'create'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'create' : null)}
      />

      {currentRow && (
        <TransactionMutateDrawer
          key={`transaction-update-${currentRow.id}`}
          open={open === 'update'}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setOpen(null)
              setCurrentRow(null)
            }
          }}
          currentRow={currentRow}
        />
      )}

      <TransactionPaymentDrawer
        open={open === 'recordPayment'}
        mode={recordPaymentMode}
        sourceTransaction={currentRow}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setRecordPaymentMode(null)
            setOpen(null)
          }
        }}
      />

      {currentRow && (
        <ConfirmDialog
          key="transaction-delete"
          destructive
          open={open === 'delete'}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setOpen(null)
              setCurrentRow(null)
            }
          }}
          handleConfirm={() => {
            deleteMutation.mutate(currentRow.id, {
              onSuccess: () => {
                setOpen(null)
                setCurrentRow(null)
                toast.success(tToast('transaction.deleted'))
              },
            })
          }}
          className="max-w-md"
          title={t('deleteDialog.title')}
          desc={t('deleteDialog.description', { no: currentRow.no })}
          confirmText={t('deleteDialog.confirm')}
        />
      )}
    </>
  )
}

export default TransactionDialogs
