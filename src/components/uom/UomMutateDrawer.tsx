import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import type { SubmitHandler } from "react-hook-form"
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
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { useShopStore } from "@/stores/shopStore"
import type { UomMutateDrawerProps } from "@/interface/uomInterface"
import {
    createUomFormSchema,
    type UomFormValues,
} from "@/schema/uomFormSchema"
import { useCreateUom, useUpdateUom } from "@/hooks/useUom"
import { useTranslation } from "@/hooks/useTranslation"

const emptyDefaults: UomFormValues = {
    name: "",
    description: "",
}

const UomMutateDrawer = ({
    open,
    onOpenChange,
    currentRow,
    onSave,
}: UomMutateDrawerProps) => {
    const { t } = useTranslation('uom')
    const { t: tValidation } = useTranslation('validation')
    const { t: tToast } = useTranslation('toast')
    const shopId = useShopStore((s) => s.currentShopId)
    const isUpdate = !!currentRow

    const schema = useMemo(
        () => createUomFormSchema(tValidation),
        [tValidation]
    )

    const createMutation = useCreateUom(shopId || "")
    const updateMutation = useUpdateUom(shopId || "")

    const form = useForm<UomFormValues>({
        resolver: zodResolver(schema),
        defaultValues: emptyDefaults,
    })

    useEffect(() => {
        form.reset(currentRow ?? emptyDefaults)
    }, [currentRow, form])

    const {
        formState: { isDirty },
    } = form

    const onSubmit: SubmitHandler<UomFormValues> = (data) => {
        if (!shopId) return toast.error(tToast('uom.shopIdNotFound'))

        if (isUpdate && !isDirty) {
            toast.info(tToast('uom.noChanges'))
            return
        }

        const payload = { ...data, shopId }

        if (isUpdate && currentRow?.id) {
            updateMutation.mutate(
                { id: currentRow.id, data: payload },
                {
                    onSuccess: () => {
                        toast.success(tToast('uom.updated'))
                        onOpenChange(false)
                        onSave?.(payload)
                    },
                    onError: (err) => {
                        const e = err as AxiosError<{ message: string }>
                        toast.error(e.response?.data?.message || tToast('uom.updateFailed'))
                    },
                }
            )
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success(tToast('uom.created'))
                    form.reset(emptyDefaults)
                    onSave?.(payload)
                    onOpenChange(false)
                },
                onError: (err) => {
                    const e = err as AxiosError<{ message: string }>
                    toast.error(e.response?.data?.message || tToast('uom.createFailed'))
                },
            })
        }
    }

    return (
        <Sheet
            open={open}
            onOpenChange={(v) => {
                onOpenChange(v)
                form.reset(currentRow ?? emptyDefaults)
            }}
        >
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
                        id="uom-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-1 space-y-6 overflow-y-auto px-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('drawer.fields.name')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('drawer.placeholders.name')} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('drawer.fields.description')}</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('drawer.placeholders.description')} />
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
                    <Button form="uom-form" type="submit" disabled={isUpdate && !isDirty}>
                        {t('buttons.saveChanges')}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default UomMutateDrawer
