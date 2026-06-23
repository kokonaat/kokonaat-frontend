import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import type z from "zod"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useCreateShop } from "@/hooks/useShop"
import { createShopFormSchema } from "@/schema/createShopFormSchema"
import AuthLayout from "@/components/layout/AuthLayout"
import { useTranslation } from "@/hooks/useTranslation"

type FormValues = z.infer<ReturnType<typeof createShopFormSchema>>

const CreateShop = ({ className, ...props }: React.HTMLAttributes<HTMLFormElement>) => {
    const { t } = useTranslation('shops')
    const { t: tValidation } = useTranslation('validation')
    const schema = useMemo(() => createShopFormSchema(tValidation), [tValidation])

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: "", address: "" },
    })

    const { mutate, isPending } = useCreateShop()

    const onSubmit = (data: FormValues) => {
        if (isPending) return
        mutate(data)
    }

    return (
        <AuthLayout>
            <div className="max-w-md mx-auto mt-10">
                <Card className="gap-4">
                    <CardHeader>
                        <CardTitle className="text-lg tracking-tight">{t('createPage.title')}</CardTitle>
                        <CardDescription>{t('createPage.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className={cn("grid gap-3", className)}
                                {...props}
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t('createPage.shopName')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('createPage.placeholders.shopName')} {...field} />
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
                                            <FormLabel>{t('createPage.shopAddress')}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t('createPage.placeholders.address')} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="mt-2" disabled={isPending}>
                                    {isPending ? t('createPage.creating') : t('buttons.createShop')}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter>
                        <p className="text-muted-foreground px-8 text-center text-sm">
                            {t('createPage.termsPrefix')}{" "}
                            <a href="/terms" className="hover:text-primary underline underline-offset-4">
                                {t('createPage.termsOfService')}
                            </a>{" "}
                            {t('createPage.and')}{" "}
                            <a href="/privacy" className="hover:text-primary underline underline-offset-4">
                                {t('createPage.privacyPolicy')}
                            </a>
                            .
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </AuthLayout>
    )
}

export default CreateShop
