import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { TransactionLedgerDetailItem } from "@/interface/reportInterface";

export const generateLedgerExcel = (
    entityName: string,
    data: TransactionLedgerDetailItem[]
) => {
    // Map data to plain objects for Excel
    const rows = data.map((item) => ({
        Date: new Date(item.createdAt).toLocaleDateString(),
        "Transaction No": item.transactionNo,
        Item: item.inventoryName,
        UOM: item.unitOfMeasurement?.name || "N/A",
        Type: item.transactionType,
        Quantity: item.quantity,
        Price: item.price,
        Total: item.total,
        "Payment Type": item.paymentType,
        Customer: item.customerName,
    }));

    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(rows);

    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ledger");

    // Generate Excel file and save
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Ledger_${entityName.replace(/\s+/g, "_")}_${Date.now()}.xlsx`);
}