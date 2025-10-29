import { useEffect } from "react"
import type { z } from "zod"
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
import { inventoryFormSchema } from "@/schema/inventoryFormSchema"
import type { InventoryMutateDrawerProps } from "@/interface/inventoryInterface"

type InventoryFormSchema = z.infer<typeof inventoryFormSchema>

const InventoryMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
  onSave,
}: InventoryMutateDrawerProps) => {
  const shopId = useShopStore((s) => s.currentShopId)
  const isUpdate = !!currentRow

  const createMutation = useCreateInventory(shopId || "")
  const updateMutation = useUpdateInventory(shopId || "")

  const form = useForm<InventoryFormSchema>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
      lastPrice: 0,
    },
  })

  // Reset form when modal opens or currentRow changes
  useEffect(() => {
    form.reset(
      currentRow ?? {
        name: "",
        description: "",
        quantity: 0,
        lastPrice: 0,
      }
    )
  }, [currentRow, form])

  // Submit handler
  const onSubmit: SubmitHandler<InventoryFormSchema> = (data) => {
    if (!shopId) return toast.error("Shop ID not found!")

    const normalizedData = {
      ...data,
      name: data.name.trim(),
      description: data.description?.trim() || "",
      quantity: Number(data.quantity),
      lastPrice: Number(data.lastPrice),
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
            toast.success("Inventory updated successfully.")
          },
          onError: (err: unknown) => {
            const error = err as AxiosError<{ message: string }>
            toast.error(error?.response?.data?.message || "Update failed")
          },
        }
      )
    } else {
      createMutation.mutate(normalizedData, {
        onSuccess: () => {
          onOpenChange(false)
          onSave?.(normalizedData)
          form.reset()
          toast.success("Inventory created successfully.")
        },
        onError: (err: unknown) => {
          const error = err as AxiosError<{ message: string }>
          toast.error(error?.response?.data?.message || "Creation failed")
        },
      })
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset(
          currentRow ?? {
            name: "",
            description: "",
            quantity: 0,
            lastPrice: 0,
          }
        )
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>{isUpdate ? "Update" : "Create"} Inventory</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Update the inventory by providing necessary info."
              : "Add a new inventory by providing necessary info."}{" "}
            Click save when you're done.
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Inventory name" />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Inventory description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="100"
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
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
                <FormItem>
                  <FormLabel>Last Price</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="100"
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
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
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button form="inventory-form" type="submit">
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default InventoryMutateDrawer