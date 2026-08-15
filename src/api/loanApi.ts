import type { LoanFormInterface, LoanItemInterface, LoanSummaryInterface } from "@/interface/loanInterface"
import { axiosInstance } from "./axios"
import { apiEndpoints } from "@/config/api"

export const loanList = async (
    shopId: string,
    page: number,
    limit: number,
    searchBy?: string,
    startDate?: Date,
    endDate?: Date,
): Promise<{ items: LoanItemInterface[]; total: number }> => {
    const params = new URLSearchParams({ shopId, page: String(page), limit: String(limit) })
    if (searchBy) params.append("searchBy", searchBy)
    if (startDate) params.append("startDate", startDate.toISOString())
    if (endDate) params.append("endDate", endDate.toISOString())

    const res = await axiosInstance.get(`${apiEndpoints.loan.loanList}?${params.toString()}`)
    return { items: res.data.data ?? [], total: res.data.total ?? 0 }
}

export const loanSummary = async (
    shopId: string,
    startDate?: Date,
    endDate?: Date,
): Promise<LoanSummaryInterface> => {
    const params = new URLSearchParams({ shopId })
    if (startDate) params.append("startDate", startDate.toISOString())
    if (endDate) params.append("endDate", endDate.toISOString())

    const res = await axiosInstance.get(`${apiEndpoints.loan.loanSummary}?${params.toString()}`)
    return res.data
}

export const createLoan = async (data: LoanFormInterface): Promise<LoanItemInterface> => {
    if (!data.shopId) throw new Error("Shop ID is required")
    const res = await axiosInstance.post(apiEndpoints.loan.createLoan, data)
    return res.data.data
}

export const getLoanById = async (id: string): Promise<LoanItemInterface> => {
    if (!id) throw new Error("Loan ID is required")
    const res = await axiosInstance.get(apiEndpoints.loan.getLoanById.replace("{id}", id))
    return res.data.data
}

export const updateLoan = async ({ id, data }: { id: string; data: Partial<LoanFormInterface> }): Promise<void> => {
    const url = apiEndpoints.loan.updateLoan.replace("{id}", id)
    await axiosInstance.put(url, data)
}

export const payLoan = async ({ id, amount }: { id: string; amount: number }): Promise<void> => {
    const url = apiEndpoints.loan.payLoan.replace("{id}", id)
    await axiosInstance.post(url, { amount })
}

export const deleteLoan = async ({ id }: { id: string }): Promise<void> => {
    const url = apiEndpoints.loan.deleteLoan.replace("{id}", id)
    await axiosInstance.delete(url)
}
