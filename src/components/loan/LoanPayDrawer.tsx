import { useEffect } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
    Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { usePayLoan } from "@/hooks/useLoan"
import { useShopStore } from "@/stores/shopStore"
import type { LoanItemInterface } from "@/interface/loanInterface"
import { useTranslation } from "@/hooks/useTranslation"
import { fmtAmount } from "@/lib/utils"

const paySchema = z.object({
    amount: z.number().min(0.01),
})

type PayFormType = z.infer<typeof paySchema>

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: LoanItemInterface | null
    onSave?: () => void
}

const LoanPayDrawer = ({ open, onOpenChange, currentRow, onSave }: Props) => {
    const { t } = useTranslation('loans')
    const { t: tToast } = useTranslation('toast')
    const shopId = useShopStore((s) => s.currentShopId)
    const payMutation = usePayLoan(shopId || "")

    const form = useForm<PayFormType>({
        resolver: zodResolver(paySchema),
        defaultValues: { amount: 0 },
    })

    useEffect(() => {
        if (open) form.reset({ amount: 0 })
    }, [open, form])

    const pending = currentRow ? Number(currentRow.amount) - Number(currentRow.paid) : 0

    const onSubmit: SubmitHandler<PayFormType> = (data) => {
        if (!currentRow?.id) return

        if (data.amount > pending) {
            form.setError("amount", { message: t('payDrawer.exceedsOutstanding') })
            return
        }

        payMutation.mutate(
            { id: currentRow.id, amount: data.amount },
            {
                onSuccess: () => {
                    toast.success(tToast('loan.paid') || "Payment recorded")
                    onOpenChange(false)
                    onSave?.()
                },
                onError: (err: unknown) => {
                    const error = err as AxiosError<{ message: string }>
                    toast.error(error?.response?.data?.message || tToast('loan.payFailed') || "Payment failed")
                },
            }
        )
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col">
                <SheetHeader className="text-start">
                    <SheetTitle>{t('payDrawer.title')}</SheetTitle>
                    <SheetDescription>{t('payDrawer.description')}</SheetDescription>
                </SheetHeader>

                {currentRow && (
                    <div className="px-4 space-y-2 text-sm border rounded-md p-3 bg-muted/40">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('payDrawer.loanFrom')}</span>
                            <span className="font-medium">{currentRow.loanFrom}</span>
                        </div>
                        {currentRow.purpose && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('payDrawer.purpose')}</span>
                                <span>{currentRow.purpose}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('payDrawer.totalAmount')}</span>
                            <span className="font-medium tabular-nums">{fmtAmount(currentRow.amount, { min: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('payDrawer.alreadyPaid')}</span>
                            <span className="text-green-600 tabular-nums">{fmtAmount(currentRow.paid, { min: 2 })}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                            <span className="text-muted-foreground font-medium">{t('payDrawer.outstanding')}</span>
                            <span className="font-bold tabular-nums text-amber-600">{fmtAmount(pending, { min: 2 })}</span>
                        </div>
                    </div>
                )}

                <Form {...form}>
                    <form
                        id="loan-pay-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-1 space-y-5 px-4"
                    >
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('payDrawer.paymentAmount')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            inputMode="decimal"
                                            step="any"
                                            min="0.01"
                                            placeholder="0.00"
                                            value={field.value === 0 ? '' : (field.value ?? '')}
                                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                <SheetFooter className="gap-2">
                    <SheetClose asChild>
                        <Button variant="outline">{t('buttons.close')}</Button>
                    </SheetClose>
                    <Button form="loan-pay-form" type="submit" disabled={payMutation.isPending}>
                        {payMutation.isPending ? t('buttons.saving') : t('payDrawer.confirm')}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default LoanPayDrawer
