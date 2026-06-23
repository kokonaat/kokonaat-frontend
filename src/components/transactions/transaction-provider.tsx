import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { Transaction } from '@/interface/transactionInterface'

type TransactionDialogType =
  | 'create'
  | 'update'
  | 'delete'
  | 'import'
  | 'recordPayment'

export type RecordPaymentMode = 'pay' | 'collect' | null

type TransactionContextType = {
  open: TransactionDialogType | null
  setOpen: (str: TransactionDialogType | null) => void
  currentRow: Transaction | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Transaction | null>>
  recordPaymentMode: RecordPaymentMode
  setRecordPaymentMode: React.Dispatch<React.SetStateAction<RecordPaymentMode>>
}

const TransactionContext = React.createContext<TransactionContextType | null>(
  null,
)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<TransactionDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Transaction | null>(null)
  const [recordPaymentMode, setRecordPaymentMode] =
    useState<RecordPaymentMode>(null)

  return (
    <TransactionContext.Provider
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        recordPaymentMode,
        setRecordPaymentMode,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTransactions = () => {
  const transactionContext = React.useContext(TransactionContext)

  if (!transactionContext) {
    throw new Error('useTransactions must be used within <TransactionProvider>')
  }

  return transactionContext
}
