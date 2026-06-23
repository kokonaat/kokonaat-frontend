import { useMemo } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import {
  ChartNoAxesCombined,
  ClipboardPlus,
  ContactRound,
  LayoutDashboard,
  Package,
  PanelTopOpenIcon,
  Scale,
  ShoppingBag,
  UserRoundCheck,
  UserRoundPlus,
  UsersRound,
  UserStar,
} from 'lucide-react'
import type { SidebarData } from '@/interface/sidebarDataInerface'

export function useSidebarNav(): Omit<SidebarData, 'teams'> {
  const { t } = useTranslation('nav')

  return useMemo(
    () => ({
      user: {
        name: 'satnaing',
        email: 'satnaingdev@gmail.com',
        avatar: '/avatars/shadcn.jpg',
      },
      navGroups: [
        {
          title: '',
          items: [
            { title: t('dashboard'), url: '/', icon: LayoutDashboard },
            { title: t('shops'), url: '/shops', icon: ShoppingBag },
            { title: t('customer'), url: '/customers', icon: UserStar },
            { title: t('vendor'), url: '/vendors', icon: UsersRound },
            { title: t('uom'), url: '/uom', icon: Scale },
            { title: t('inventory'), url: '/inventory', icon: ShoppingBag },
            {
              title: t('transactionBoard'),
              url: '/transactions',
              icon: Package,
            },
            { title: t('expense'), url: '/expense', icon: ChartNoAxesCombined },
            { title: t('reports'), url: '/reports', icon: ClipboardPlus },
            {
              title: t('userManagement'),
              icon: UserRoundCheck,
              items: [
                {
                  title: t('users'),
                  url: '/users',
                  icon: UserRoundPlus,
                },
                {
                  title: t('userProfile'),
                  url: '/user/me',
                  icon: ContactRound,
                },
              ],
            },
            { title: t('plans'), url: '/plans', icon: PanelTopOpenIcon },
          ],
        },
      ],
    }),
    [t]
  )
}
