import { useMemo, useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
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
import {
  createResetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/schema/resetPasswordSchema"
import { useResetPassword } from "@/hooks/useAuth"
import { useTranslation } from "@/hooks/useTranslation"

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [isLoading, setIsLoading] = useState(false)
  const { mutate: submitResetPassword } = useResetPassword()
  const { t: tAuth } = useTranslation('auth')
  const { t: tValidation } = useTranslation('validation')
  const schema = useMemo(() => createResetPasswordSchema(tValidation), [tValidation])

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { token: "", newPassword: "", confirmPassword: "" },
  })

  useEffect(() => {
    if (token) {
      form.setValue("token", token)
    }
  }, [token, form])

  const onSubmit = (data: ResetPasswordFormValues) => {
    if (!data.token) {
      form.setError("token", { message: tAuth('resetPassword.tokenRequired') })
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
          <CardTitle className="text-lg tracking-tight">{tAuth('resetPassword.title')}</CardTitle>
          <CardDescription>
            {tAuth('resetPassword.description')}
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
                      <FormLabel>{tAuth('resetPassword.token')}</FormLabel>
                      <FormControl>
                        <Input placeholder={tAuth('resetPassword.tokenPlaceholder')} {...field} />
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
                    <FormLabel>{tAuth('resetPassword.newPassword')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={tAuth('resetPassword.newPasswordPlaceholder')} {...field} />
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
                    <FormLabel>{tAuth('resetPassword.confirmPassword')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={tAuth('resetPassword.confirmPasswordPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-2" disabled={isLoading}>
                {isLoading ? tAuth('resetPassword.submitting') : tAuth('resetPassword.submit')}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-center text-sm">
            <Link to="/sign-in" className="hover:text-primary underline underline-offset-4">
              {tAuth('resetPassword.backToLogin')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}

export default ResetPassword
