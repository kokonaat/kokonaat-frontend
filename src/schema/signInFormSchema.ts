import z from "zod"

export const signInFormSchema = z.object({
  phone: z
    .string()
    .min(1, "Please enter your phone number")
    .regex(/^\d{10,15}$/, "Phone number must be between 10–15 digits"),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(6, 'Password must be at least 6 characters long'),
})