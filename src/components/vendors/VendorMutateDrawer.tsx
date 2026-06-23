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
import type { CustomerMutateDrawerProps } from "@/interface/customerInterface"
import { Checkbox } from "../ui/checkbox"
import {
  createVendorFormSchema,
  type VendorFormValues,
} from "@/schema/vendorFormSchema"
import { useCreateVendor, useUpdateVendor } from "@/hooks/useVendor"
import { useShopStore } from "@/stores/shopStore"
import { useTranslation } from "@/hooks/useTranslation"

const emptyDefaults: VendorFormValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  isB2B: false,
  contactPerson: "",
  contactPersonPhone: "",
}

const VendorMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
  onSave,
}: CustomerMutateDrawerProps) => {
  const { t } = useTranslation('vendors')
  const { t: tValidation } = useTranslation('validation')
  const { t: tToast } = useTranslation('toast')
  const shopId = useShopStore((s) => s.currentShopId)
  const isUpdate = !!currentRow

  const schema = useMemo(
    () => createVendorFormSchema(tValidation),
    [tValidation]
  )

  const createMutation = useCreateVendor(shopId || "")
  const updateMutation = useUpdateVendor(shopId || "")

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    form.reset(currentRow ?? emptyDefaults)
  }, [currentRow, form])

  const isB2BChecked = form.watch("isB2B")

  const {
    formState: { isDirty },
  } = form

  const onSubmit: SubmitHandler<VendorFormValues> = (data) => {
    if (!shopId) return toast.error(tToast('vendor.shopIdNotFound'))

    if (isUpdate && !isDirty) {
      toast.info(tToast('vendor.noChanges'))
      return
    }

    const normalizedData = {
      ...data,
      email: data.email?.trim() || null,
      address: data.address?.trim() || "",
      city: data.city?.trim() || null,
      country: data.country?.trim() || null,
      isB2B: data.isB2B ?? false,
      contactPerson: data.contactPerson?.trim() || null,
      contactPersonPhone: data.contactPersonPhone?.trim() || null,
      shopId,
    }

    if (isUpdate && currentRow?.id) {
      updateMutation.mutate(
        { id: currentRow.id, data: normalizedData },
        {
          onSuccess: () => {
            onOpenChange(false)
            onSave?.(normalizedData)
            form.reset()
            toast.success(tToast('vendor.updated'))
          },
          onError: (err: unknown) => {
            const error = err as AxiosError<{ message: string }>
            toast.error(error?.response?.data?.message || tToast('vendor.updateFailed'))
          },
        }
      )
    } else {
      createMutation.mutate(normalizedData, {
        onSuccess: () => {
          onOpenChange(false)
          onSave?.(normalizedData)
          form.reset()
          toast.success(tToast('vendor.created'))
        },
        onError: (err: unknown) => {
          const error = err as AxiosError<{ message: string }>
          toast.error(error?.response?.data?.message || tToast('vendor.creationFailed'))
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
            id="vendor-form"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('drawer.fields.email')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder={t('drawer.placeholders.email')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('drawer.fields.phone')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('drawer.placeholders.phone')} />
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
                  <FormLabel>{t('table.columns.address')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder={t('drawer.placeholders.address')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('drawer.fields.city')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder={t('drawer.placeholders.city')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('drawer.fields.country')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder={t('drawer.placeholders.country')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isB2B"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                  </FormControl>
                  <FormLabel className="m-0">{t('table.columns.isB2B')}</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isB2BChecked && (
              <>
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('drawer.fields.contactPerson')}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder={t('drawer.placeholders.contactPerson')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPersonPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('drawer.fields.contactPersonPhone', { defaultValue: t('drawer.fields.contactPhone') })}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder={t('drawer.placeholders.contactPersonPhone')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </form>
        </Form>

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">{t('buttons.close')}</Button>
          </SheetClose>
          <Button form="vendor-form" type="submit">
            {t('buttons.saveChanges')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default VendorMutateDrawer
