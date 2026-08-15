import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useLoanContext } from "./loan-provider"
import { useTranslation } from "@/hooks/useTranslation"

export default function LoanCreateButton() {
    const { t } = useTranslation('loans')
    const { setOpen } = useLoanContext()

    return (
        <Button onClick={() => setOpen("create")} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            {t('buttons.create')}
        </Button>
    )
}
