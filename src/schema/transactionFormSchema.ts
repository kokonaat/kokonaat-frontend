import { z } from "zod"

export const transactionFormSchema = z
  .object({
    partnerType: z.string().min(1, "Please select a partner type"),

    entityTypeId: z
      .string()
      .min(1, "Please select an entity type")
      .optional(),

    transactionType: z
      .string()
      .min(1, "Please select a transaction type")
      .optional(),

    transactionAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? Number(val) : val))
      .refine((val) => val === undefined || val > 0, {
        message: "Amount must be positive",
      })
      .optional(),

    // 🧩 Array of inventories for dynamic rows
    inventories: z
      .array(
        z.object({
          inventoryId: z.string().min(1, "Select inventory"),
          quantity: z
            .union([z.string(), z.number()])
            .transform((val) => (typeof val === "string" ? Number(val) : val))
            .refine((val) => val > 0, { message: "Quantity must be positive" }),
          price: z
            .union([z.string(), z.number()])
            .transform((val) => (typeof val === "string" ? Number(val) : val))
            .refine((val) => val > 0, { message: "Price must be positive" }),
        })
      )
      .optional()
      .default([]),
  })
  .refine(
    (data) => {
      const inventoryRequiredTypes = ["PURCHASE", "SELL_OUT"]
      // Only require inventories for these transaction types
      if (
        data.transactionType &&
        inventoryRequiredTypes.includes(data.transactionType)
      ) {
        return data.inventories && data.inventories.length > 0
      }
      return true
    },
    {
      path: ["inventories"],
      message: "Please add at least one inventory with valid quantity and price",
    }
  )

export type TransactionFormSchema = z.infer<typeof transactionFormSchema>