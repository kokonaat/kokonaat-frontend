import { z } from "zod"

export const forgetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email")
    .email("Please enter a valid email address"),
})

export type ForgetPasswordFormValues = z.infer<typeof forgetPasswordSchema>
