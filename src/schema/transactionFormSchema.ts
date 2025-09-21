import { z } from 'zod'

export const transactionFormSchema = z.object({
  partnerType: z.string().min(1, "Please select a partner type"),
  entityTypeId: z.string().min(1, "Please select an entity type").optional(),
  transactionType: z.string().min(1, "Please select a transaction type").optional(),
  transactionAmount: z
    .number()
    .positive({ message: "Amount must be positive" })
    .optional(),
}).refine(
  (data) => {
    // If transaction type requires amount, it must be provided
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

// ✅ Export type for usage across the app
export type TransactionFormValues = z.infer<typeof transactionFormSchema>