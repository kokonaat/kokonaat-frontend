import { useEffect, useState } from "react"
import type { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useCreateSubscriptionPlan, useUpdateSubscriptionPlan } from "@/hooks/usePlans"
import type { CreateSubscriptionPlanDto, SubscriptionPlanDrawerProps } from "@/interface/subscriptionInterface"
import { subscriptionFormSchema } from "@/schema/subscriptionFormSchema"
import { toast } from "sonner"

type SubscriptionPlanForm = z.infer<typeof subscriptionFormSchema>

const SubscriptionPlanDrawer = ({ open, onOpenChange, currentPlan }: SubscriptionPlanDrawerProps) => {
    const isEdit = !!currentPlan
    const [loading, setLoading] = useState(false)

    const form = useForm<SubscriptionPlanForm>({
        resolver: zodResolver(subscriptionFormSchema),
        defaultValues: {
            name: "",
            price: 0,
            totalTransactions: 0,
            dashboardAccess: false,
            description: "",
        },
    })

    const { mutate: createPlan } = useCreateSubscriptionPlan()
    const { mutate: updatePlan } = useUpdateSubscriptionPlan()

    // reset form whenever currentPlan or drawer open state changes
    useEffect(() => {
        if (open) {
            form.reset({
                name: currentPlan?.name || "",
                price: currentPlan?.price || 0,
                totalTransactions: currentPlan?.totalTransactions || 0,
                dashboardAccess: currentPlan?.dashboardAccess || false,
                description: currentPlan?.description || "",
            })
        }
    }, [currentPlan, open, form])

    // isDirty is to check any field change or not
    const { formState: { isDirty } } = form

    const onSubmit = (data: SubscriptionPlanForm) => {
        // prevent api call when nothing change in edit
        if (isEdit && !isDirty) {
            toast.info("No changes detected. Please modify something before saving.")
            return
        }
        setLoading(true)

        // ensure description is always a string
        const payload: CreateSubscriptionPlanDto = {
            ...data,
            description: data.description || "",
        }

        if (isEdit && currentPlan) {
            updatePlan({ id: currentPlan.id, data: payload }, {
                onSuccess: () => {
                    setLoading(false)
                    onOpenChange(false)
                    form.reset()
                },
                onError: () => setLoading(false),
            })
        } else {
            createPlan(payload, {
                onSuccess: () => {
                    setLoading(false)
                    onOpenChange(false)
                    form.reset()
                },
                onError: () => setLoading(false),
            })
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                // resets when drawer opens automatically
                onOpenAutoFocus={() => form.reset()}
                className="flex flex-col px-2">
                <SheetHeader>
                    <SheetTitle>{isEdit ? "Edit Subscription Plan" : "Create Subscription Plan"}</SheetTitle>
                    <SheetDescription>{isEdit ? "Update plan details." : "Add a new subscription plan."}</SheetDescription>
                </SheetHeader>

                <Form {...form}>
                    <form
                        id="subscription-plan-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex-1 space-y-5 overflow-y-auto px-1"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Plan Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Basic / Pro" />
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
                                        <Input {...field} placeholder="Plan description" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="totalTransactions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Transactions</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="dashboardAccess"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                    <FormLabel className="mb-0">Dashboard Access</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                <SheetFooter className="gap-2">
                    <SheetClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </SheetClose>
                    <Button type="submit" form="subscription-plan-form" disabled={loading}>
                        {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Plan" : "Create Plan")}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}

export default SubscriptionPlanDrawer