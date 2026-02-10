import { useState } from "react"
import { Link } from "react-router-dom"
import type { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import AuthLayout from "@/components/layout/AuthLayout"
import { forgetPasswordSchema } from "@/schema/forgetPasswordSchema"
import type { ForgetPasswordFormValues } from "@/schema/forgetPasswordSchema"
import { useForgetPassword } from "@/hooks/useAuth"

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { mutate: submitForgetPassword } = useForgetPassword()

  const form = useForm<ForgetPasswordFormValues>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = (data: z.infer<typeof forgetPasswordSchema>) => {
    setIsLoading(true)
    submitForgetPassword(data, {
      onSettled: () => setIsLoading(false),
    })
  }

  return (
    <AuthLayout>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">Forgot password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-2" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-center text-sm">
            <Link to="/sign-in" className="hover:text-primary underline underline-offset-4">
              Back to Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}

export default ForgotPassword
