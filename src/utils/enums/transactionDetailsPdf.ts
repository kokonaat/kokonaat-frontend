import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Transaction } from "@/interface/transactionInterface";

const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "Company Name";

// Format date as DD/MM/YYYY, HH:MM:SS
const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
};

export const generateTransactionDetailsPDF = (
    transaction: Transaction,
    shopName: string
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let startY = 20;

    // --- Header Section ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(shopName.toUpperCase(), pageWidth / 2, startY, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Transaction Details", pageWidth / 2, startY + 7, { align: "center" });

    startY += 15;
    doc.setLineWidth(0.5);
    doc.line(14, startY, pageWidth - 14, startY);
    startY += 10;

    // --- Transaction Information Section ---
    // Two-column layout: Left (14) and Right (pageWidth - 14 for right edge)
    const leftX = 14;
    const rightX = pageWidth - 14;
    let leftY = startY;
    let rightY = startY;

    // Left column: Transaction #, Type, Payment Type, Status
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Transaction #${transaction.no}`, leftX, leftY);
    leftY += 8;

    // Type (no colored background)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Type: ${transaction.transactionType}`, leftX, leftY);
    leftY += 7;

    // Payment Type
    const paymentType = (transaction.paymentType ?? "N/A").replace("_", " ");
    doc.text(`Payment Type: ${paymentType}`, leftX, leftY);
    leftY += 7;

    // Status
    doc.text(`Status: ${transaction.transactionStatus ?? "Pending"}`, leftX, leftY);
    leftY += 7;

    // Right column: Name, Created At, Remarks (aligned to right edge of page)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const name = transaction.vendor?.name ?? transaction.customer?.name ?? "N/A";
    doc.text(`Name: ${name}`, rightX, rightY, { align: "right" });
    rightY += 7;

    // Created At
    doc.text(`Created At: ${formatDateTime(transaction.createdAt)}`, rightX, rightY, { align: "right" });
    rightY += 7;

    // Remarks
    const remarks = transaction.remarks || "N/A";
    doc.text(`Remarks:`, rightX, rightY, { align: "right" });
    rightY += 7;
    const remarksLines = doc.splitTextToSize(remarks, pageWidth / 2 - 20);
    doc.text(remarksLines, rightX, rightY, { align: "right" });
    rightY += remarksLines.length * 5;

    // Update startY to the maximum of leftY and rightY for next section
    startY = Math.max(leftY, rightY) + 5;

    // --- Transaction Details Table ---
    if (transaction.details && transaction.details.length > 0) {
        startY += 5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Transaction Details", 14, startY);
        startY += 8;

        // Prepare table data
        const tableRows = transaction.details.map((detail) => [
            detail.inventory?.name ?? "N/A",
            Number(detail.quantity || 0).toFixed(2),
            `${Number(detail.price || 0).toFixed(2)}`,
            `${Number(detail.total || 0).toFixed(2)}`,
        ]);

        // Calculate subtotal (sum of all item totals)
        const subtotal = transaction.details.reduce((sum, detail) => sum + Number(detail.total || 0), 0);
        const total = transaction.totalAmount || subtotal;
        const pending = transaction.pending || 0;
        const balance = transaction.paid || 0;

        // Add summary rows at the end
        tableRows.push(
            ["", "", "Sub Total:", `${subtotal.toFixed(2)}`],
            ["", "", "Total:", `${total.toFixed(2)}`],
            ["", "", "Pending:", `${pending.toFixed(2)}`],
            ["", "", "Balance:", `${balance.toFixed(2)}`]
        );

        autoTable(doc, {
            startY: startY,
            head: [["Inventory", "Quantity", "Price", "Total"]],
            body: tableRows,
            theme: "striped",
            headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: "center" },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 40, halign: "right" },
                2: { cellWidth: 40, halign: "right" },
                3: { cellWidth: 40, halign: "right" },
            },
            styles: { fontSize: 9 },
            didParseCell: (dataCell) => {
                const rowIndex = dataCell.row.index;
                const totalRows = tableRows.length;
                // Style the summary rows (last 4 rows)
                if (rowIndex >= totalRows - 4) {
                    dataCell.cell.styles.fontStyle = "bold";
                    if (rowIndex === totalRows - 1) {
                        // Last row (Balance) gets a different background
                        dataCell.cell.styles.fillColor = [240, 240, 240];
                    } else {
                        // Other summary rows get light grey background
                        dataCell.cell.styles.fillColor = [248, 250, 252];
                    }
                }
            },
        });
    }

    // --- Footer ---
    const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text(
            `Powered by ${COMPANY_NAME}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
        );
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }

    const fileName = `Transaction_${transaction.no}_${Date.now()}.pdf`;
    doc.save(fileName);
};
