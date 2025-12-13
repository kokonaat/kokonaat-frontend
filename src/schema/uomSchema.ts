import { z } from "zod"

export const uomSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  shopId: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export type Uom = z.infer<typeof uomSchema>