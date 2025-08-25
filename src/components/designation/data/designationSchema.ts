import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const designationSchema = z.object({
  id: z.string(),
  title: z.string(),
})

export type Task = z.infer<typeof designationSchema>
