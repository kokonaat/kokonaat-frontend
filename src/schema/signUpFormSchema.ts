import z from "zod";

export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Please enter your full name (at least 3 characters)"),
    email: z
      .string()
      .min(1, "Please enter your email")
      .email("Please enter a valid email address"),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });