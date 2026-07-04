import { useState } from "react"
import { Main } from "@/components/layout/main"
import { Separator } from "@/components/ui/separator"
import { useTranslation } from "@/hooks/useTranslation"
import { useSubscriptionList, useMyPlan } from "@/hooks/usePlans"
import SubscriptionPlanCard from "@/components/plans/SubscriptionPlanCard"
import { Skeleton } from "@/components/ui/skeleton"

const Plans = () => {
  const { t } = useTranslation('plans')
  const [isYearly, setIsYearly] = useState(false)

  const { data: rawPlans = [], isLoading: plansLoading } = useSubscriptionList()
  const plans = [...rawPlans].sort((a, b) => a.price - b.price)
  const { data: myPlan } = useMyPlan()

  return (
    <Main>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('page.title')}</h2>
          <p className="text-muted-foreground">{t('page.subtitle')}</p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
          {t('billing.monthly')}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isYearly}
          onClick={() => setIsYearly(v => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${isYearly ? 'bg-primary' : 'bg-input'}`}
        >
          <span
            className={`pointer-events-none inline-block size-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${isYearly ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </button>
        <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
          {t('billing.yearly')}
        </span>
        {isYearly && (
          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
            {t('billing.yearlySave')}
          </span>
        )}
      </div>

      {/* Plan cards */}
      {plansLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-80 w-full rounded-lg" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">{t('empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map(plan => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              isYearly={isYearly}
              isCurrent={myPlan?.planKey === plan.planKey}
            />
          ))}
        </div>
      )}
    </Main>
  )
}

export default Plans
