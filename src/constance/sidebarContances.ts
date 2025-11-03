import {
  LayoutDashboard,
  Monitor,
  HelpCircle,
  Bell,
  Package,
  Palette,
  Settings,
  Wrench,
  UserCog,
  Users,
  ShoppingBag,
  UsersRound,
} from 'lucide-react'
import type { SidebarData } from '@/interface/sidebarDataInerface'

export const sidebarData: Omit<SidebarData, 'teams'> = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navGroups: [
    {
      title: 'General',
      items: [
        { title: 'Dashboard', url: '/', icon: LayoutDashboard },
        { title: 'Shops', url: '/shops', icon: ShoppingBag },
        { title: 'Customer', url: '/customers', icon: UsersRound },
        { title: 'Vendor', url: '/vendors', icon: UsersRound },
        { title: 'Inventory', url: '/inventory', icon: ShoppingBag },
        { title: 'Transaction Board', url: '/transactions', icon: Package },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Users',
          icon: Settings,
          items: [
            { title: 'Employee', url: '/users/employee', icon: Users },
            { title: 'Profile', url: '/settings', icon: UserCog },
            { title: 'Account', url: '/settings/account', icon: Wrench },
            { title: 'Appearance', url: '/settings/appearance', icon: Palette },
            { title: 'Notifications', url: '/settings/notifications', icon: Bell },
            { title: 'Display', url: '/settings/display', icon: Monitor },
          ],
        },
        { title: 'Help Center', url: '/help-center', icon: HelpCircle },
      ],
    },
  ],
}