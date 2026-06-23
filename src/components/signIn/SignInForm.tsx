import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import {
  createSignInFormSchema,
  type SignInFormValues,
} from '@/schema/signInFormSchema'
import PasswordInput from '@/components/password-input'

const SignInForm = ({ className, ...props }: React.HTMLAttributes<HTMLFormElement>) => {
  const [isLoading, setIsLoading] = useState(false)
  const { signInMutation } = useAuth()
  const { t: tAuth } = useTranslation('auth')
  const { t: tValidation } = useTranslation('validation')
  const schema = useMemo(() => createSignInFormSchema(tValidation), [tValidation])

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (data: SignInFormValues) => {
    setIsLoading(true)
    signInMutation.mutate(
      {
        email: data.email,
        password: data.password,
      },
      {
        onSuccess: () => {
          setIsLoading(false)
        },
        onError: () => setIsLoading(false),
      }
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tAuth('signIn.email')}</FormLabel>
              <FormControl>
                <Input type="email" placeholder={tAuth('signIn.emailPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>{tAuth('signIn.password')}</FormLabel>
              <FormControl>
                <PasswordInput placeholder={tAuth('signIn.passwordPlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to="/forget-password"
                className="text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75"
              >
                {tAuth('signIn.forgotPassword')}
              </Link>
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-2" disabled={isLoading}>
          {isLoading ? tAuth('signIn.submitting') : tAuth('signIn.submit')}
        </Button>
      </form>
    </Form>
  )
}

export default SignInForm
