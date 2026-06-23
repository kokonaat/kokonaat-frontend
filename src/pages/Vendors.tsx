import { useCallback, useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { CustomersProvider } from '@/components/customers/customer-provider'
import { useVendorList } from '@/hooks/useVendor'
import { useShopStore } from '@/stores/shopStore'
import CustomerCreateButton from '@/components/customers/CustomerCreateButton'
import VendorTable from '@/components/vendors/VendorTable'
import VendorDialogs from '@/components/vendors/VendorDialogs'
import { useTranslation } from '@/hooks/useTranslation'

const Vendors = () => {
  const { t } = useTranslation('vendors')
  const shopId = useShopStore(s => s.currentShopId)
  const [pageIndex, setPageIndex] = useState(0)
  const [searchBy, setSearchBy] = useState('')
  
  const defaultDateRange = useMemo(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    return {
      from: thirtyDaysAgo,
      to: today
    }
  }, [])
  
  const [startDate, setStartDate] = useState<Date | undefined>(defaultDateRange.from)
  const [endDate, setEndDate] = useState<Date | undefined>(defaultDateRange.to)
  const pageSize = 10

  const handlePageChange = useCallback((index: number) => {
    setPageIndex(index)
  }, [])

  const handleSearchChange = useCallback((
    value?: string,
    from?: Date,
    to?: Date
  ) => {
    setSearchBy(value || '')
    setStartDate(from)
    setEndDate(to)
  }, [])

  const { data, isLoading, isError } = useVendorList(
    shopId || '',
    pageIndex + 1,
    pageSize,
    searchBy,
    startDate,
    endDate
  )

  if (isError) return <p>{t('page.errorLoading')}</p>

  const vendors = data?.data || []
  const total = data?.total || 0

  return (
    <CustomersProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{t('page.title')}</h2>
            <p className='text-muted-foreground'>{t('page.subtitle')}</p>
          </div>
          <CustomerCreateButton />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <p>{t('page.loading')}</p>
          ) : (
            <VendorTable
              data={vendors}
              pageIndex={pageIndex}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
              onSearchChange={handleSearchChange}
              initialDateRange={defaultDateRange}
            />
          )}
        </div>
      </Main>
      <VendorDialogs />
    </CustomersProvider>
  )
}

export default Vendors
