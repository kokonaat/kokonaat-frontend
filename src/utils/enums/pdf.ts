import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "Company Name";

interface Inventory {
    id: string;
    name: string;
}

interface TransactionDetail {
    id: string;
    no: string;
    quantity?: number | null;
    price?: number | null;
    total?: number | null;
    inventory?: Inventory | null;
    [key: string]: any;
}

interface Transaction {
    id: string;
    no: string;
    transactionType: string;
    paymentType: string;
    customer?: { id: string; name: string };
    vendor?: { id: string; name: string };
    details: TransactionDetail[];
    totalAmount: number;
    paid: number;
    createdAt: string;
}

interface Summary {
    totalAmount: number;
    totalPaid: number;
}

export interface Entity {
    name: string;
    no: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    shop: {
        name: string;
        address?: string;
    };
}

// --- Helper Functions ---
const getItemName = (item: TransactionDetail) =>
    item.inventory?.name || item.itemName || item.name || "N/A";

const getQuantity = (item: TransactionDetail) =>
    Number(item.quantity ?? item.qty ?? 0);

const getPrice = (item: TransactionDetail) =>
    Number(item.price ?? item.unitPrice ?? 0);

const getTotal = (item: TransactionDetail) => {
    if (item.total != null) return Number(item.total);
    if (item.amount != null) return Number(item.amount);
    return getQuantity(item) * getPrice(item);
};

const formatNumber = (num: number | string | undefined | null) => {
    const n = Number(num) || 0;
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// --- Main PDF Function ---
export const generatePDF = (
    entity: Entity,
    transactions: Transaction[],
    summary: Summary,
    // dateRange?: { from: string; to: string }
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(entity.shop.name.toUpperCase(), pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Transaction Report", pageWidth / 2, 22, { align: "center" });

    // --- Info Section ---
    doc.setLineWidth(0.5);
    doc.line(14, 28, pageWidth - 14, 28);

    // Determine account label (Customer / Vendor / Account Holder)
    let accountLabel = "Account Holder:";
    let accountName = entity.name;

    if (transactions.length > 0) {
        const firstTrx = transactions[0];
        if (firstTrx.customer) {
            accountLabel = "Customer:";
            accountName = firstTrx.customer.name;
        } else if (firstTrx.vendor) {
            accountLabel = "Vendor:";
            accountName = firstTrx.vendor.name;
        }
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(accountLabel, 14, 38);
    doc.setFont("helvetica", "normal");
    doc.text(accountName, 30, 38);

    doc.setFont("helvetica", "bold");
    doc.text(`Generated On:`, pageWidth - 34, 38, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString(), pageWidth - 14, 38, { align: "right" });

    // Optional contact info
    if (entity.phone) {
        doc.setFont("helvetica");
        doc.setFont("helvetica", "bold");
        doc.text(`Phone: ${entity.phone}`, pageWidth - 14, 46, { align: "right" });
    }

    // --- Table Section ---
    const tableRows = transactions.flatMap(trx =>
        trx.details.map(item => [
            new Date(trx.createdAt).toLocaleDateString(),
            trx.no,
            getItemName(item),
            trx.transactionType,
            getQuantity(item).toString(),
            formatNumber(getPrice(item)),
            formatNumber(getTotal(item)),
        ])
    );

    // Calculate subtotal for Qty and Total
    const subtotalQty = transactions.flatMap(trx => trx.details.map(getQuantity))
        .reduce((acc, q) => acc + q, 0);

    const subtotalTotal = transactions.flatMap(trx => trx.details.map(getTotal))
        .reduce((acc, t) => acc + t, 0);

    // Add subtotal row
    tableRows.push([
        "", "", "", "Subtotal", subtotalQty.toString(), "", formatNumber(subtotalTotal)
    ]);

    autoTable(doc, {
        startY: 60,
        head: [["Date", "Trx No", "Item", "Type", "Qty", "Price", "Total"]],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [51, 65, 85], textColor: 255, halign: "center" },
        columnStyles: {
            0: { cellWidth: 25 },
            5: { halign: "right" },
            6: { halign: "right" },
        },
        styles: { fontSize: 9 },
        didParseCell: (dataCell) => {
            // Bold the subtotal row
            if (dataCell.row.index === tableRows.length - 1) {
                dataCell.cell.styles.fontStyle = "bold";
            }
        },
    });

    // --- Summary Box ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const summaryX = pageWidth - 80;

    doc.setFillColor(248, 250, 252);
    doc.rect(summaryX, finalY, 66, 28, "F");
    doc.setDrawColor(226, 232, 240);
    doc.rect(summaryX, finalY, 66, 28, "S");

    const drawRow = (label: string, value: number, y: number, isBold = false) => {
        if (isBold) doc.setFont("helvetica", "bold");
        doc.text(label, summaryX + 2, y);
        doc.text(`${formatNumber(value)} Taka`, pageWidth - 16, y, { align: "right" });
        doc.setFont("helvetica", "normal");
    };

    drawRow("Total Amount:", summary.totalAmount, finalY + 7);
    drawRow("Total Paid:", summary.totalPaid, finalY + 14);

    doc.setDrawColor(200);
    doc.line(summaryX + 2, finalY + 17, pageWidth - 16, finalY + 17);
    drawRow("Balance Due:", summary.totalAmount - summary.totalPaid, finalY + 24, true);

    // --- Footer ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.text(`Powered by ${COMPANY_NAME}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }

    // --- Save PDF ---
    doc.save(`Transaction_Report_${entity.name.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
}