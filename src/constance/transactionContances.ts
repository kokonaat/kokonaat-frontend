export const VENDOR_TRANSACTION_TYPES = [
  { value: "PAYMENT", label: "Pay" },
   // UI shows "Receive", backend gets SALE
  { value: "SALE", label: "Receive" },
  { value: "PURCHASE", label: "Purchase" },
  { value: "COMMISSION", label: "Receive Commission" },
]

export const CUSTOMER_TRANSACTION_TYPES = [
  { value: "PAYMENT", label: "Pay" },
  // UI shows "Collect", backend gets SALE
  { value: "SALE", label: "Collect" },
  // UI shows "Sell Out", backend gets PURCHASE
  { value: "PURCHASE", label: "Sell Out" },
  { value: "COMMISSION", label: "Receive Commission" },
]

export const FORM_ID = 'transaction-form'

export const DEFAULT_VALUES = {
  transaction: '',
  entityTypeId: '',
  transactionType: '',
  transactionPaymentStatus: undefined,
}