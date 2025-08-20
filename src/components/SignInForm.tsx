import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
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
import PasswordInput from '@/components/password-input'

const formSchema = z.object({
  phone: z
    .string()
    .min(1, "Please enter your phone number")
    .regex(/^\d{10,15}$/, "Phone number must be between 10–15 digits"),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(6, 'Password must be at least 6 characters long'),
})

type FormValues = z.infer<typeof formSchema>

const SignInForm = ({ className, ...props }: React.HTMLAttributes<HTMLFormElement>) => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { signInMutation } = useAuth()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { phone: '', password: '' },
  })

  const onSubmit = (data: FormValues) => {
    setIsLoading(true)
    signInMutation.mutate(
      {
        phone: data.phone,
        password: data.password
      },
      {
        onSuccess: () => {
          setIsLoading(false)
          navigate('/')
        },
        onError: () => setIsLoading(false),
      }
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid gap-3', className)} {...props}>
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder='01711111111' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />

        <Button type='submit' className='mt-2' disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </Form>
  )
}

export default SignInForm