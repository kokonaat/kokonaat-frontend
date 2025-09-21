import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { CustomersProvider } from '@/components/customers/customer-provider'
import { useVendorList } from '@/hooks/useVendor'
import { useShopStore } from '@/stores/shopStore'
import VendorTable from '@/components/vendors/VendorTable'
import VendorDialogs from '@/components/vendors/VendorDialogs'

const VendorTransactionsProfile = () => {
  const shopId = useShopStore(s => s.currentShopId)
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 10

  const { data, isLoading, isError } = useVendorList(shopId || '', pageIndex + 1, pageSize)

  if (isError) return <p>Error loading vendors.</p>

  const vendors = data?.data || []
  const total = data?.total || 0

  return (
    <CustomersProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Vendor's transactions profile</h2>
            <p className='text-muted-foreground'>Here is Vendor's transactions profile</p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <p>Loading vendors data...</p>
          ) : (
            <VendorTable
              data={vendors}
              pageIndex={pageIndex}
              pageSize={pageSize}
              total={total}
              onPageChange={setPageIndex}
            />
          )}
        </div>
      </Main>
      <VendorDialogs />
    </CustomersProvider>
  )
}

export default VendorTransactionsProfile