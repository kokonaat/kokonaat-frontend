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
import { useShopStore } from "@/stores/shopStore"
import type { UomMutateDrawerProps } from "@/interface/uomInterface"
import { uomFormSchema } from "@/schema/uomFormSchema"
import { useCreateUom, useUpdateUom } from "@/hooks/useUom"

type UomFormSchema = z.infer<typeof uomFormSchema>

const UomMutateDrawer = ({
    open,
    onOpenChange,
    currentRow,
    onSave,
}: UomMutateDrawerProps) => {
    const shopId = useShopStore((s) => s.currentShopId)
    const isUpdate = !!currentRow

    const createMutation = useCreateUom(shopId || "")
    const updateMutation = useUpdateUom(shopId || "")

    const form = useForm<UomFormSchema>({
        resolver: zodResolver(uomFormSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    })

    // Reset form when modal opens or currentRow changes
    useEffect(() => {
        form.reset(
            currentRow ?? {
                name: "",
                description: "",
            }
        )
    }, [currentRow, form])

    // isDirty is to check any field change or not
    const {
        formState: { isDirty },
    } = form

    // Submit handler
    const onSubmit: SubmitHandler<UomFormSchema> = (data) => {
        if (!shopId) return toast.error("Shop ID not found!")

        // prevent api call if no input field changed
        if (isUpdate && !isDirty) {
            toast.info("No changes detected. Please modify something before saving.")
            return
        }

        const payload = { ...data, shopId }

        if (isUpdate && currentRow?.id) {
            updateMutation.mutate(
                { id: currentRow.id, data: payload },
                {
                    onSuccess: () => {
                        toast.success("UOM updated successfully")
                        onOpenChange(false)
                        onSave?.(payload)
                    },
                    onError: (err) => {
                        const e = err as AxiosError<{ message: string }>
                        toast.error(e.response?.data?.message || "Update failed")
                    },
                }
            )
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success("UOM created successfully")
                    form.reset({ name: "", description: "" })
                    onSave?.(payload)
                    onOpenChange(false)
                },
                onError: (err) => {
                    const e = err as AxiosError<{ message: string }>
                    toast.error(e.response?.data?.message || "Create failed")
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
                    }
                )
            }}
        >
            <SheetContent className="flex flex-col">
                <SheetHeader className="text-start">
                    <SheetTitle>{isUpdate ? "Update" : "Create"} Uom</SheetTitle>
                    <SheetDescription>
                        {isUpdate
                            ? "Update the uom by providing necessary info."
                            : "Add a new uom by providing necessary info."}{" "}
                        Click save when you're done.
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
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Uom name" />
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
                                        <Input {...field} placeholder="Uom description" />
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
                    <Button form="uom-form" type="submit" disabled={isUpdate && !isDirty}>
                        Save changes
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default UomMutateDrawer