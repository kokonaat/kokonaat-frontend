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
import { ReportType } from "@/utils/enums/reportType"
import { useShopStore } from "@/stores/shopStore"
import { useCustomerList } from "@/hooks/useCustomer"
import { useVendorList } from "@/hooks/useVendor"
import { useTransactionLedger } from "@/hooks/useTransaction"
import { ReportCard } from "@/components/report/ReportCard"
import { ReportTable } from "@/components/report/ReportTable"
import { ReportColumns } from "@/components/report/ReportColumns"
import type { TransactionLedgerDetailItem, TransactionLedgerItem } from "@/interface/reportInterface"
import { generateLedgerPDF } from "@/utils/enums/customerOrVendorLedgerPdf"
import { NoDataFound } from "@/components/NoDataFound"

const Reports = () => {
  const shopId = useShopStore((s) => s.currentShopId) ?? ""
  const page = 1
  const limit = 10

  const [reportType, setReportType] = useState<ReportType>()
  const [selectedEntityId, setSelectedEntityId] = useState<string>()
  const [dateRange, setDateRange] = useState<DateRange>()

  const isReportTypeEnabled = !!dateRange?.from && !!dateRange?.to
  const isEntityEnabled = isReportTypeEnabled && !!reportType

  const { data: customerResponse } = useCustomerList(
    shopId, page, limit, undefined, undefined, undefined,
    { enabled: reportType === ReportType.CUSTOMER_LEDGER && isEntityEnabled }
  )

  const { data: vendorResponse } = useVendorList(
    shopId, page, limit, undefined, undefined, undefined,
    { enabled: reportType === ReportType.VENDOR_LEDGER && isEntityEnabled }
  )

  const { data: ledger, isLoading } = useTransactionLedger(
    shopId,
    page,
    selectedEntityId ?? "",
    limit,
    dateRange?.from ? dateRange.from.toISOString() : undefined,
    dateRange?.to ? dateRange.to.toISOString() : undefined
  )

  useEffect(() => {
    setReportType(undefined)
    setSelectedEntityId(undefined)
  }, [dateRange])

  useEffect(() => {
    setSelectedEntityId(undefined)
  }, [reportType])

  const detailRows: TransactionLedgerDetailItem[] = ledger?.transactions.flatMap(
    (tran: TransactionLedgerItem) =>
      tran.details.map((det) => ({
        id: det.id,
        transactionNo: tran.no,
        createdAt: tran.createdAt,
        transactionType: tran.transactionType,
        entityName: tran.customer?.name ?? tran.vendor?.name ?? "", // unified field
        inventoryName: det.inventory?.name ?? "",
        quantity: det.quantity?.toString() ?? "0",
        price: det.price?.toString() ?? "0",
        total: det.total?.toString() ?? "0",
        paymentType: tran.paymentType,
        unitOfMeasurement: det.unitOfMeasurement,
      }))
  ) ?? []

  // Add this inside your Reports component, above the return:
  const entityName = selectedEntityId
    ? reportType === ReportType.CUSTOMER_LEDGER
      ? customerResponse?.customers.find(c => c.id === selectedEntityId)?.name ?? "Customer"
      : vendorResponse?.data.find(v => v.id === selectedEntityId)?.name ?? "Vendor"
    : "Unknown";

  const handleDownloadPdf = () => {
    if (!ledger || !selectedEntityId) return;

    let entityName = "Unknown";
    if (reportType === ReportType.CUSTOMER_LEDGER) {
      entityName = customerResponse?.customers.find(c => c.id === selectedEntityId)?.name ?? "Customer";
    } else {
      entityName = vendorResponse?.data.find(v => v.id === selectedEntityId)?.name ?? "Vendor";
    }

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
      dateRange?.from && dateRange?.to ? {
        from: dateRange.from.toLocaleDateString(),
        to: dateRange.to.toLocaleDateString()
      } : undefined,
      reportType === ReportType.CUSTOMER_LEDGER ? "customer" : "vendor"
    );
  }

  return (
    <Main>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Reports</h2>
          <p className="text-sm text-muted-foreground">Customer & vendor ledger reports</p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        {/* date range */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Date Range</label>
          <DateRangeSearch
            value={dateRange}
            onDateChange={(from, to) => setDateRange(from && to ? { from, to } : undefined)}
          />
        </div>

        {/* reoort type */}
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Report Type</label>
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

        {/* csutomer/vendor list */}
        {isEntityEnabled && (
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">
              {reportType === ReportType.CUSTOMER_LEDGER ? "Select Customer" : "Select Vendor"}
            </label>

            <Select
              value={selectedEntityId}
              onValueChange={setSelectedEntityId}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={`Select ${reportType === ReportType.CUSTOMER_LEDGER ? "Customer" : "Vendor"}`} />
              </SelectTrigger>

              <SelectContent>
                {reportType === ReportType.CUSTOMER_LEDGER &&
                  customerResponse?.customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}

                {reportType === ReportType.VENDOR_LEDGER &&
                  vendorResponse?.data.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* card data */}
      {detailRows.length > 0 && selectedEntityId && ledger && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <ReportCard label="Total Amount" value={ledger.totalAmount} />
          <ReportCard label="Total Paid" value={ledger.totalPaid} />
          <ReportCard label="Total Pending" value={ledger.totalPending} />
          <ReportCard label="Advance Paid" value={ledger.totalAdvancePaid} />
        </div>
      )}

      {isLoading && <p className="mt-6 text-muted-foreground">Loading transactions...</p>}

      {/* if selected customer or vendor has no transaction */}
      {selectedEntityId &&
        !isLoading &&
        ledger &&
        detailRows.length === 0 && (
          <NoDataFound
            message="No Transactions Found"
            details={`This ${reportType === ReportType.CUSTOMER_LEDGER ? "customer" : "vendor"} has no transactions in the selected date range.`}
          />
        )}

      {/* table data */}
      {detailRows.length > 0 && selectedEntityId && ledger && (
        <ReportTable
          data={detailRows}
          columns={ReportColumns}
          pageIndex={0}
          pageSize={10}
          total={ledger.total}
          onPageChange={(page) => console.log('Change page:', page)}
          onDownloadPdf={handleDownloadPdf}
          entityName={entityName}
        />
      )}
    </Main>
  )
}

export default Reports