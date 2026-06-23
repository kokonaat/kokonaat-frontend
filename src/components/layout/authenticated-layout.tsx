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
import { LanguageSwitch } from '../language-switch'
import { ThemeSwitch } from '../theme-switch'
import { ConfigDrawer } from '../config-drawer'
import { ProfileDropdown } from '../profile-dropdown'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { useSidebarNav } from '@/hooks/useSidebarNav'
import { useTranslation } from '@/hooks/useTranslation'
import { useShopList } from '@/hooks/useShop'
import { Command, GalleryVerticalEnd, AudioWaveform } from 'lucide-react'
import type { AuthenticatedLayoutProps } from '@/interface/sidebarDataInerface'
import { useUserStore } from '@/stores/userStore'
import { useDrawerStore } from '@/stores/drawerStore'

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { data, isLoading, isError } = useShopList()
  const user = useUserStore((s) => s.user)
  const sidebarData = useSidebarNav()
  const { t } = useTranslation('common')

  // global drawer state apply blur while any drawer open to view
  const isAnyDrawerOpen = useDrawerStore((s) => s.isAnyDrawerOpen)

  // default icons to rotate for shops
  const icons = [Command, GalleryVerticalEnd, AudioWaveform]

  // build dynamic teams (shops from API)
  const dynamicTeams =
    data?.map((item, index) => ({
      id: item.shopId,
      name: item.shopName,
      logo: icons[index % icons.length],
    })) ?? []

  return (
    <SidebarProvider defaultOpen={true}>
      {/* wrapper for blur */}
      <div
        className={`relative flex h-screen w-screen overflow-hidden transition-all duration-300 
          ${isAnyDrawerOpen ? 'blur-sm pointer-events-none' : ''
          }`}
      >
        {/* sidebar */}
        <AppSidebar>
          <SidebarHeader>
            {isLoading && <p className="text-sm text-gray-500">{t('loading.shops')}</p>}
            {isError && <p className="text-sm text-red-500">{t('errors.loadShops')}</p>}
            {!isLoading && !isError && <TeamSwitcher teams={dynamicTeams} />}
          </SidebarHeader>

          <SidebarContent className="overflow-y-auto">
            {sidebarData.navGroups.map((group) => (
              <NavGroup key={group.title} {...group} />
            ))}
          </SidebarContent>

          <SidebarFooter>
            {user ? (
              <NavUser user={user} />
            ) : (
              <NavUser user={{ id: '', name: t('guest'), phone: '' }} />
            )}
          </SidebarFooter>
        </AppSidebar>

        {/* main content */}
        <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden relative z-0">
          {/* top header */}
          <Header>
            {/* search inside the blur wrapper */}
            <div className="relative z-0 w-full">
              <Search />
            </div>

            <div className="ms-auto flex items-center space-x-4">
              <LanguageSwitch />
              <ThemeSwitch />
              <ConfigDrawer />
              <ProfileDropdown />
            </div>
          </Header>

          {/* main content area */}
          <main className="flex-1 min-w-0 h-full overflow-auto">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}