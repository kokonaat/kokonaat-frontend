import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useTranslation } from "@/hooks/useTranslation"
import type { SubscriptionPlanInterface } from "@/interface/subscriptionInterface"
import { Check } from "lucide-react"

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlanInterface
  isYearly: boolean
  isCurrent: boolean
}

function formatLimit(value: number, unlimitedLabel: string): string {
  if (value === -1) return unlimitedLabel
  return value.toLocaleString()
}

function formatPrice(value: number): string {
  if (value === 0) return "0"
  return value.toLocaleString()
}

const SubscriptionPlanCard = ({ plan, isYearly, isCurrent }: SubscriptionPlanCardProps) => {
  const { t } = useTranslation('plans')

  const unlimited = t('limits.unlimited')
  const displayPrice = isYearly ? plan.yearlyPrice : plan.price
  const isFree = plan.price === 0
  const isPopular = plan.planKey === 'pro'

  const limitRows = [
    { label: t('limits.shops'), value: formatLimit(plan.maxShops, unlimited) },
    { label: t('limits.users'), value: formatLimit(plan.maxUsers, unlimited) },
    { label: t('limits.vendors'), value: formatLimit(plan.maxVendors, unlimited) },
    { label: t('limits.customers'), value: formatLimit(plan.maxCustomers, unlimited) },
    { label: t('limits.transactions'), value: formatLimit(plan.totalTransactions, unlimited) },
    { label: t('limits.expenses'), value: formatLimit(plan.maxExpenses, unlimited) },
  ]

  return (
    <Card className={`relative flex flex-col ${isPopular ? 'border-primary shadow-md' : ''} ${isCurrent ? 'ring-2 ring-primary' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-0 right-0 flex justify-center">
          <Badge className="px-3">{t('badge.popular')}</Badge>
        </div>
      )}

      <CardHeader className="pb-4 pt-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold leading-tight">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
          </div>
          {isCurrent && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {t('badge.current')}
            </Badge>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-muted-foreground text-sm font-medium">৳</span>
            <span className="text-4xl font-bold tracking-tight tabular-nums">
              {formatPrice(displayPrice)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {isFree
              ? t('billing.free')
              : isYearly
                ? t('billing.perYear')
                : t('billing.perMonth')}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <ul className="space-y-2.5">
          {limitRows.map(({ label, value }) => (
            <li key={label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Check className="size-3.5 shrink-0 text-primary" />
                {label}
              </span>
              <span className="font-medium tabular-nums text-foreground">{value}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          className="w-full"
          variant={isCurrent ? "secondary" : isPopular ? "default" : "outline"}
          disabled={isCurrent}
        >
          {isCurrent
            ? t('cta.current')
            : isFree
              ? t('cta.getStarted')
              : t('cta.upgrade')}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default SubscriptionPlanCard
