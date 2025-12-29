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
    doc.setFontSize(22);
    doc.text(shopName.toUpperCase(), pageWidth / 2, 18, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Transaction Details", pageWidth / 2, 25, { align: "center" });

    // --- Divider Line ---
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(14, 30, pageWidth - 14, 30);
    startY = 40;

    // --- Transaction Information Section ---
    // Two-column layout: Left (14) and Right (pageWidth - 14 for right edge)
    const leftX = 14;
    const rightX = pageWidth - 14;
    let leftY = startY;
    let rightY = startY;

    // Left column: Transaction #, Type, Payment Type, Status
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Transaction #${transaction.no}`, leftX, leftY);
    leftY += 8;

    // Type
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
    startY = Math.max(leftY, rightY) + 8;

    // --- Transaction Details Table ---
    if (transaction.details && transaction.details.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Transaction Details", 14, startY);
        startY += 8;

        // Helper function to format numbers
        const formatNumber = (num: number | string | undefined | null) => {
            const n = Number(num) || 0;
            return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        // Prepare table data
        const tableRows = transaction.details.map((detail) => [
            detail.inventory?.name ?? "N/A",
            formatNumber(detail.quantity || 0),
            formatNumber(detail.price || 0),
            formatNumber(detail.total || 0),
        ]);

        // Calculate subtotal (sum of all item totals)
        const subtotal = transaction.details.reduce((sum, detail) => sum + Number(detail.total || 0), 0);
        const total = transaction.totalAmount || subtotal;
        const pending = transaction.pending || 0;
        const balance = transaction.paid || 0;

        autoTable(doc, {
            startY: startY,
            head: [["Inventory", "Quantity", "Price", "Total"]],
            body: tableRows,
            theme: "plain",
            headStyles: {
                fillColor: [31, 41, 55],
                textColor: 255,
                halign: "center",
                fontStyle: 'bold',
                fontSize: 9,
                cellPadding: 3
            },
            columnStyles: {
                0: { cellWidth: 70, halign: "left" },
                1: { cellWidth: 35, halign: "right" },
                2: { cellWidth: 35, halign: "right" },
                3: { cellWidth: 40, halign: "right" },
            },
            styles: {
                fontSize: 8,
                cellPadding: 2.5,
                lineColor: [229, 231, 235],
                lineWidth: 0.1
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255]
            },
        });

        // --- Summary Section (white background with black borders) ---
        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
        const summaryX = pageWidth - 90;
        const summaryWidth = 76;
        const summaryHeight = 32;
        const padding = 6;

        // Draw summary box with white background and black border only
        doc.setFillColor(255, 255, 255);
        doc.rect(summaryX, finalY, summaryWidth, summaryHeight, "F");
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(summaryX, finalY, summaryWidth, summaryHeight, "S");

        const drawRow = (label: string, value: number, y: number, isBold = false) => {
            doc.setFont("helvetica", isBold ? "bold" : "normal");
            doc.setFontSize(9);
            
            // Label - black text on white background, with proper padding from border
            doc.setTextColor(0, 0, 0);
            doc.text(label, summaryX + padding, y);
            
            // Value - black text on white background, with proper padding from right border
            doc.setTextColor(0, 0, 0);
            const valueText = formatNumber(value);
            doc.text(valueText, summaryX + summaryWidth - padding, y, { align: "right" });
            
            doc.setFont("helvetica", "normal");
        };

        drawRow("Sub Total:", subtotal, finalY + 8);
        drawRow("Total:", total, finalY + 15);

        // Divider line - black on white background, with proper padding from borders
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(summaryX + padding, finalY + 20, summaryX + summaryWidth - padding, finalY + 20);
        
        drawRow("Pending:", pending, finalY + 27);
        
        // Balance row (if needed, can be added separately)
        // drawRow("Balance:", balance, finalY + 34, true);
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
