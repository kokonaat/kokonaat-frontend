import { useEffect } from "react"
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { useCreateLoan, useUpdateLoan } from "@/hooks/useLoan"
import { useShopStore } from "@/stores/shopStore"
import type { LoanItemInterface } from "@/interface/loanInterface"
import { useTranslation } from "@/hooks/useTranslation"

const loanSchema = z.object({
    loanFrom: z.string().min(1),
    purpose: z.string().optional().default(""),
    amount: z.number().min(0.01),
    remarks: z.string().optional().default(""),
})

type LoanFormType = z.infer<typeof loanSchema>

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: LoanItemInterface
    onSave?: () => void
}

const LoanMutateDrawer = ({ open, onOpenChange, currentRow, onSave }: Props) => {
    const { t } = useTranslation('loans')
    const { t: tToast } = useTranslation('toast')
    const shopId = useShopStore((s) => s.currentShopId)
    const isUpdate = !!currentRow?.id

    const createMutation = useCreateLoan(shopId || "")
    const updateMutation = useUpdateLoan(shopId || "")

    const form = useForm<LoanFormType>({
        resolver: zodResolver(loanSchema) as Resolver<LoanFormType>,
        defaultValues: { loanFrom: "", purpose: "", amount: 0, remarks: "" },
    })

    useEffect(() => {
        if (open) {
            form.reset(
                currentRow
                    ? { loanFrom: currentRow.loanFrom, purpose: currentRow.purpose ?? "", amount: currentRow.amount, remarks: currentRow.remarks ?? "" }
                    : { loanFrom: "", purpose: "", amount: 0, remarks: "" }
            )
        }
    }, [open, currentRow, form])

    const onSubmit: SubmitHandler<LoanFormType> = (data) => {
        if (!shopId) return toast.error(tToast('loan.shopIdNotFound') || "Shop ID required")

        if (isUpdate && currentRow?.id) {
            updateMutation.mutate(
                { id: currentRow.id, data },
                {
                    onSuccess: () => {
                        toast.success(tToast('loan.updated') || "Loan updated")
                        onOpenChange(false)
                        onSave?.()
                    },
                    onError: (err: unknown) => {
                        const error = err as AxiosError<{ message: string }>
                        toast.error(error?.response?.data?.message || tToast('loan.updateFailed') || "Update failed")
                    },
                }
            )
        } else {
            createMutation.mutate(
                data,
                {
                    onSuccess: () => {
                        toast.success(tToast('loan.created') || "Loan created")
                        onOpenChange(false)
                        onSave?.()
                        form.reset()
                    },
                    onError: (err: unknown) => {
                        const error = err as AxiosError<{ message: string }>
                        toast.error(error?.response?.data?.message || tToast('loan.creationFailed') || "Creation failed")
                    },
                }
            )
        }
    }

    const isPending = createMutation.isPending || updateMutation.isPending

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col">
                <SheetHeader className="text-start">
                    <SheetTitle>
                        {isUpdate ? t('drawer.titleUpdate') : t('drawer.titleCreate')}
                    </SheetTitle>
                    <SheetDescription>
                        {isUpdate ? t('drawer.descriptionUpdate') : t('drawer.descriptionCreate')}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form
                        id="loan-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-1 space-y-5 overflow-y-auto px-4"
                    >
                        <FormField
                            control={form.control}
                            name="loanFrom"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('drawer.fields.loanFrom')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('drawer.placeholders.loanFrom')} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="purpose"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('drawer.fields.purpose')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('drawer.placeholders.purpose')} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('drawer.fields.amount')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            inputMode="decimal"
                                            step="any"
                                            min="0"
                                            placeholder="0.00"
                                            value={field.value === 0 ? '' : (field.value ?? '')}
                                            onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('drawer.fields.remarks')}</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder={t('drawer.placeholders.remarks')} rows={2} />
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
                    <Button form="loan-form" type="submit" disabled={isPending}>
                        {isPending ? t('buttons.saving') : t('buttons.saveChanges')}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default LoanMutateDrawer
