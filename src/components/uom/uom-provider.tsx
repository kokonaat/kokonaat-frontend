/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'
import type { UomInterface } from '@/interface/uomInterface'

type UomDrawerState = 'view' | 'update' | 'delete' | 'create' | null

interface UomContextType {
    open: UomDrawerState
    currentRow: UomInterface | null
    setOpen: (val: UomDrawerState) => void
    setCurrentRow: (val: UomInterface | null) => void
}

// context
const UomContext = createContext<UomContextType | undefined>(undefined)

// provider
export const UomProvider = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState<UomDrawerState>(null)
    const [currentRow, setCurrentRow] = useState<UomInterface | null>(null)

    return (
        <UomContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
            {children}
        </UomContext.Provider>
    )
}

// hook
export const useUom = (): UomContextType => {
    const ctx = useContext(UomContext)
    if (!ctx) throw new Error('useUom must be used inside UomProvider')
    return ctx
}