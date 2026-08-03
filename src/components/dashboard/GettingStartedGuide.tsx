import { useNavigate } from 'react-router-dom'
import { Check, X, UsersRound, UserStar, ArrowLeftRight } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useGettingStartedStatus } from '@/hooks/useGettingStartedStatus'
import { useShopStore } from '@/stores/shopStore'
import { useGuideStore } from '@/stores/guideStore'

const STYLE = `
  @keyframes nudgeRight {
    0%,100% { transform: translateX(0); opacity:.6 }
    50%      { transform: translateX(3px); opacity:1 }
  }
  @keyframes nudgeLeft {
    0%,100% { transform: translateX(0); opacity:.6 }
    50%      { transform: translateX(-3px); opacity:1 }
  }
`

export default function GettingStartedGuide() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const shopId = useShopStore((s) => s.currentShopId)
  const { hasVendor, hasPurchase, hasCustomer, hasSale } = useGettingStartedStatus()
  const dismiss       = useGuideStore((s) => s.dismiss)
  const dismissedMap  = useGuideStore((s) => s.dismissed)
  const isDismissed   = shopId ? !!dismissedMap[shopId] : true

  if (!shopId || isDismissed) return null

  const next = !hasVendor  ? 'vendor'
    : !hasPurchase         ? 'buy'
    : !hasCustomer         ? 'customer'
    : !hasSale             ? 'sell'
    : 'done'

  const iconBox = (Icon: React.ElementType, active: boolean, done: boolean) => (
    <div className={`flex size-8 shrink-0 items-center justify-center ${
      active ? 'bg-foreground' : done ? 'bg-muted' : 'bg-muted/40'
    }`}>
      {done
        ? <Check size={12} strokeWidth={2.5} className="text-foreground" />
        : <Icon size={12} className={active ? 'text-background' : 'text-muted-foreground'} />
      }
    </div>
  )

  return (
    <>
      <style>{STYLE}</style>
      <div className="border border-border bg-card overflow-hidden">

        {/* header */}
        <div className="flex items-start justify-between border-b border-border px-3 py-2">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              {t('gettingStarted.title')}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground/80">
              {t('gettingStarted.subtitle')}
            </p>
          </div>
          <button
            onClick={() => dismiss(shopId)}
            className="mt-0.5 shrink-0 text-muted-foreground/50 hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X size={11} />
          </button>
        </div>

        {/* 5-col flow */}
        <div className="grid grid-cols-[1fr_40px_1fr_40px_1fr] divide-x divide-border">

          {/* Vendor */}
          <button
            onClick={() => next === 'vendor' && navigate('/vendors')}
            disabled={next !== 'vendor' && !hasVendor}
            className={`flex items-center gap-2.5 px-3 py-2.5 transition-colors text-left ${
              next === 'vendor' ? 'cursor-pointer hover:bg-muted/20' : 'cursor-default'
            } ${!hasVendor && next !== 'vendor' ? 'opacity-40' : ''}`}
          >
            {iconBox(UsersRound, next === 'vendor', hasVendor)}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-foreground leading-tight truncate">
                {t('gettingStarted.steps.addVendor.title')}
              </p>
              <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">
                {hasVendor ? '✓ done' : next === 'vendor' ? 'who you buy inventory from' : 'start here first'}
              </p>
            </div>
          </button>

          {/* Buy connector */}
          <div className="flex flex-col items-center justify-center gap-0.5 bg-muted/10">
            <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground/70 leading-none">buy</span>
            <span
              className={`text-sm leading-none ${hasPurchase ? 'text-foreground' : next === 'buy' ? 'text-foreground' : 'text-border'}`}
              style={next === 'buy' ? { animation: 'nudgeRight 0.85s ease-in-out infinite' } : undefined}
            >→</span>
          </div>

          {/* Transactions */}
          <button
            onClick={() => (next === 'buy' || next === 'sell') && navigate('/transactions')}
            disabled={next !== 'buy' && next !== 'sell'}
            className={`flex items-center gap-2.5 px-3 py-2.5 transition-colors text-left bg-muted/10 ${
              next === 'buy' || next === 'sell' ? 'cursor-pointer hover:bg-muted/30' : 'cursor-default'
            }`}
          >
            {iconBox(ArrowLeftRight, next === 'buy' || next === 'sell', hasPurchase && hasSale)}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-foreground leading-tight">Transactions</p>
              <div className="flex gap-2 mt-0.5">
                <span className={`text-[9px] leading-tight ${hasPurchase ? 'text-foreground font-semibold' : next === 'buy' ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                  {hasPurchase ? '✓ bought' : next === 'buy' ? '→ record a buy' : '· buy'}
                </span>
                <span className={`text-[9px] leading-tight ${hasSale ? 'text-foreground font-semibold' : next === 'sell' ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                  {hasSale ? '✓ sold' : next === 'sell' ? '→ record a sell' : '· sell'}
                </span>
              </div>
            </div>
          </button>

          {/* Sell connector */}
          <div className="flex flex-col items-center justify-center gap-0.5 bg-muted/10">
            <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground/70 leading-none">sell</span>
            <span
              className={`text-sm leading-none ${hasSale ? 'text-foreground' : next === 'sell' ? 'text-foreground' : 'text-border'}`}
              style={next === 'sell' ? { animation: 'nudgeLeft 0.85s ease-in-out infinite' } : undefined}
            >←</span>
          </div>

          {/* Customer */}
          <button
            onClick={() => next === 'customer' && navigate('/customers')}
            disabled={next !== 'customer' && !hasCustomer}
            className={`flex items-center gap-2.5 px-3 py-2.5 transition-colors text-left ${
              next === 'customer' ? 'cursor-pointer hover:bg-muted/20' : 'cursor-default'
            } ${!hasCustomer && next !== 'customer' ? 'opacity-40' : ''}`}
          >
            {iconBox(UserStar, next === 'customer', hasCustomer)}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-foreground leading-tight truncate">
                {t('gettingStarted.steps.addCustomer.title')}
              </p>
              <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">
                {hasCustomer ? '✓ done' : next === 'customer' ? 'who you sell inventory to' : 'add after buying'}
              </p>
            </div>
          </button>
        </div>

        {next === 'done' && (
          <div className="border-t border-border bg-muted/10 px-3 py-1.5 flex items-center justify-between">
            <span className="text-[10px] font-medium text-foreground">All steps done</span>
            <button
              onClick={() => dismiss(shopId)}
              className="text-[9px] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              {t('gettingStarted.dismiss')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
