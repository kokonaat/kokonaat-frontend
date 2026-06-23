import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from '@/components/ui/drawer'
import type { ExpenseItemInterface } from '@/interface/expenseInterface'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/hooks/useTranslation'

type ExpenseViewDrawerProps = {
    open: boolean
    onOpenChange: (val: boolean) => void
    currentRow: ExpenseItemInterface | null
}

const ExpenseViewDrawer = ({
    open,
    onOpenChange,
    currentRow,
}: ExpenseViewDrawerProps) => {
    const { t } = useTranslation('expense')
    const { t: tEnums } = useTranslation('enums')

    if (!currentRow) return null

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-w-xl mx-auto p-6 space-y-6">
                <DrawerHeader>
                    <DrawerTitle className="text-lg font-semibold">
                        {t('drawer.viewTitle')}
                    </DrawerTitle>
                    <DrawerDescription className="text-sm text-muted-foreground">
                        {t('drawer.viewDescription', { title: currentRow.title })}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>
                        <span className="font-medium text-foreground">{t('drawer.fields.title')}:</span>{' '}
                        {currentRow.title}
                    </div>

                    <div>
                        <span className="font-medium text-foreground">{t('drawer.fields.expenseType')}:</span>{' '}
                        {tEnums(`expenseType.${currentRow.type}`)}
                    </div>

                    <div>
                        <span className="font-medium text-foreground">{t('drawer.fields.amount')}:</span>{' '}
                        {currentRow.amount}
                    </div>

                    <div>
                        <span className="font-medium text-foreground">{t('drawer.fields.createdAt')}:</span>{' '}
                        {new Date(currentRow.createdAt).toLocaleString()}
                    </div>

                    <div className="col-span-2 flex gap-1">
                        <span className="font-medium text-foreground">{t('drawer.fields.remarks')}:</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="max-w-[350px] truncate cursor-help">
                                        {currentRow.remarks || t('common.notAvailable')}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-sm wrap-break-word">
                                        {currentRow.remarks || t('common.notAvailable')}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default ExpenseViewDrawer
