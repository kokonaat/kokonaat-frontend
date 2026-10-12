import { useEffect, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
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
import { Combobox } from "@/components/ui/combobox"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { useShopStore } from "@/stores/shopStore"
import type { UomMutateDrawerProps } from "@/interface/uomInterface"
import {
    createUomFormSchema,
    type UomFormValues,
} from "@/schema/uomFormSchema"
import { useCreateUom, useUpdateUom, useUomList } from "@/hooks/useUom"
import { useTranslation } from "@/hooks/useTranslation"

const emptyDefaults: UomFormValues = {
    name: "",
    description: "",
    baseQuantity: null,
    baseUomId: null,
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

    const { data: uomResponse } = useUomList(shopId || "", 1, 100, undefined, { enabled: !!shopId })

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

    const watchedName = useWatch({ control: form.control, name: 'name' })
    const watchedBaseQty = useWatch({ control: form.control, name: 'baseQuantity' })
    const watchedBaseUomId = useWatch({ control: form.control, name: 'baseUomId' })

    const allUoms = uomResponse?.items ?? []
    const baseUomOptions = allUoms
        .filter((u) => u.id !== currentRow?.id)
        .map((u) => ({ value: u.id, label: u.name }))

    const selectedBaseUomName = allUoms.find((u) => u.id === watchedBaseUomId)?.name ?? ''
    const conversionPreview = watchedBaseQty && watchedBaseUomId && watchedName
        ? t('drawer.conversionPreview', { name: watchedName, qty: watchedBaseQty, baseUom: selectedBaseUomName })
        : null

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

                        <div className="space-y-3">
                            <p className="text-sm font-medium leading-none">{t('drawer.fields.baseQuantity')}</p>
                            <div className="flex gap-3">
                                <FormField
                                    control={form.control}
                                    name="baseQuantity"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel className="text-xs text-muted-foreground">{t('drawer.fields.baseQuantity')}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    placeholder={t('drawer.placeholders.baseQuantity')}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value
                                                        field.onChange(val === '' ? null : Number(val))
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="baseUomId"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel className="text-xs text-muted-foreground">{t('drawer.fields.baseUom')}</FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    options={baseUomOptions}
                                                    placeholder={t('drawer.placeholders.baseUom')}
                                                    value={field.value ?? ''}
                                                    onSelect={(val) => field.onChange(val || null)}
                                                    onSearch={() => {}}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {conversionPreview && (
                                <p className="text-xs font-mono text-emerald-700 bg-emerald-50 rounded px-2 py-1 border border-emerald-200">
                                    {conversionPreview}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">{t('drawer.conversionHint')}</p>
                        </div>
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
