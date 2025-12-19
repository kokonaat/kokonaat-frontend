import { useState, useEffect } from "react"
import type { DateRange } from "react-day-picker"
import { Main } from "@/components/layout/main"
import DateRangeSearch from "@/components/DateRangeSearch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { ReportType } from "@/utils/enums/reportType"
import { useShopStore } from "@/stores/shopStore"
import { useCustomerList } from "@/hooks/useCustomer"
import { useVendorList } from "@/hooks/useVendor"
import { useTransactionLedger } from "@/hooks/useTransaction"
import { ReportCard } from "@/components/report/ReportCard"
import { ReportTable } from "@/components/report/ReportTable"
import type {
  TransactionLedgerDetailItem,
  TransactionReportItem,
  TransactionLedgerItem,
  TransactionDetailItem,
  ExpenseReportItem
} from "@/interface/reportInterface"
import { generateLedgerPDF } from "@/utils/enums/customerOrVendorLedgerPdf"
import { generateTransactionReportPDF } from "@/utils/enums/transactionReportPdf"
import { generateTransactionReportExcel } from "@/utils/enums/transactionReportExcel"
import { generateLedgerExcel } from "@/utils/enums/customerOrVendorLedgerExcel"
import { NoDataFound } from "@/components/NoDataFound"
import { TRANSACTION_TYPES } from "@/constance/transactionConstances"
import { useExpensesReport, useTransactionReport } from "@/hooks/useReport"
import type { TransactionReportParams } from "@/api/reportApi"
import { ExpensesReportColumns, LedgerReportColumns, TransactionReportColumns } from "@/components/report/ReportColumns"
import Loader from "@/components/layout/Loader"
import { generateExpenseReportPDF } from "@/utils/enums/expensesreportPdf"
import { generateExpenseReportExcel } from "@/utils/enums/expensesreportExcel"

const Reports = () => {
  const shopId = useShopStore((s) => s.currentShopId) ?? ""
  const page = 1
  const limit = 10

  //  states for immediate ui change
  const [reportType, setReportType] = useState<ReportType>()
  const [selectedEntityId, setSelectedEntityId] = useState<string>()
  const [transactionType, setTransactionType] = useState<string>()
  const [dateRange, setDateRange] = useState<DateRange>()

  // trigger api states
  const [appliedFilters, setAppliedFilters] = useState<{
    reportType?: ReportType;
    entityId?: string;
    dateRange?: DateRange;
    transactionType?: string;
  } | null>(null)

  const isReportTypeEnabled = !!dateRange?.from && !!dateRange?.to
  const isEntityEnabled = isReportTypeEnabled && !!reportType

  // customer hook
  const { data: customerResponse } = useCustomerList(
    shopId, page, limit, undefined, undefined, undefined,
    { enabled: reportType === ReportType.CUSTOMER_LEDGER && isEntityEnabled }
  )

  // vendor hook
  const { data: vendorResponse } = useVendorList(
    shopId, page, limit, undefined, undefined, undefined,
    { enabled: reportType === ReportType.VENDOR_LEDGER && isEntityEnabled }
  )

  // customer/vendor ledger hook
  const { data: ledger, isLoading: isLedgerLoading } = useTransactionLedger(
    shopId,
    page,
    appliedFilters?.entityId ?? "",
    limit,
    appliedFilters?.dateRange?.from?.toISOString(),
    appliedFilters?.dateRange?.to?.toISOString(),
  )

  // transaction report hook
  const { data: transactionData, isLoading: isTransactionLoading } = useTransactionReport(
    {
      shopId,
      page: page,
      limit: limit,
      startDate: appliedFilters?.dateRange?.from?.toISOString(),
      endDate: appliedFilters?.dateRange?.to?.toISOString(),
      transactionType: appliedFilters?.transactionType as TransactionReportParams['transactionType'],
    },
    {
      enabled: !!appliedFilters &&
        appliedFilters.reportType === ReportType.TRANSACTION_REPORT &&
        !!appliedFilters.transactionType &&
        !!appliedFilters.dateRange?.from &&
        !!appliedFilters.dateRange?.to
    }
  )

  // use expense report hook
  const { data: expensesdata, isLoading: isExpensesLoading } = useExpensesReport(
    {
      shopId,
      page: page,
      limit: limit,
      startDate: appliedFilters?.dateRange?.from?.toISOString(),
      endDate: appliedFilters?.dateRange?.to?.toISOString(),
    },
    {
      enabled:
        !!appliedFilters &&
        appliedFilters.reportType === ReportType.EXPENSE_REPORT &&
        !!appliedFilters.dateRange?.from &&
        !!appliedFilters.dateRange?.to,
    }
  )

  // reset logic when parents change
  useEffect(() => {
    setReportType(undefined)
    setSelectedEntityId(undefined)
    setTransactionType(undefined)
    setAppliedFilters(null)
  }, [dateRange])

  useEffect(() => {
    setSelectedEntityId(undefined)
    setTransactionType(undefined)
    setAppliedFilters(null)
  }, [reportType])

  const handleSearch = () => {
    setAppliedFilters({
      reportType,
      entityId: selectedEntityId,
      dateRange,
      transactionType
    })
  }

  const detailRows: TransactionLedgerDetailItem[] = ledger?.transactions.flatMap(
    (tran: TransactionLedgerItem) =>
      tran.details.map((det: TransactionDetailItem) => ({
        id: det.id,
        transactionNo: tran.no,
        createdAt: tran.createdAt,
        transactionType: tran.transactionType,
        entityName: tran.customer?.name ?? tran.vendor?.name ?? "",
        inventoryName: det.inventory?.name ?? "",
        quantity: det.quantity?.toString() ?? "0",
        price: det.price?.toString() ?? "0",
        total: det.total?.toString() ?? "0",
        paymentType: tran.paymentType,
        unitOfMeasurement: det.unitOfMeasurement,
      }))
  ) ?? []

  const entityName = appliedFilters?.entityId
    ? appliedFilters.reportType === ReportType.CUSTOMER_LEDGER
      ? customerResponse?.customers.find(c => c.id === appliedFilters.entityId)?.name ?? "Customer"
      : vendorResponse?.data.find(v => v.id === appliedFilters.entityId)?.name ?? "Vendor"
    : "Unknown";

  const handleDownloadPdf = () => {
    // transaction report pdf
    if (appliedFilters?.reportType === ReportType.TRANSACTION_REPORT && transactionData?.data) {
      generateTransactionReportPDF(
        transactionData.data,
        "Shop Name",
        appliedFilters.dateRange?.from && appliedFilters.dateRange?.to ? {
          from: appliedFilters.dateRange.from.toLocaleDateString(),
          to: appliedFilters.dateRange.to.toLocaleDateString()
        } : undefined,
        appliedFilters.transactionType
      );
      return;
    }

    // expense report pdf
    if (appliedFilters?.reportType === ReportType.EXPENSE_REPORT && expensesdata) {
      generateExpenseReportPDF(
        expensesdata,
        "Shop Name",
        appliedFilters.dateRange?.from && appliedFilters.dateRange?.to ? {
          from: appliedFilters.dateRange.from.toLocaleDateString(),
          to: appliedFilters.dateRange.to.toLocaleDateString()
        } : undefined
      );
      return
    }

    // ledger report pdf
    if (!ledger || !appliedFilters?.entityId) return;

    generateLedgerPDF(
      entityName,
      "Shop Name",
      detailRows,
      {
        totalAmount: ledger.totalAmount,
        totalPaid: ledger.totalPaid,
        totalPending: ledger.totalPending,
        totalAdvancePaid: ledger.totalAdvancePaid,
      },
      appliedFilters.dateRange?.from && appliedFilters.dateRange?.to ? {
        from: appliedFilters.dateRange.from.toLocaleDateString(),
        to: appliedFilters.dateRange.to.toLocaleDateString()
      } : undefined,
      appliedFilters.reportType === ReportType.CUSTOMER_LEDGER ? "customer" : "vendor"
    )
  }

  const handleDownloadExcel = () => {
    // transaction report excel
    if (appliedFilters?.reportType === ReportType.TRANSACTION_REPORT && transactionData?.data) {
      generateTransactionReportExcel(
        transactionData.data,
        "Shop Name",
        appliedFilters.dateRange?.from && appliedFilters.dateRange?.to ? {
          from: appliedFilters.dateRange.from.toLocaleDateString(),
          to: appliedFilters.dateRange.to.toLocaleDateString()
        } : undefined,
        appliedFilters.transactionType
      )
      return
    }

    // expense report excel
    if (appliedFilters?.reportType === ReportType.EXPENSE_REPORT && expensesdata) {
      generateExpenseReportExcel(
        expensesdata,
        "Shop Name",
        appliedFilters.dateRange?.from && appliedFilters.dateRange?.to ? {
          from: appliedFilters.dateRange.from.toLocaleDateString(),
          to: appliedFilters.dateRange.to.toLocaleDateString()
        } : undefined
      );
      return;
    }

    // ledger report excel
    if (!ledger || !appliedFilters?.entityId) return
    generateLedgerExcel(entityName, detailRows)
  }

  // determine if we're in transaction report mode
  const isTransactionReport = appliedFilters?.reportType === ReportType.TRANSACTION_REPORT
  const isLedgerReport = appliedFilters?.reportType === ReportType.CUSTOMER_LEDGER || appliedFilters?.reportType === ReportType.VENDOR_LEDGER
  const isExpenseReport = appliedFilters?.reportType === ReportType.EXPENSE_REPORT

  // determine loading state
  const isLoading = isTransactionReport
    ? isTransactionLoading
    : isExpenseReport
      ? isExpensesLoading
      : isLedgerLoading

  // determine if we have data to show
  const hasData = isTransactionReport
    ? (transactionData?.data && transactionData.data.length > 0)
    : isExpenseReport
      ? (expensesdata && expensesdata.length > 0)
      : (detailRows.length > 0 && ledger)

  return (
    <Main>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Reports</h2>
          <p className="text-sm text-muted-foreground">Comprehensive business reports</p>
        </div>
      </div>

      <div className="flex items-end gap-4 flex-wrap p-4">
        {/* date range input */}
        <div>
          <label className="text-sm font-medium mb-1 block">Date Range</label>
          <DateRangeSearch
            value={dateRange}
            onDateChange={(from, to) => setDateRange(from && to ? { from, to } : undefined)}
          />
        </div>

        {/* report type select box */}
        <div>
          <label className="text-sm font-medium mb-1 block">Report Type</label>
          <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)} disabled={!isReportTypeEnabled}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(ReportType).map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* transaction type select box */}
        {reportType === ReportType.TRANSACTION_REPORT && (
          <div>
            <label className="text-sm font-medium mb-1 block">Transaction Type</label>
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* customer/vendor select box - Only show for CUSTOMER_LEDGER and VENDOR_LEDGER */}
        {isEntityEnabled &&
          (reportType === ReportType.CUSTOMER_LEDGER || reportType === ReportType.VENDOR_LEDGER) && (
            <div>
              <label className="text-sm font-medium mb-1 block">
                {reportType === ReportType.CUSTOMER_LEDGER ? "Select Customer" : "Select Vendor"}
              </label>
              <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={`Select ${reportType === ReportType.CUSTOMER_LEDGER ? "Customer" : "Vendor"}`} />
                </SelectTrigger>
                <SelectContent>
                  {reportType === ReportType.CUSTOMER_LEDGER &&
                    customerResponse?.customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  {reportType === ReportType.VENDOR_LEDGER &&
                    vendorResponse?.data.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

        {/* search button */}
        <Button
          onClick={handleSearch}
          disabled={
            !reportType ||
            !dateRange?.from ||
            (reportType === ReportType.TRANSACTION_REPORT && !transactionType) ||
            ((reportType === ReportType.CUSTOMER_LEDGER || reportType === ReportType.VENDOR_LEDGER) && !selectedEntityId)
          }
          className="flex gap-2"
        >
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>

      {/* cards data for customer/vendor ledger */}
      {appliedFilters && isLedgerReport && hasData && ledger && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <ReportCard label="Total Amount" value={ledger.totalAmount} />
          <ReportCard label="Total Paid" value={ledger.totalPaid} />
          <ReportCard label="Advance Paid" value={ledger.totalAdvancePaid} />
          <ReportCard label="Total Pending" value={ledger.totalPending} />
        </div>
      )}

      {/* card data for transaction reports */}
      {appliedFilters && isTransactionReport && hasData && transactionData?.data && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <ReportCard
            label="Total Amount"
            value={transactionData.data.reduce(
              (sum: number, t: TransactionReportItem) => sum + t.totalAmount, 0)}
          />
          <ReportCard
            label="Total Paid"
            value={transactionData.data.reduce(
              (sum: number, t: TransactionReportItem) => sum + t.paid, 0)}
          />
          <ReportCard
            label="Advance Paid"
            value={transactionData.data.reduce(
              (sum: number, t: TransactionReportItem) => sum + t.advancePaid, 0)}
          />
          <ReportCard
            label="Total Due"
            value={transactionData.data.reduce(
              (sum: number, t: TransactionReportItem) => sum + t.pending, 0)}
          />
        </div>
      )}

      {/* card expense*/}
      {appliedFilters && isExpenseReport && hasData && expensesdata && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <ReportCard
            label="Total Expenses"
            value={expensesdata.reduce((s: number, e: ExpenseReportItem) => s + e.amount, 0)}
          />
        </div>
      )}

      {/* loading state */}
      {isLoading && <Loader />}

      {/* empty state */}
      {appliedFilters && !isLoading && !hasData && (
        <NoDataFound
          message="No Transactions Found"
          details="No data matches your selected filters and date range."
        />
      )}

      {/* transaction report table */}
      {appliedFilters && !isLoading && isTransactionReport && transactionData?.data && transactionData.data.length > 0 && (
        <ReportTable<TransactionReportItem>
          data={transactionData.data}
          columns={TransactionReportColumns}
          pageIndex={0}
          pageSize={10}
          total={transactionData.total ?? 0}
          onPageChange={(page) => console.log('Change page:', page)}
          onDownloadPdf={handleDownloadPdf}
          onDownloadExcel={handleDownloadExcel}
          title="Transaction Report"
        />
      )}

      {/* ledger report table */}
      {appliedFilters && !isLoading && isLedgerReport && detailRows.length > 0 && ledger && (
        <ReportTable<TransactionLedgerDetailItem>
          data={detailRows}
          columns={LedgerReportColumns}
          pageIndex={0}
          pageSize={10}
          total={ledger.total}
          onPageChange={(page) => console.log('Change page:', page)}
          onDownloadPdf={handleDownloadPdf}
          onDownloadExcel={handleDownloadExcel}
          entityName={entityName}
          title="Ledger Details"
        />
      )}

      {/* expenses table */}
      {appliedFilters && !isLoading && isExpenseReport && expensesdata && expensesdata.length > 0 && (
        <ReportTable<ExpenseReportItem>
          data={expensesdata}
          columns={ExpensesReportColumns}
          pageIndex={0}
          pageSize={10}
          total={expensesdata.length}
          title="Expenses Report"
          onPageChange={() => { }}
          onDownloadPdf={handleDownloadPdf}
          onDownloadExcel={handleDownloadExcel}
        />
      )}
    </Main>
  )
}

export default Reports