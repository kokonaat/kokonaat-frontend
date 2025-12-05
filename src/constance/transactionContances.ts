// import type { ComboboxOptionInterface } from "@/interface/transactionInterface"

// export const VENDOR_TRANSACTION_TYPES = [
//   { value: "PAYMENT", label: "Pay" },
//   { value: "RECEIVABLE", label: "Receive" },
//   { value: "PURCHASE", label: "Purchase" },
//   { value: "COMMISSION", label: "Receive Commission" },
// ]

// export const CUSTOMER_TRANSACTION_TYPES = [
//   { value: "PAYMENT", label: "Pay" },
//   { value: "COLLECT", label: "Collect" },
//   { value: "SALE", label: "Sell Out" },
//   { value: "COMMISSION", label: "Receive Commission" },
// ]

// export const FORM_ID = 'transaction-form'

// export const DEFAULT_VALUES = {
//   partnerType: '',
//   entityTypeId: '',
//   transactionType: '',
//   paymentType: '',
//   advancePaid: 0,
//   pending: 0,
//   paid: 0,
//   // transactionPaymentStatus: undefined,
//   // optional numeric field
//   transactionAmount: null,
//   // must be an empty array by default
//   inventories: [],
// }

// export const PAYMENT_TYPES: ComboboxOptionInterface[] = [
//   { value: "CASH", label: "Cash" },
//   { value: "BANK_TRANSFER", label: "Bank Transfer" },
//   { value: "MOBILE_PAYMENT", label: "Mobile Payment" },
//   { value: "CREDIT_CARD", label: "Credit Card" },
//   { value: "DEBIT_CARD", label: "Debit Card" },
// ]



import type { ComboboxOptionInterface } from "@/interface/transactionInterface"

export const TRANSACTION_TYPES = [
  { value: "PURCHASE", label: "Purchase" },
  { value: "SALE", label: "Sale" },
  { value: "PAYMENT", label: "Payment" },
  { value: "COLLECT", label: "Collect" },
  { value: "COMMISSION", label: "Commission" },
]

export const FORM_ID = 'transaction-form'

export const DEFAULT_VALUES = {
  transactionType: '',
  partnerType: '',
  entityTypeId: '',
  paymentType: '',
  advancePaid: 0,
  pending: 0,
  paid: 0,
  transactionAmount: null,
  inventories: [],
}

export const PAYMENT_TYPES: ComboboxOptionInterface[] = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE_PAYMENT", label: "Mobile Payment" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "DEBIT_CARD", label: "Debit Card" },
]