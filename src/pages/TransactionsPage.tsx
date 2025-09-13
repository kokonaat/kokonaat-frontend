import { ConfigDrawer } from "@/components/config-drawer"
import { Header } from "@/components/layout/header"
import { Main } from "@/components/layout/main"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { TasksProvider } from "@/components/transactions/tasks-provider"

const TransactionsPage = () => {
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
            <h2 className='text-2xl font-bold tracking-tight'>Transactions Board</h2>
            <p className='text-muted-foreground'>
              Here is a list of your all Transactions
            </p>
          </div>
        </div>
      </Main>
    </TasksProvider>
  )
}

export default TransactionsPage