import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { TeamSwitcher } from './team-switcher'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { sidebarData } from './data/sidebar-data'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-screen overflow-hidden">
        {/* ===== Sidebar ===== */}
        <AppSidebar>
          <SidebarHeader>
            <TeamSwitcher teams={sidebarData.teams} />
          </SidebarHeader>
          <SidebarContent className="overflow-y-auto">
            {sidebarData.navGroups.map((group) => (
              <NavGroup key={group.title} {...group} />
            ))}
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={sidebarData.user} />
          </SidebarFooter>
        </AppSidebar>

        {/* ===== Main Content ===== */}
        <main className="flex-1 min-w-0 h-full overflow-auto">
          {/* Use children if passed, otherwise render Outlet */}
          {children ?? <Outlet />}
        </main>
      </div>
    </SidebarProvider>
  )
}