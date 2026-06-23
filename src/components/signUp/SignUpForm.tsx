import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { useTranslation } from "@/hooks/useTranslation"
import {
  createSignUpFormSchema,
  type SignUpFormValues,
} from "@/schema/signUpFormSchema"
import PasswordInput from "@/components/password-input"

const SignUpForm = ({ className, ...props }: React.HTMLAttributes<HTMLFormElement>) => {
  const [isLoading, setIsLoading] = useState(false)
  const { signUpMutation } = useAuth()
  const { t: tAuth } = useTranslation('auth')
  const { t: tValidation } = useTranslation('validation')
  const schema = useMemo(() => createSignUpFormSchema(tValidation), [tValidation])

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  })

  const onSubmit = (data: SignUpFormValues) => {
    setIsLoading(true)
    signUpMutation.mutate(
      {
        name: data.name,
        email: data.email,
        ...(data.phone ? { phone: data.phone } : {}),
        password: data.password,
        confirmPassword: data.confirmPassword,
      },
      {
        onSettled: () => setIsLoading(false),
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid gap-3", className)} {...props}>
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>{tAuth('signUp.name')}</FormLabel>
            <FormControl>
              <Input placeholder={tAuth('signUp.namePlaceholder')} {...field} />
            </FormControl>
            <FormMessage>{form.formState.errors.name?.message}</FormMessage>
          </FormItem>
        )} />

        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>{tAuth('signUp.email')}</FormLabel>
            <FormControl>
              <Input type="email" placeholder={tAuth('signUp.emailPlaceholder')} {...field} />
            </FormControl>
            <FormMessage>{form.formState.errors.email?.message}</FormMessage>
          </FormItem>
        )} />

        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>{tAuth('signUp.phone')}</FormLabel>
            <FormControl>
              <Input placeholder={tAuth('signUp.phonePlaceholder')} {...field} />
            </FormControl>
            <FormMessage>{form.formState.errors.phone?.message}</FormMessage>
          </FormItem>
        )} />

        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>{tAuth('signUp.password')}</FormLabel>
            <FormControl>
              <PasswordInput placeholder={tAuth('signUp.passwordPlaceholder')} {...field} />
            </FormControl>
            <FormMessage>{form.formState.errors.password?.message}</FormMessage>
          </FormItem>
        )} />

        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem>
            <FormLabel>{tAuth('signUp.confirmPassword')}</FormLabel>
            <FormControl>
              <PasswordInput placeholder={tAuth('signUp.confirmPasswordPlaceholder')} {...field} />
            </FormControl>
            <FormMessage>{form.formState.errors.confirmPassword?.message}</FormMessage>
          </FormItem>
        )} />

        <Button type="submit" className="mt-2" disabled={isLoading}>
          {isLoading ? tAuth('signUp.submitting') : tAuth('signUp.submit')}
        </Button>
      </form>
    </Form>
  )
}

export default SignUpForm
