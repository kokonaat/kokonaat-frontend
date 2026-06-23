import { useEffect, useMemo } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { useCreateExpense, useUpdateExpense } from "@/hooks/useExpense"
import { useShopStore } from "@/stores/shopStore"
import type { ExpenseFormInterface } from "@/interface/expenseInterface"
import {
    createExpenseFormSchema,
    type ExpenseFormType,
} from "@/schema/expenseFormSchema"
import { useExpenseTypeOptions } from "@/hooks/useTranslatedOptions"
import { useTranslation } from "@/hooks/useTranslation"

interface ExpenseMutateDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: ExpenseFormInterface & { id?: string }
    onSave?: (data: ExpenseFormInterface) => void
}

const ExpenseMutateDrawer = ({
    open,
    onOpenChange,
    currentRow,
    onSave,
}: ExpenseMutateDrawerProps) => {
    const { t } = useTranslation('expense')
    const { t: tValidation } = useTranslation('validation')
    const { t: tToast } = useTranslation('toast')
    const expenseTypes = useExpenseTypeOptions()
    const shopId = useShopStore((s) => s.currentShopId)
    const isUpdate = !!currentRow?.id

    const schema = useMemo(
        () => createExpenseFormSchema(tValidation),
        [tValidation]
    )

    const createMutation = useCreateExpense(shopId || "")
    const updateMutation = useUpdateExpense(shopId || "")

    const form = useForm<ExpenseFormType>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: "",
            type: "DAILY_EXPENSE",
            amount: 0,
            remarks: "",
            shopId: shopId || "",
        },
    })

    useEffect(() => {
        if (open) {
            form.reset(
                currentRow ?? {
                    title: "",
                    type: "DAILY_EXPENSE",
                    amount: 0,
                    remarks: "",
                    shopId: shopId || "",
                }
            )
        }
    }, [currentRow, open, form, shopId])

    const {
        formState: { isDirty },
    } = form

    const onSubmit: SubmitHandler<ExpenseFormType> = (data) => {
        if (!shopId) return toast.error(tToast('expense.shopIdNotFound'))

        if (isUpdate && !isDirty) {
            toast.info(tToast('expense.noChanges'))
            return
        }

        const payload: ExpenseFormInterface = {
            ...data,
            title: data.title.trim(),
            remarks: data.remarks?.trim() || "",
            amount: data.amount,
            shopId,
        }

        if (isUpdate && currentRow?.id) {
            const { id: _id, ...updateData } = payload

            updateMutation.mutate(
                { id: currentRow.id, data: updateData },
                {
                    onSuccess: () => {
                        toast.success(tToast('expense.updated'))
                        onOpenChange(false)
                        onSave?.(payload)
                        form.reset()
                    },
                    onError: (err: unknown) => {
                        const error = err as AxiosError<{ message: string }>
                        toast.error(error?.response?.data?.message || tToast('expense.updateFailed'))
                    },
                }
            )
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success(tToast('expense.created'))
                    onOpenChange(false)
                    onSave?.(payload)
                    form.reset()
                },
                onError: (err: unknown) => {
                    const error = err as AxiosError<{ message: string }>
                    toast.error(error?.response?.data?.message || tToast('expense.creationFailed'))
                },
            })
        }
    }

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
                        id="expense-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-1 space-y-6 overflow-y-auto px-4"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('drawer.fields.title')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('drawer.placeholders.title')} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('drawer.fields.expenseType')}</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('drawer.placeholders.typeSelect')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {expenseTypes.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                                placeholder={t('drawer.placeholders.amount')}
                                                value={field.value ?? ""}
                                                onChange={(e) => {
                                                    const val = e.target.value
                                                    field.onChange(val === '' ? '' : Number(val))
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('drawer.fields.remarks')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('drawer.placeholders.remarks')} />
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
                    <Button form="expense-form" type="submit">
                        {t('buttons.saveChanges')}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default ExpenseMutateDrawer
