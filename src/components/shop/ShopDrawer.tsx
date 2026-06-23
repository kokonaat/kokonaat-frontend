import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
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
import { Input } from "@/components/ui/input"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import type { ShopDrawerProps } from "@/interface/shopInterface"
import { useCreateShop, useUpdateShop } from "@/hooks/useShop"
import { createShopFormSchema } from "@/schema/createShopFormSchema"
import { useTranslation } from "@/hooks/useTranslation"

type ShopForm = z.infer<ReturnType<typeof createShopFormSchema>>

const ShopDrawer = ({ open, onOpenChange, currentShop }: ShopDrawerProps) => {
    const { t } = useTranslation('shops')
    const { t: tValidation } = useTranslation('validation')
    const isEdit = !!currentShop
    const [loading, setLoading] = useState(false)

    const schema = useMemo(() => createShopFormSchema(tValidation), [tValidation])

    const form = useForm<ShopForm>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", address: "" },
    })

    const { mutate: createMutate } = useCreateShop()
    const { mutate: updateMutate } = useUpdateShop()

    useEffect(() => {
        form.reset({
            name: currentShop?.shopName || "",
            address: currentShop?.shopAddress || "",
        })
    }, [currentShop, form])

    const onSubmit = (data: ShopForm) => {
        if (isEdit && currentShop?.shopId) {
            updateMutate({ id: currentShop.shopId, address: data.address }, {
                onSuccess: () => {
                    setLoading(false)
                    form.reset()
                    onOpenChange(false)
                }
            })
        } else {
            createMutate(data, {
                onSuccess: () => {
                    setLoading(false)
                    form.reset()
                    onOpenChange(false)
                }
            })
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col">
                <SheetHeader className="text-start">
                    <SheetTitle>{isEdit ? t('drawer.titleEdit') : t('drawer.titleCreate')}</SheetTitle>
                    <SheetDescription>
                        {isEdit ? t('drawer.descriptionEdit') : t('drawer.descriptionCreate')}
                    </SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form
                        id="shop-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-1 space-y-6 overflow-y-auto px-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('drawer.shopName')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={t('drawer.placeholders.shopName')}
                                            disabled={isEdit}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('drawer.address')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={t('drawer.placeholders.address')}
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
                    <Button
                        type="submit"
                        form="shop-form"
                        disabled={loading}
                    >
                        {loading
                            ? isEdit ? t('buttons.updating') : t('buttons.creating')
                            : isEdit ? t('buttons.updateAddress') : t('buttons.createShop')}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default ShopDrawer
