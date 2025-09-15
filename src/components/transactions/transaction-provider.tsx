import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Task } from '../designation/data/designationSchema'

type TransactionDialogType = 'create' | 'update' | 'delete' | 'import'

type TransactionContextType = {
  open: TransactionDialogType | null
  setOpen: (str: TransactionDialogType | null) => void
  currentRow: Task | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Task | null>>
}

const TransactionContext = React.createContext<TransactionContextType | null>(null)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<TransactionDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Task | null>(null)

  return (
    <TransactionContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </TransactionContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTransactions = () => {
  const transactonContext = React.useContext(TransactionContext)

  if (!transactonContext) {
    throw new Error('useTasks has to be used within <TransactionContext>')
  }

  return transactonContext
}