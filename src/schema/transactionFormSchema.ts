import { z } from "zod"

export const transactionFormSchema = z
  .object({
    partnerType: z.string().min(1, "Please select a partner type"),
    entityTypeId: z.string().min(1, "Please select an entity type").optional(),
    transactionType: z.string().min(1, "Please select a transaction type").optional(),
    transactionAmount: z
      .number()
      .positive({ message: "Amount must be positive" })
      .optional(),
    inventoryId: z.string().optional(),
    quantity: z.number().positive({ message: "Quantity must be positive" }).optional(),
    price: z.number().positive({ message: "Price must be positive" }).optional(),
  })
  // Amount required for specific transaction types
  .refine(
    (data) => {
      const amountRequiredForVendor = ["pay", "receive", "commission"]
      const amountRequiredForCustomer = ["pay", "receive", "collect"]

      if (
        (data.transactionType &&
          amountRequiredForVendor.includes(data.transactionType)) ||
        (data.transactionType &&
          amountRequiredForCustomer.includes(data.transactionType))
      ) {
        return !!data.transactionAmount
      }

      return true
    },
    {
      path: ["transactionAmount"],
      message: "Please enter the amount",
    }
  )
  // Inventory, quantity, and price required for Purchase or Sell Out
  .refine(
    (data) => {
      const inventoryRequiredTypes = ["PURCHASE", "SELL_OUT"]
      if (data.transactionType && inventoryRequiredTypes.includes(data.transactionType)) {
        return !!data.inventoryId && !!data.quantity && !!data.price
      }
      return true
    },
    {
      path: ["inventoryId"],
      message: "Please select an inventory, and enter quantity and price",
    }
  )

// Export type for usage
export type TransactionFormValues = z.infer<typeof transactionFormSchema>