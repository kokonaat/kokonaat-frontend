export const VENDOR_TRANSACTION_TYPES = [
  { value: "PAYMENT", label: "Pay" },
  { value: "RECEIVABLE", label: "Receive" },
  { value: "PURCHASE", label: "Purchase" },
  { value: "COMMISSION", label: "Receive Commission" },
]

export const CUSTOMER_TRANSACTION_TYPES = [
  { value: "PAYMENT", label: "Pay" },
  { value: "COLLECT", label: "Collect" },
  { value: "SALE", label: "Sell Out" },
  { value: "COMMISSION", label: "Receive Commission" },
]

export const FORM_ID = 'transaction-form'

export const DEFAULT_VALUES = {
  partnerType: '',
  entityTypeId: '',
  transactionType: '',
  // transactionPaymentStatus: undefined,
  // optional numeric field
  transactionAmount: null,
  // must be an empty array by default
  inventories: [],
}