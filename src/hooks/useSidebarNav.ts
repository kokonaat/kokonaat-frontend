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
import type { SidebarData, SidebarItem, SidebarNavGroup } from '@/interface/sidebarDataInerface'
import { useShopPermissions } from '@/hooks/useShopPermissions'
import { useShopStore } from '@/stores/shopStore'
import { MODULE_NAV_ROUTES, type ModuleKey } from '@/lib/module-permissions'
import { useGettingStartedStatus } from '@/hooks/useGettingStartedStatus'
import { useGuideStore } from '@/stores/guideStore'

function canAccessUrl(url: string, allowedRoutes: Set<string> | null, isOwner: boolean) {
  if (isOwner || allowedRoutes === null) return true
  return allowedRoutes.has(url)
}

function filterNavItems(
  items: SidebarItem[],
  allowedRoutes: Set<string> | null,
  isOwner: boolean,
): SidebarItem[] {
  return items
    .map((item) => {
      if (item.items?.length) {
        const nested = filterNavItems(item.items, allowedRoutes, isOwner)
        if (nested.length === 0) return null
        return { ...item, items: nested }
      }
      if (!item.url) return item
      return canAccessUrl(item.url, allowedRoutes, isOwner) ? item : null
    })
    .filter(Boolean) as SidebarItem[]
}

export function useSidebarNav(): Omit<SidebarData, 'teams'> {
  const { t } = useTranslation('nav')
  const shopId = useShopStore((s) => s.currentShopId)
  const { data: permissions } = useShopPermissions(shopId)

  const allowedRoutes = useMemo(() => {
    if (!permissions) return null
    if (permissions.isOwner) return null

    const routes = new Set<string>()
    permissions.modules.forEach((moduleKey) => {
      const moduleRoutes = MODULE_NAV_ROUTES[moduleKey as ModuleKey]
      moduleRoutes?.forEach((route) => routes.add(route))
    })
    return routes
  }, [permissions])

  const isOwner = permissions?.isOwner ?? false
  const { hasVendor, hasPurchase, hasCustomer, hasSale } = useGettingStartedStatus()
  const dismissedMap = useGuideStore((s) => s.dismissed)
  const guideDismissed = shopId ? !!dismissedMap[shopId] : true

  const transactionsBadge = (() => {
    if (!guideDismissed) {
      if (!hasVendor) return '★'
      if (!hasPurchase) return '→ Buy'
      if (!hasCustomer) return '★'
      if (!hasSale) return '→ Sell'
    }
    return '★'
  })()

  const navGroups: SidebarNavGroup[] = useMemo(() => {
    const allItems: SidebarItem[] = [
      { title: t('dashboard'), url: '/', icon: LayoutDashboard },
      ...(isOwner
        ? [{ title: t('shops'), url: '/shops', icon: ShoppingBag }]
        : []),
      { title: t('customer'), url: '/customers', icon: UserStar },
      { title: t('vendor'), url: '/vendors', icon: UsersRound },
      { title: t('uom'), url: '/uom', icon: Scale },
      { title: t('inventory'), url: '/inventory', icon: ShoppingBag },
      { title: t('transactionBoard'), url: '/transactions', icon: Package, badge: transactionsBadge, highlight: true },
      { title: t('expense'), url: '/expense', icon: ChartNoAxesCombined },
      { title: t('reports'), url: '/reports', icon: ClipboardPlus },
      ...(isOwner
        ? [
            {
              title: t('userManagement'),
              icon: UserRoundCheck,
              items: [
                { title: t('users'), url: '/users', icon: UserRoundPlus },
                { title: t('userProfile'), url: '/user/me', icon: ContactRound },
              ],
            },
          ]
        : permissions?.modules.includes('users')
          ? [
              {
                title: t('userManagement'),
                icon: UserRoundCheck,
                items: [
                  { title: t('userProfile'), url: '/user/me', icon: ContactRound },
                ],
              },
            ]
          : []),
      ...(isOwner
        ? [{ title: t('plans'), url: '/plans', icon: PanelTopOpenIcon }]
        : []),
    ]

    return [
      {
        title: '',
        items: filterNavItems(allItems, allowedRoutes, isOwner),
      },
    ]
  }, [t, allowedRoutes, isOwner, permissions?.modules, transactionsBadge])

  return useMemo(
    () => ({
      user: {
        name: 'satnaing',
        email: 'satnaingdev@gmail.com',
        avatar: '/avatars/shadcn.jpg',
      },
      navGroups,
    }),
    [navGroups],
  )
}
