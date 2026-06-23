import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercentChange } from '@/utils/dashboardFormatters'
import { useTranslation } from '@/hooks/useTranslation'

interface AnalyticsKpiCardProps {
  title: string
  value: number | string
  description?: string
  change?: number
  isLoading?: boolean
  className?: string
}

const AnalyticsKpiCard = ({
  title,
  value,
  description,
  change,
  isLoading,
  className,
}: AnalyticsKpiCardProps) => {
  const { t } = useTranslation('dashboard')
  const displayValue =
    typeof value === 'number' ? formatCurrency(value) : value

  return (
    <Card className={cn('min-w-0 overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="truncate text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="truncate text-xl font-bold sm:text-2xl">
          {isLoading ? t('kpi.loadingValue') : displayValue}
        </div>
        {(description || change !== undefined) && (
          <div className="mt-2 flex min-w-0 flex-col items-start gap-1">
            {change !== undefined && !isLoading && (
              <Badge
                variant="outline"
                className={cn(
                  'max-w-full truncate text-xs',
                  change > 0 && 'border-emerald-500 text-emerald-600',
                  change < 0 && 'border-red-500 text-red-600',
                  change === 0 && 'text-muted-foreground',
                )}
              >
                {t('kpi.changeVsPrior', { change: formatPercentChange(change) })}
              </Badge>
            )}
            {description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AnalyticsKpiCard
