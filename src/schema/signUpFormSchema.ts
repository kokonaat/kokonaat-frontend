import z from "zod";

export const signUpFormSchema = z.object({
  name: z.string().min(3, "Please enter your full name (at least 3 characters)"),
  phone: z
    .string()
    .regex(/^\d{10,15}$/, "Please enter a valid phone number (10–15 digits)"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})