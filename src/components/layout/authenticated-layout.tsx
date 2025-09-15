import { Outlet } from 'react-router-dom'
import {
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { TeamSwitcher } from './team-switcher'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { sidebarData as staticSidebarData } from './data/sidebar-data'
import { useShopList } from '@/hooks/useShop'
import { Command, GalleryVerticalEnd, AudioWaveform } from 'lucide-react'
import { AuthenticatedLayoutProps } from '@/interface/sidebarDataInerface'

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {

  const { data, isLoading, isError } = useShopList()

  // default icons to rotate for shops
  const icons = [Command, GalleryVerticalEnd, AudioWaveform]

  // build dynamic teams (shops from API)
  const dynamicTeams =
    data?.shops?.map((shop, index) => ({
      id: shop.id ?? "",
      name: shop.name,
      logo: icons[index % icons.length],
    })) ?? []

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-screen overflow-hidden">
        {/* ===== Sidebar ===== */}
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
            <NavUser user={staticSidebarData.user} />
          </SidebarFooter>
        </AppSidebar>

        {/* ===== Main Content ===== */}
        <main className="flex-1 min-w-0 h-full overflow-auto">
          {children ?? <Outlet />}
        </main>
      </div>
    </SidebarProvider>
  )
}