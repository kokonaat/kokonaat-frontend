import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TasksProvider } from '../components/designation/tasks-provider'
import { useDesignationList } from '@/hooks/useDesignation'
import DesignationTable from '../components/designation/DesignationTable'
import DesignationDialogs from '@/components/designation/DesignationDialogs'
import DesignationPrimaryButtons from '@/components/designation/DesignationPrimaryButtons'

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

const Designation = () => {
  const shopId = getCurrentShopId()
  const { data, isLoading } = useDesignationList(shopId || "")

  return (
    <TasksProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Designations</h2>
            <p className='text-muted-foreground'>
              Here is a list of your all Designations
            </p>
          </div>
          <DesignationPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <p>Loading designations...</p>
          ) : (
            <DesignationTable data={data || []} />
          )}
        </div>
      </Main>
      <DesignationDialogs />
    </TasksProvider>
  )
}

export default Designation