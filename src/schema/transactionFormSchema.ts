import { z } from 'zod'

export const transactionFormSchema = z.object({
  transaction: z.string().min(1, "Please select a transaction"),
  entityTypeId: z.string().min(1, "Please select an entity type").optional(),
  transactionType: z.string().min(1, "Please select a transaction type").optional(),
  transactionPaymentStatus: z.enum(["paid", "received"]).optional(),
}).refine(
  (data) => {
    // if transactionType is "payment", then transactionPaymentStatus must be selected
    if (data.transactionType === "payment") {
      return !!data.transactionPaymentStatus
    }
    return true
  },
  {
    // show error under that field
    path: ["transactionPaymentStatus"],
    message: "Please select Paid or Received",
  }
)