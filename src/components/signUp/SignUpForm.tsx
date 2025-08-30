import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { signUpFormSchema } from "@/schema/signUpFormSchema"
import PasswordInput from "@/components/password-input"

type FormValues = z.infer<typeof signUpFormSchema>

const SignUpForm = ({ className, ...props }: React.HTMLAttributes<HTMLFormElement>) => {
  const [isLoading, setIsLoading] = useState(false)
  const { signUpMutation } = useAuth()

  const form = useForm<FormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: { name: "", phone: "", password: "", confirmPassword: "" },
  })

  const onSubmit = (data: FormValues) => {
    setIsLoading(true)
    signUpMutation.mutate(
      {
        name: data.name,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
      },
      {
        onSettled: () => setIsLoading(false)
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid gap-3", className)} {...props}>
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Rahul Roy" {...field} />
            </FormControl>
            <FormMessage>{form.formState.errors.name?.message}</FormMessage>
          </FormItem>
        )} />

        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input placeholder="01711111111" {...field} />
            </FormControl>
            <FormMessage>{form.formState.errors.phone?.message}</FormMessage>
          </FormItem>
        )} />

        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <PasswordInput placeholder="********" {...field} />
            </FormControl>
            <FormMessage>{form.formState.errors.password?.message}</FormMessage>
          </FormItem>
        )} />

        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <PasswordInput placeholder="********" {...field} />
            </FormControl>
            <FormMessage>{form.formState.errors.confirmPassword?.message}</FormMessage>
          </FormItem>
        )} />

        <Button type="submit" className="mt-2" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  )
}

export default SignUpForm