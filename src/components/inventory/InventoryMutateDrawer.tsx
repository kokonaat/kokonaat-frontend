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
import { useCreateInventory, useUpdateInventory } from "@/hooks/useInventory"
import { useShopStore } from "@/stores/shopStore"
import {
  createInventoryFormSchema,
  type InventoryFormValues,
} from "@/schema/inventoryFormSchema"
import type { InventoryMutateDrawerProps } from "@/interface/inventoryInterface"
import { useUomList } from "@/hooks/useUom"
import { Combobox } from "@/components/ui/combobox"
import type { ComboboxOption } from "@/components/ui/combobox"
import { useTranslation } from "@/hooks/useTranslation"

const emptyDefaults: InventoryFormValues = {
  name: "",
  description: "",
  quantity: 0,
  lastPrice: 0,
  unitOfMeasurementId: "",
}

const InventoryMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
  onSave,
}: InventoryMutateDrawerProps) => {
  const { t } = useTranslation('inventory')
  const { t: tValidation } = useTranslation('validation')
  const { t: tToast } = useTranslation('toast')
  const shopId = useShopStore((s) => s.currentShopId)
  const isUpdate = !!currentRow?.id

  const schema = useMemo(
    () => createInventoryFormSchema(tValidation),
    [tValidation]
  )

  const createMutation = useCreateInventory(shopId || "")
  const updateMutation = useUpdateInventory(shopId || "")

  const { data: uomListData, isLoading: isUomLoading } = useUomList(
    shopId || "",
    1,
    10,
    undefined,
    { enabled: open && !!shopId }
  )

  const uomItems = uomListData?.items ?? []

  const uomOptions: ComboboxOption[] = uomItems.map(uom => ({
    value: uom.id,
    label: uom.name,
  }))

  const form = useForm<InventoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (open) {
      if (currentRow) {
        form.reset({
          name: currentRow.name,
          description: currentRow.description ?? '',
          quantity: currentRow.quantity ?? 0,
          lastPrice: currentRow.lastPrice ?? 0,
          unitOfMeasurementId: currentRow.unitOfMeasurement?.id ?? "",
        })
      } else {
        form.reset(emptyDefaults)
      }
    }
  }, [currentRow, open, form])

  const {
    formState: { isDirty },
  } = form

  const onSubmit: SubmitHandler<InventoryFormValues> = (data) => {
    if (!shopId) return toast.error(tToast('inventory.shopIdNotFound'))

    if (isUpdate && !isDirty) {
      toast.info(tToast('inventory.noChanges'))
      return
    }

    const payload = {
      ...data,
      name: data.name.trim(),
      description: data.description?.trim() || "",
      quantity: Number(data.quantity),
      lastPrice: Number(data.lastPrice),
      shopId,
    }

    if (isUpdate && currentRow?.id) {
      updateMutation.mutate(
        { id: currentRow.id, data: payload },
        {
          onSuccess: () => {
            toast.success(tToast('inventory.updated'))
            onOpenChange(false)
            onSave?.(payload)
          },
          onError: (err: unknown) => {
            const error = err as AxiosError<{ message: string }>
            toast.error(error?.response?.data?.message || tToast('inventory.updateFailed'))
          },
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(tToast('inventory.created'))
          onSave?.(payload)
          form.reset(emptyDefaults)
        },
        onError: (err: unknown) => {
          const error = err as AxiosError<{ message: string }>
          toast.error(error?.response?.data?.message || tToast('inventory.creationFailed'))
        },
      })
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) {
          form.reset(emptyDefaults)
        }
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
            id="inventory-form"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('drawer.fields.quantity')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder={t('drawer.placeholders.quantity')}
                        min={0}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitOfMeasurementId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{t('drawer.fields.uom')}</FormLabel>
                    <FormControl>
                      <Combobox
                        options={uomOptions}
                        value={field.value}
                        onSelect={field.onChange}
                        disabled={isUomLoading || uomOptions.length === 0}
                        placeholder={
                          isUomLoading
                            ? t('drawer.placeholders.uomLoading')
                            : t('drawer.placeholders.uomSelect')
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastPrice"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>{t('drawer.fields.lastPrice')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder={t('drawer.placeholders.lastPrice')}
                        min={0}
                        step="0.01"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value === '' ? null : parseFloat(value))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">{t('buttons.close')}</Button>
          </SheetClose>
          <Button
            form="inventory-form"
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? t('buttons.saving')
              : t('buttons.saveChanges')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default InventoryMutateDrawer
