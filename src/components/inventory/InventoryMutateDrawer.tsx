// import { useEffect } from "react"
// import type { z } from "zod"
// import { useForm } from "react-hook-form"
// import type { SubmitHandler } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { Button } from "@/components/ui/button"
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import {
//   Sheet,
//   SheetClose,
//   SheetContent,
//   SheetDescription,
//   SheetFooter,
//   SheetHeader,
//   SheetTitle,
// } from "@/components/ui/sheet"
// import { Input } from "@/components/ui/input"
// import { toast } from "sonner"
// import type { AxiosError } from "axios"
// import { useCreateInventory, useUpdateInventory } from "@/hooks/useInventory"
// import { useShopStore } from "@/stores/shopStore"
// import { inventoryFormSchema } from "@/schema/inventoryFormSchema"
// import type { InventoryMutateDrawerProps } from "@/interface/inventoryInterface"

// type InventoryFormSchema = z.infer<typeof inventoryFormSchema>

// const InventoryMutateDrawer = ({
//   open,
//   onOpenChange,
//   currentRow,
//   onSave,
// }: InventoryMutateDrawerProps) => {
//   const shopId = useShopStore((s) => s.currentShopId)
//   const isUpdate = !!currentRow

//   const createMutation = useCreateInventory(shopId || "")
//   const updateMutation = useUpdateInventory(shopId || "")

//   const form = useForm<InventoryFormSchema>({
//     resolver: zodResolver(inventoryFormSchema),
//     defaultValues: {
//       name: "",
//       description: "",
//       quantity: 0,
//       lastPrice: 0,
//     },
//   })

//   // Reset form when modal opens or currentRow changes
//   useEffect(() => {
//     form.reset(
//       currentRow ?? {
//         name: "",
//         description: "",
//         quantity: 0,
//         lastPrice: 0,
//       }
//     )
//   }, [currentRow, form])

//   // Submit handler
//   const onSubmit: SubmitHandler<InventoryFormSchema> = (data) => {
//     if (!shopId) return toast.error("Shop ID not found!")

//     const normalizedData = {
//       ...data,
//       name: data.name.trim(),
//       description: data.description?.trim() || "",
//       quantity: Number(data.quantity),
//       lastPrice: Number(data.lastPrice),
//       shopId,
//     }

//     if (isUpdate && currentRow?.id) {
//       updateMutation.mutate(
//         { id: currentRow.id, data: normalizedData },
//         {
//           onSuccess: () => {
//             onOpenChange(false)
//             onSave?.(normalizedData)
//             form.reset()
//             toast.success("Inventory updated successfully.")
//           },
//           onError: (err: unknown) => {
//             const error = err as AxiosError<{ message: string }>
//             toast.error(error?.response?.data?.message || "Update failed")
//           },
//         }
//       )
//     } else {
//       createMutation.mutate(normalizedData, {
//         onSuccess: () => {
//           onOpenChange(false)
//           onSave?.(normalizedData)
//           form.reset()
//           toast.success("Inventory created successfully.")
//         },
//         onError: (err: unknown) => {
//           const error = err as AxiosError<{ message: string }>
//           toast.error(error?.response?.data?.message || "Creation failed")
//         },
//       })
//     }
//   }

//   return (
//     <Sheet
//       open={open}
//       onOpenChange={(v) => {
//         onOpenChange(v)
//         form.reset(
//           currentRow ?? {
//             name: "",
//             description: "",
//             quantity: 0,
//             lastPrice: 0,
//           }
//         )
//       }}
//     >
//       <SheetContent className="flex flex-col">
//         <SheetHeader className="text-start">
//           <SheetTitle>{isUpdate ? "Update" : "Create"} Inventory</SheetTitle>
//           <SheetDescription>
//             {isUpdate
//               ? "Update the inventory by providing necessary info."
//               : "Add a new inventory by providing necessary info."}{" "}
//             Click save when you're done.
//           </SheetDescription>
//         </SheetHeader>

//         <Form {...form}>
//           <form
//             id="inventory-form"
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="flex-1 space-y-6 overflow-y-auto px-4"
//           >
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Name</FormLabel>
//                   <FormControl>
//                     <Input {...field} placeholder="Inventory name" />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="description"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Description</FormLabel>
//                   <FormControl>
//                     <Input {...field} placeholder="Inventory description" />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="quantity"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Quantity</FormLabel>
//                   <FormControl>
//                     <Input
//                       {...field}
//                       type="number"
//                       placeholder="0"
//                       min={0}
//                       value={field.value ?? ''}
//                       onChange={(e) =>
//                         field.onChange(
//                           e.target.value ? Number(e.target.value) : null
//                         )
//                       }
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="lastPrice"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Last Price</FormLabel>
//                   <FormControl>
//                     <Input
//                       {...field}
//                       type="number"
//                       placeholder="0"
//                       min={0}
//                       value={field.value ?? ''}
//                       onChange={(e) =>
//                         field.onChange(
//                           e.target.value ? Number(e.target.value) : null
//                         )
//                       }
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </form>
//         </Form>

//         <SheetFooter className="gap-2">
//           <SheetClose asChild>
//             <Button variant="outline">Close</Button>
//           </SheetClose>
//           <Button form="inventory-form" type="submit">
//             Save changes
//           </Button>
//         </SheetFooter>
//       </SheetContent>
//     </Sheet>
//   )
// }

// export default InventoryMutateDrawer

import { useEffect } from "react"
import { z } from "zod"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import type { AxiosError } from "axios"
import { useCreateInventory, useUpdateInventory } from "@/hooks/useInventory"
import { useShopStore } from "@/stores/shopStore"
import { inventoryFormSchema } from "@/schema/inventoryFormSchema"
import type { InventoryMutateDrawerProps } from "@/interface/inventoryInterface"
import { useUomList } from "@/hooks/useUom"

type InventoryFormSchema = z.infer<typeof inventoryFormSchema>

const InventoryMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
  onSave,
}: InventoryMutateDrawerProps) => {
  const shopId = useShopStore((s) => s.currentShopId)
  const isUpdate = !!currentRow?.id

  const createMutation = useCreateInventory(shopId || "")
  const updateMutation = useUpdateInventory(shopId || "")

  const { data: uomListData } = useUomList(shopId || "", 1, 10)
  const uomItems = uomListData?.items ?? []

  const form = useForm<InventoryFormSchema & { unitOfMeasurementId: string }>({
    resolver: zodResolver(
      inventoryFormSchema.extend({
        unitOfMeasurementId: z.string().min(1, "Unit of Measurement is required"),
      })
    ),
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
      lastPrice: 0,
      unitOfMeasurementId: "",
    },
  })

  // Reset form when modal opens or currentRow changes
  useEffect(() => {
    if (open) {
      form.reset(
        currentRow ?? {
          name: "",
          description: "",
          quantity: 0,
          lastPrice: 0,
          unitOfMeasurementId: "",
        }
      )
    }
  }, [currentRow, open, form])

  const onSubmit: SubmitHandler<InventoryFormSchema & { unitOfMeasurementId: string }> = (data) => {
    if (!shopId) return toast.error("Shop ID not found!")

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
            toast.success("Inventory updated successfully.")
            onOpenChange(false)
            onSave?.(payload)
            form.reset()
          },
          onError: (err: unknown) => {
            const error = err as AxiosError<{ message: string }>
            toast.error(error?.response?.data?.message || "Update failed")
          },
        }
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Inventory created successfully.")
          onSave?.(payload)
          form.reset({
            name: "",
            description: "",
            quantity: 0,
            lastPrice: 0,
            unitOfMeasurementId: "",
          })
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
        if (v && !currentRow) {
          form.reset({
            name: "",
            description: "",
            quantity: 0,
            lastPrice: 0,
            unitOfMeasurementId: "",
          })
        } else {
          form.reset(
            currentRow ?? {
              name: "",
              description: "",
              quantity: 0,
              lastPrice: 0,
              unitOfMeasurementId: "",
            }
          )
        }
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        placeholder="0"
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
                    <FormLabel>Uom</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={uomItems.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select UOM" />
                        </SelectTrigger>
                        <SelectContent>
                          {uomItems.map((uom) => (
                            <SelectItem key={uom.id} value={uom.id}>
                              {uom.name}
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
                name="lastPrice"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Last Price</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
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
            </div>
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