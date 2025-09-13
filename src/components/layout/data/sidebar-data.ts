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
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  IdCardLanyard,
  UsersRound,
} from 'lucide-react'
import { SidebarData } from '@/interface/sidebarDataInerface'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Kokonaat',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Shops',
          url: '/shops',
          icon: ShoppingBag,
        },
        {
          title: 'Customer',
          url: '/customers',
          icon: UsersRound,
        },
        {
          title: 'Vendor',
          url: '/vendors',
          icon: UsersRound,
        },
        {
          title: 'Transaction Board',
          url: '/transactions',
          icon: Package,
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          title: 'Users',
          icon: Settings,
          items: [
            {
              title: 'Designation',
              url: '/users/designation',
              icon: IdCardLanyard,
            },
            {
              title: 'Employee',
              url: '/users/employee',
              icon: Users,
            },
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}