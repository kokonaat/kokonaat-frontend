import { Outlet } from 'react-router-dom'
import {
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { TeamSwitcher } from './team-switcher'
import { Header } from './header'
import { Search } from '../search'
import { ThemeSwitch } from '../theme-switch'
import { ConfigDrawer } from '../config-drawer'
import { ProfileDropdown } from '../profile-dropdown'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { sidebarData as staticSidebarData } from '../../constance/sidebarContances'
import { useShopList } from '@/hooks/useShop'
import { Command, GalleryVerticalEnd, AudioWaveform } from 'lucide-react'
import type { AuthenticatedLayoutProps } from '@/interface/sidebarDataInerface'
import { useUserStore } from '@/stores/userStore'

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {

  const { data, isLoading, isError } = useShopList()

  const user = useUserStore((s) => s.user)

  // default icons to rotate for shops
  const icons = [Command, GalleryVerticalEnd, AudioWaveform]

  // build dynamic teams (shops from API)
  const dynamicTeams =
    data?.map((item, index) => ({
      id: item.shop.id,
      name: item.shop.name,
      logo: icons[index % icons.length],
    })) ?? []

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-screen overflow-hidden">
        {/* Sidebar */}
        <AppSidebar>
          <SidebarHeader>
            {isLoading && <p className="text-sm text-gray-500">Loading shops...</p>}
            {isError && <p className="text-sm text-red-500">Failed to load shops</p>}
            {!isLoading && !isError && (
              <TeamSwitcher teams={dynamicTeams} />
            )}
          </SidebarHeader>

          <SidebarContent className="overflow-y-auto">
            {staticSidebarData.navGroups.map((group) => (
              <NavGroup key={group.title} {...group} />
            ))}
          </SidebarContent>

          <SidebarFooter>
            {user ? (
              <NavUser user={user} />
            ) : (
              <NavUser user={{ id: '', name: 'Guest', phone: '' }} />
            )}
          </SidebarFooter>

        </AppSidebar>

        {/* Main Content */}
        <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
          {/* top header (now shared globally) */}
          <Header>
            <Search />
            <div className="ms-auto flex items-center space-x-4">
              <ThemeSwitch />
              <ConfigDrawer />
              <ProfileDropdown />
            </div>
          </Header>

          <main className="flex-1 min-w-0 h-full overflow-auto">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}