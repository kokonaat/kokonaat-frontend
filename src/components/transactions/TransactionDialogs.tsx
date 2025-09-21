import TransactionMutateDrawer from './TransactionMutateDrawer'
import { useTransactions } from './transaction-provider'

const TransactionDialogs = () => {
  const { open, setOpen } = useTransactions()

  return (
    <>
      {/* Create modal */}
      <TransactionMutateDrawer
        key='transaction-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />
    </>
  )
}

export default TransactionDialogs