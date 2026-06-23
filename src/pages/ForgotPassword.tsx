import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
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
  createForgetPasswordSchema,
  type ForgetPasswordFormValues,
} from "@/schema/forgetPasswordSchema"
import { useForgetPassword } from "@/hooks/useAuth"
import { useTranslation } from "@/hooks/useTranslation"

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { mutate: submitForgetPassword } = useForgetPassword()
  const { t: tAuth } = useTranslation('auth')
  const { t: tValidation } = useTranslation('validation')
  const schema = useMemo(() => createForgetPasswordSchema(tValidation), [tValidation])

  const form = useForm<ForgetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  })

  const onSubmit = (data: ForgetPasswordFormValues) => {
    setIsLoading(true)
    submitForgetPassword(data, {
      onSettled: () => setIsLoading(false),
    })
  }

  return (
    <AuthLayout>
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">{tAuth('forgotPassword.title')}</CardTitle>
          <CardDescription>
            {tAuth('forgotPassword.description')}
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
                    <FormLabel>{tAuth('forgotPassword.email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={tAuth('forgotPassword.emailPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="mt-2" disabled={isLoading}>
                {isLoading ? tAuth('forgotPassword.submitting') : tAuth('forgotPassword.submit')}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-center text-sm">
            <Link to="/sign-in" className="hover:text-primary underline underline-offset-4">
              {tAuth('forgotPassword.backToLogin')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}

export default ForgotPassword
