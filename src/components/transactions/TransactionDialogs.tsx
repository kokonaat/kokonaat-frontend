import TransactionMutateDrawer from './TransactionMutateDrawer'
import TransactionPaymentDrawer from './TransactionPaymentDrawer'
import { useTransactions } from './transaction-provider'

const TransactionDialogs = () => {
  const { open, setOpen, currentRow, recordPaymentMode, setRecordPaymentMode } =
    useTransactions()

  return (
    <>
      <TransactionMutateDrawer
        key="transaction-create"
        open={open === 'create'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'create' : null)}
      />

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
    </>
  )
}

export default TransactionDialogs
