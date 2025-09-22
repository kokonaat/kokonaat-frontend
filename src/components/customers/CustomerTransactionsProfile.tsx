import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { CustomersProvider } from '@/components/customers/customer-provider'
import { useCustomerList } from '@/hooks/useCustomer'
import { useShopStore } from '@/stores/shopStore'
import CustomerTable from '@/components/customers/CustomerTable'
import CustomersDialogs from '@/components/customers/CustomersDialogs'

const CustomerTransactionsProfile = () => {
  const shopId = useShopStore((s) => s.currentShopId)
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10

  const { data, isLoading, isError } = useCustomerList(shopId || '', pageIndex + 1, pageSize)

  if (isError) return <p>Error loading customers.</p>

  const customers = data?.customers || []
  const total = data?.total || 0

  return (
    <CustomersProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Customer's transactions profile</h2>
            <p className='text-muted-foreground'>
              Here is Customer's transactions profile
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <p>Loading customers data...</p>
          ) : (
            <CustomerTable
              data={customers}
              pageIndex={pageIndex}
              pageSize={pageSize}
              total={total}
              onPageChange={setPageIndex}
            />
          )}
        </div>
      </Main>
      <CustomersDialogs />
    </CustomersProvider>
  )
}

export default CustomerTransactionsProfile