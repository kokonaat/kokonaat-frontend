import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
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
import { resetPasswordSchema } from "@/schema/resetPasswordSchema"
import type { ResetPasswordFormValues } from "@/schema/resetPasswordSchema"
import { useResetPassword } from "@/hooks/useAuth"

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [isLoading, setIsLoading] = useState(false)
  const { mutate: submitResetPassword } = useResetPassword()

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: "", newPassword: "", confirmPassword: "" },
  })

  useEffect(() => {
    if (token) {
      form.setValue("token", token)
    }
  }, [token, form])

  const onSubmit = (data: z.infer<typeof resetPasswordSchema>) => {
    if (!data.token) {
      form.setError("token", { message: "Reset token is required" })
      return
    }
    setIsLoading(true)
    submitResetPassword(
      { token: data.token, newPassword: data.newPassword, confirmPassword: data.confirmPassword },
      {
        onSettled: () => setIsLoading(false),
      }
    )
  }

  return (
    <AuthLayout>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">Reset password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
              {!token && (
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reset token</FormLabel>
                      <FormControl>
                        <Input placeholder="Paste token from email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Min 6 characters" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-2" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset password"}
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

export default ResetPassword
