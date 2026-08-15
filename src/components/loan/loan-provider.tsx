/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react"
import type { LoanItemInterface } from "@/interface/loanInterface"

type LoanDrawerState = "create" | "update" | "pay" | "delete" | null

interface LoanContextType {
    open: LoanDrawerState
    currentRow: LoanItemInterface | null
    setOpen: (val: LoanDrawerState) => void
    setCurrentRow: (val: LoanItemInterface | null) => void
}

const LoanContext = createContext<LoanContextType | undefined>(undefined)

export const LoanProvider = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState<LoanDrawerState>(null)
    const [currentRow, setCurrentRow] = useState<LoanItemInterface | null>(null)

    return (
        <LoanContext.Provider value={{ open, currentRow, setOpen, setCurrentRow }}>
            {children}
        </LoanContext.Provider>
    )
}

export const useLoanContext = (): LoanContextType => {
    const ctx = useContext(LoanContext)
    if (!ctx) throw new Error("useLoanContext must be used inside LoanProvider")
    return ctx
}
