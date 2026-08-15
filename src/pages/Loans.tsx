import { useCallback, useState } from "react"
import { Main } from "@/components/layout/main"
import { useShopStore } from "@/stores/shopStore"
import { useLoanList, useLoanSummary } from "@/hooks/useLoan"
import LoanTable from "@/components/loan/LoanTable"
import { LoanProvider } from "@/components/loan/loan-provider"
import LoanCreateButton from "@/components/loan/LoanCreateButton"
import LoanDialogs from "@/components/loan/LoanDialogs"
import { useTranslation } from "@/hooks/useTranslation"
import { Card, CardContent } from "@/components/ui/card"
import { Banknote, TrendingDown, TrendingUp } from "lucide-react"

const Loans = () => {
    const { t } = useTranslation('loans')
    const shopId = useShopStore((s) => s.currentShopId)

    const [pageIndex, setPageIndex] = useState(0)
    const [searchBy, setSearchBy] = useState("")

    const defaultStart = new Date()
    defaultStart.setDate(defaultStart.getDate() - 6)
    defaultStart.setHours(0, 0, 0, 0)
    const defaultEnd = new Date()
    defaultEnd.setHours(23, 59, 59, 999)

    const [startDate, setStartDate] = useState<Date | undefined>(defaultStart)
    const [endDate, setEndDate] = useState<Date | undefined>(defaultEnd)

    const pageSize = 10

    const handlePageChange = useCallback((index: number) => setPageIndex(index), [])
    const handleSearchChange = useCallback((value: string) => { setSearchBy(value); setPageIndex(0) }, [])
    const handleDateChange = useCallback((from?: Date, to?: Date) => {
        setStartDate(from)
        setEndDate(to)
        setPageIndex(0)
    }, [])

    const { data, isLoading, isError } = useLoanList(
        shopId || "", pageIndex + 1, pageSize, searchBy, startDate, endDate
    )

    const { data: summary } = useLoanSummary(shopId || "", startDate, endDate)

    if (isError) return <p>{t('page.errorLoading')}</p>

    const loans = data?.items || []
    const total = data?.total || 0

    const summaryCards = [
        {
            label: t('summary.totalLoan'),
            value: summary?.totalLoan ?? 0,
            icon: Banknote,
            className: 'text-blue-600',
        },
        {
            label: t('summary.totalPaid'),
            value: summary?.totalPaid ?? 0,
            icon: TrendingUp,
            className: 'text-green-600',
        },
        {
            label: t('summary.totalPending'),
            value: summary?.totalPending ?? 0,
            icon: TrendingDown,
            className: 'text-amber-600',
        },
    ]

    return (
        <LoanProvider>
            <Main>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{t('page.title')}</h2>
                        <p className="text-muted-foreground">{t('page.subtitle')}</p>
                    </div>
                    <LoanCreateButton />
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {summaryCards.map((card) => {
                        const Icon = card.icon
                        return (
                            <Card key={card.label}>
                                <CardContent className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                                        <p className={`text-xl font-bold tabular-nums ${card.className}`}>
                                            {(card.value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <Icon className={`h-8 w-8 opacity-60 ${card.className}`} />
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
                    {isLoading ? (
                        <p>{t('page.loading')}</p>
                    ) : (
                        <LoanTable
                            data={loans}
                            pageIndex={pageIndex}
                            pageSize={pageSize}
                            total={total}
                            onPageChange={handlePageChange}
                            onSearchChange={handleSearchChange}
                            onDateChange={handleDateChange}
                            defaultDateRange={{ from: startDate, to: endDate }}
                        />
                    )}
                </div>
            </Main>

            <LoanDialogs />
        </LoanProvider>
    )
}

export default Loans
