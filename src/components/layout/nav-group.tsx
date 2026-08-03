import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'

export interface NavItem {
  title: string
  url?: string
  icon?: LucideIcon
  badge?: string
  highlight?: boolean
  items?: NavItem[]
}
export interface NavGroup { title: string; items: NavItem[] }

export function NavGroup({ title, items }: NavGroup) {
  const { setOpenMobile } = useSidebar()
  const location = useLocation()

  const checkIsActive = (url?: string) =>
    url ? location.pathname === url : false

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (!item.items) {
            // Single link
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={checkIsActive(item.url)}
                  className={item.highlight ? 'font-bold' : undefined}
                >
                  <Link to={item.url ?? '#'} onClick={() => setOpenMobile(false)}>
                    {item.icon && (
                      item.highlight
                        ? <item.icon strokeWidth={2.5} />
                        : <item.icon />
                    )}
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge className="ms-auto animate-pulse rounded-none bg-foreground px-2 py-0 text-[10px] font-bold text-background hover:bg-foreground">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          // Collapsible items
          return (
            <Collapsible
              asChild
              key={item.title}
              defaultOpen={item.items.some((i) => checkIsActive(i.url))}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge className="ms-auto animate-pulse rounded-none bg-foreground px-2 py-0 text-[10px] font-bold text-background hover:bg-foreground">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="CollapsibleContent">
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={checkIsActive(subItem.url)}>
                          <Link to={subItem.url ?? '#'} onClick={() => setOpenMobile(false)}>
                            {subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
