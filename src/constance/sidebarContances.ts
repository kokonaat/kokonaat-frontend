import {
  ContactRound,
  LayoutDashboard,
  Package,
  ShoppingBag,
  UserRoundCheck,
  UserRoundPlus,
  UsersRound,
  UserStar,
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
        { title: 'Customer', url: '/customers', icon: UserStar },
        { title: 'Vendor', url: '/vendors', icon: UsersRound },
        { title: 'Inventory', url: '/inventory', icon: ShoppingBag },
        { title: 'Transaction Board', url: '/transactions', icon: Package },
        {
          title: 'User Management',
          icon: UserRoundCheck,
          items: [
            {
              title: 'Users',
              url: '/users',
              icon: UserRoundPlus
            },
            {
              title: 'User Profile',
              url: '#',
              icon: ContactRound
            },
          ],
        },
      ],
    },
  ],
}