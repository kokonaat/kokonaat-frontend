export const VENDOR_TRANSACTION_TYPES = [
  { value: 'pay', label: 'Pay' },
  { value: 'receive', label: 'Receive' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'commission', label: 'Commission' }
]

export const CUSTOMER_TRANSACTION_TYPES = [
  { value: 'pay', label: 'Pay' },
  { value: 'collect', label: 'Collect' },
  { value: 'sell_out', label: 'Sell Out' },
  { value: 'commission', label: 'Commission' }
]

export const FORM_ID = 'transaction-form'

export const DEFAULT_VALUES = {
  transaction: '',
  entityTypeId: '',
  transactionType: '',
  transactionPaymentStatus: undefined,
}