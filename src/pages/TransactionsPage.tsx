import { Main } from "@/components/layout/main"
import { TransactionProvider } from "@/components/transactions/transaction-provider"
import TransactionDialogs from "@/components/transactions/TransactionDialogs"
import TransactionPrimaryButtons from "@/components/transactions/TransactionPrimaryButtons"
import TransactionTable from "@/components/transactions/TransactionTable"
import { useShopStore } from "@/stores/shopStore"

const TransactionsPage = () => {
  const shopId = useShopStore((s) => s.currentShopId)
  if (!shopId) return <div>No shop selected</div>

  return (
    <TransactionProvider>
      <Main>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Transactions Board</h2>
            <p className="text-muted-foreground">Here is a list of all your transactions</p>
          </div>
          <TransactionPrimaryButtons />
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <TransactionTable shopId={shopId} />
        </div>
      </Main>
      <TransactionDialogs />
    </TransactionProvider>
  )
}

export default TransactionsPage
