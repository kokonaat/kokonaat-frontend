import { useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
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
import {
  createChangePasswordSchema,
  type ChangePasswordFormValues,
} from "@/schema/changePasswordSchema"
import { useChangePassword } from "@/hooks/useAuth"
import { useTranslation } from "@/hooks/useTranslation"

const ChangePassword = () => {
  const { t: tAuth } = useTranslation('auth')
  const { t: tValidation } = useTranslation('validation')
  const schema = useMemo(() => createChangePasswordSchema(tValidation), [tValidation])

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  })

  const { mutate: handleChangePassword, isPending } = useChangePassword()
  const navigate = useNavigate()

  const onSubmit = (data: ChangePasswordFormValues) => {
    if (data.oldPassword === data.newPassword) {
      toast.error(tAuth('changePassword.samePasswordError'))
      return
    }

    handleChangePassword(data, {
      onSuccess: () => {
        toast.success(tAuth('changePassword.success'))
        form.reset()
        navigate("/")
      },
      onError: (error: unknown) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : tAuth('changePassword.updateFailed')
        toast.error(errorMessage)
      },
    })
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-lg border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg tracking-tight">
            {tAuth('changePassword.title')}
          </CardTitle>
          <CardDescription>
            {tAuth('changePassword.description')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tAuth('changePassword.oldPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={tAuth('changePassword.oldPasswordPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tAuth('changePassword.newPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={tAuth('changePassword.newPasswordPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tAuth('changePassword.confirmNewPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={tAuth('changePassword.confirmNewPasswordPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="mt-2" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    {tAuth('changePassword.submitting')}
                  </>
                ) : (
                  <>
                    {tAuth('changePassword.submit')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter>
          <p className="text-muted-foreground mx-auto text-center text-sm">
            <Link
              to="/sign-in"
              className="hover:text-primary underline underline-offset-4"
            >
              {tAuth('changePassword.backToLogin')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ChangePassword
