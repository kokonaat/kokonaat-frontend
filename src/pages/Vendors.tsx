import { Main } from '@/components/layout/main'
import { CustomersProvider } from '@/components/customers/customer-provider'
import CustomerCreateButton from '@/components/customers/CustomerCreateButton'
import { Search } from '@/components/search'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import VendorTable from '@/components/vendors/VendorTable'
import VendorDialogs from '@/components/vendors/VendorDialogs'
import { useVendorList } from '@/hooks/useVendor'

// get and parsed shopId from ls
const getCurrentShopId = (): string | null => {
  const lsData = localStorage.getItem("shop-storage")
  if (!lsData) return null
  try {
    const parsed = JSON.parse(lsData)
    return parsed.state?.currentShopId || null
  } catch {
    return null
  }
}

const Vendors = () => {
  const shopId = getCurrentShopId()
  const { data, isLoading } = useVendorList(shopId || "")

  return (
    <CustomersProvider>
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Vendors</h2>
            <p className='text-muted-foreground'>
              Here is a list of your all Vendors
            </p>
          </div>
          <CustomerCreateButton />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <p>Loading vendors data...</p>
          ) : (
            <VendorTable data={data || []} />
          )}
        </div>
      </Main>
      <VendorDialogs />
    </CustomersProvider>
  )
}

export default Vendors