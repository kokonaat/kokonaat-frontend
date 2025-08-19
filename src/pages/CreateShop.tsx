import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import z from 'zod'
import AuthLayout from '@/features/auth/auth-layout'

// validation schema
const formSchema = z.object({
    shopName: z
        .string()
        .min(1, 'Please enter your shop name')
        .max(50, 'Shop name must be less than 50 characters'),
})

const CreateShop = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLFormElement>) => {
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate() 

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            shopName: '',
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setIsLoading(true)
        console.log(data)

        setTimeout(() => {
            setIsLoading(false)
            navigate('/') 
        }, 2000)
    }

    return (
        <AuthLayout>
            <Card className='gap-4'>
                <CardHeader>
                    <CardTitle className='text-lg tracking-tight'>Create Shop</CardTitle>
                    <CardDescription>
                        Enter your shop name below to <br />
                        create your shop
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className={cn('grid gap-3', className)}
                            {...props}
                        >
                            {/* shop name field */}
                            <FormField
                                control={form.control}
                                name="shopName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Shop Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Barnick Procharoni" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button className="mt-2" disabled={isLoading}>
                                {isLoading ? 'Creating...' : 'Create Shop'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter>
                    <p className='text-muted-foreground px-8 text-center text-sm'>
                        By clicking create shop, you agree to our{' '}
                        <a
                            href='/terms'
                            className='hover:text-primary underline underline-offset-4'
                        >
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a
                            href='/privacy'
                            className='hover:text-primary underline underline-offset-4'
                        >
                            Privacy Policy
                        </a>
                        .
                    </p>
                </CardFooter>
            </Card>
        </AuthLayout>
    )
}

export default CreateShop