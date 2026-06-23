import { Link } from 'react-router-dom'
import { AlertTriangle, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { DashboardData } from '@/interface/dashboardInterface'
import {
  formatCurrency,
  LOW_STOCK_THRESHOLD,
} from '@/utils/dashboardFormatters'
import { useTranslation } from '@/hooks/useTranslation'

interface DashboardInventoryHealthProps {
  data?: DashboardData
  isLoading?: boolean
}

const DashboardInventoryHealth = ({
  data,
  isLoading,
}: DashboardInventoryHealthProps) => {
  const { t } = useTranslation('dashboard')
  const health = data?.inventoryHealth
  const lowStockItems = health?.lowStockItems ?? []

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Package className="h-4 w-4 shrink-0" />
            {t('inventoryHealth.stockSummary')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {isLoading ? (
            <p className="text-muted-foreground">{t('charts.loading')}</p>
          ) : (
            <>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t('inventoryHealth.skus')}</span>
                <span className="font-medium">{health?.skuCount ?? 0}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t('inventoryHealth.totalUnits')}</span>
                <span className="font-medium">
                  {formatCurrency(health?.totalStockUnits ?? 0)}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">{t('inventoryHealth.stockValue')}</span>
                <span className="font-medium">
                  {formatCurrency(health?.totalStockValue ?? 0)}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="min-w-0">{t('inventoryHealth.lowStockAlerts')}</span>
            {!isLoading && lowStockItems.length > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {lowStockItems.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t('charts.loading')}</p>
          ) : lowStockItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('inventoryHealth.allAboveThreshold', { threshold: LOW_STOCK_THRESHOLD })}
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {lowStockItems.slice(0, 5).map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="min-w-0 truncate font-medium">
                    {item.name}
                  </span>
                  <Badge variant="outline" className="shrink-0">
                    {t('inventoryHealth.unitsLeft', { quantity: item.quantity })}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <Button asChild variant="link" className="mt-3 h-auto p-0">
            <Link to="/inventory">{t('inventoryHealth.viewInventory')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardInventoryHealth
