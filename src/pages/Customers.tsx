import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { CustomersProvider } from '@/components/customers/customer-provider'
import { useCustomerList } from '@/hooks/useCustomer'
import { useShopStore } from '@/stores/shopStore'
import CustomerCreateButton from '@/components/customers/CustomerCreateButton'
import CustomerTable from '@/components/customers/CustomerTable'
import CustomersDialogs from '@/components/customers/CustomersDialogs'

const Customers = () => {
  const shopId = useShopStore((s) => s.currentShopId)
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10

  const { data, isLoading } = useCustomerList(shopId || "", pageIndex + 1, pageSize)

  return (
    <CustomersProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Customers</h2>
            <p className='text-muted-foreground'>
              Here is a list of your all Customers
            </p>
          </div>
          <CustomerCreateButton />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <p>Loading customers data...</p>
          ) : (
            <CustomerTable
              data={data?.customers || []}
              pageIndex={pageIndex}
              pageSize={pageSize}
              total={data?.total || 0}
              onPageChange={setPageIndex}
            />
          )}
        </div>
      </Main>
      <CustomersDialogs />
    </CustomersProvider>
  )
}

export default Customers