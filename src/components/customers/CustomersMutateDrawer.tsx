import { useEffect } from "react"
import type z from "zod"
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
import { Checkbox } from "../ui/checkbox"
import type { AxiosError } from "axios"
import type { CustomerMutateDrawerProps } from "@/interface/customerInterface"
import { customerFormSchema } from "@/schema/customerFormSchema"
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomer"
import { getCurrentShopId } from "@/lib/getCurrentShopId"

type CustomerFormSchema = z.infer<typeof customerFormSchema>

const CustomersMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
  onSave,
}: CustomerMutateDrawerProps) => {
  const shopId = getCurrentShopId()
  const isUpdate = !!currentRow

  const createMutation = useCreateCustomer(shopId || "")
  const updateMutation = useUpdateCustomer(shopId || "")

  const form = useForm<CustomerFormSchema>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      isB2B: false,
      contactPerson: "",
      contactPersonPhone: "",
    },
  })

  // form reset
  useEffect(() => {
    form.reset(currentRow ?? {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      isB2B: false,
      contactPerson: "",
      contactPersonPhone: "",
    })
  }, [currentRow, form])

  // tract inB2B
  const isCheckedIsB2B = form.watch("isB2B")

  //  submit data
  const onSubmit: SubmitHandler<CustomerFormSchema> = (data) => {
    if (!shopId) return toast.error("Shop ID not found!")

    const normalizedData = {
      ...data,
      email: data.email?.trim() || null,
      city: data.city?.trim() || null,
      country: data.country?.trim() || null,
      isB2B: data.isB2B ?? false,
      contactPerson: data.contactPerson?.trim() || null,
      contactPersonPhone: data.contactPersonPhone?.trim() || null,
      shopId,
    }

    if (isUpdate && currentRow?.id) {
      updateMutation.mutate(
        // submitting with shopId
        { id: currentRow.id, data: normalizedData },
        {
          onSuccess: () => {
            onOpenChange(false)
            onSave?.(normalizedData)
            form.reset()
            toast.success("Customer updated successfully.")
          },
          onError: (err: unknown) => {
            const error = err as AxiosError<{message: string}>
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
          toast.success("Customer created successfully.")
        },
        onError: (err: unknown) => {
          const error = err as AxiosError<{message: string}>
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
        form.reset(currentRow ?? {
          name: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          country: "",
          isB2B: false,
          contactPerson: "",
          contactPersonPhone: "",
        })
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-start">
          <SheetTitle>{isUpdate ? "Update" : "Create"} Customer</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Update the customer by providing necessary info."
              : "Add a new customer by providing necessary info."}{" "}
            Click save when you're done.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id="customer-form"
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
                    <Input {...field} placeholder="Rahul Roy" />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="rahul@gmail.com" />
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
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="01711111111" />
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field}  placeholder="Shyamoli,Dhaka" />
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
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Dhaka" />
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
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} placeholder="Bangladesh" />
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
                  <FormLabel className="m-0">B2B</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />

            {
              isCheckedIsB2B && (
                <>
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="Ramesh Roy" />
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
                        <FormLabel>Contact Person Phone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="01711111111" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )
            }
          </form>
        </Form>

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
          <Button form="customer-form" type="submit">
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default CustomersMutateDrawer