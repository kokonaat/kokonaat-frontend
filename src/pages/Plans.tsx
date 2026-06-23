import { Main } from "@/components/layout/main"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { PanelTopOpen } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"

const Plans = () => {
  const { t } = useTranslation('plans')

  return (
    <Main>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-y-2 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('page.title')}</h2>
          <p className="text-muted-foreground">{t('page.subtitle')}</p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
          <PanelTopOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {t('comingSoon.badge')}
        </Badge>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{t('comingSoon.title')}</h3>
          <p className="text-muted-foreground max-w-md">{t('comingSoon.description')}</p>
        </div>
      </div>
    </Main>
  )
}

export default Plans
