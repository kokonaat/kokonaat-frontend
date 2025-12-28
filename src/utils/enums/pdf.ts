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
    pending: number;
    createdAt: string;
}

interface Summary {
    totalAmount: number;
    totalPaid: number;
}

export interface Entity {
    name: string;
    no?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    shop: {
        name: string;
        address?: string | null;
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
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(entity.shop.name.toUpperCase(), pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Transaction Report with Details", pageWidth / 2, 22, { align: "center" });

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
        doc.setFont("helvetica", "bold");
        doc.text(`Phone: ${entity.phone}`, pageWidth - 14, 46, { align: "right" });
        doc.setFont("helvetica", "normal");
    }

    // --- Table Section with Details ---
    const tableRows: any[] = [];
    let subtotalQty = 0;
    let subtotalTotal = 0;

    transactions.forEach(trx => {
        // Transaction Header Row
        tableRows.push([
            {
                content: new Date(trx.createdAt).toLocaleDateString(),
                styles: { fontStyle: 'bold', fillColor: [241, 245, 249] }
            },
            {
                content: trx.no,
                styles: { fontStyle: 'bold', fillColor: [241, 245, 249] }
            },
            {
                content: trx.transactionType,
                styles: { fontStyle: 'bold', fillColor: [241, 245, 249] }
            },
            {
                content: trx.paymentType || '-',
                styles: { fontStyle: 'bold', fillColor: [241, 245, 249] }
            },
            {
                content: '',
                styles: { fillColor: [241, 245, 249] }
            },
            {
                content: '',
                styles: { fillColor: [241, 245, 249] }
            },
            {
                content: formatNumber(trx.totalAmount),
                styles: { fontStyle: 'bold', fillColor: [241, 245, 249], halign: 'right' }
            },
        ]);

        // Handle transactions with details (PURCHASE, SALE, etc.)
        if (trx.details && trx.details.length > 0) {
            trx.details.forEach((item, idx) => {
                const qty = getQuantity(item);
                const total = getTotal(item);

                subtotalQty += qty;
                subtotalTotal += total;

                // Item row (indented)
                tableRows.push([
                    '',
                    `  ${idx + 1}.`,
                    `  ${getItemName(item)}`,
                    '',
                    qty.toString(),
                    formatNumber(getPrice(item)),
                    formatNumber(total),
                ]);
            });

            // Transaction Summary Row (Paid/Pending)
            tableRows.push([
                '',
                '',
                {
                    content: `  Paid: ${formatNumber(trx.paid)} | Pending: ${formatNumber(trx.pending)}`,
                    colSpan: 3,
                    styles: { fontStyle: 'italic', textColor: [100, 116, 139] }
                },
                '',
                '',
                '',
                ''
            ]);
        } else {
            // Handle transactions without details (PAYMENT, RECEIVABLE, COMMISSION)
            const amount = trx.paid || trx.totalAmount || 0;
            subtotalTotal += amount;

            tableRows.push([
                '',
                '',
                `  ${trx.transactionType}`,
                '',
                '-',
                '-',
                formatNumber(amount),
            ]);

            // Payment details
            if (trx.paid > 0) {
                tableRows.push([
                    '',
                    '',
                    {
                        content: `  Paid: ${formatNumber(trx.paid)}`,
                        colSpan: 3,
                        styles: { fontStyle: 'italic', textColor: [100, 116, 139] }
                    },
                    '',
                    '',
                    '',
                    ''
                ]);
            }
        }

        // Add spacing row between transactions
        tableRows.push([
            { content: '', colSpan: 7, styles: { minCellHeight: 2, fillColor: [255, 255, 255] } },
            '', '', '', '', '', ''
        ]);
    });

    // Add subtotal row
    tableRows.push([
        '',
        '',
        '',
        {
            content: 'Subtotal',
            styles: { fontStyle: 'bold', fillColor: [226, 232, 240] }
        },
        {
            content: subtotalQty > 0 ? subtotalQty.toString() : '-',
            styles: { fontStyle: 'bold', fillColor: [226, 232, 240], halign: 'center' }
        },
        {
            content: '',
            styles: { fillColor: [226, 232, 240] }
        },
        {
            content: formatNumber(subtotalTotal),
            styles: { fontStyle: 'bold', fillColor: [226, 232, 240], halign: 'right' }
        }
    ]);

    autoTable(doc, {
        startY: 60,
        head: [["Date", "Trx No", "Description", "Payment", "Qty", "Price", "Amount"]],
        body: tableRows,
        theme: "plain",
        headStyles: {
            fillColor: [51, 65, 85],
            textColor: 255,
            halign: "center",
            fontStyle: 'bold',
            fontSize: 9
        },
        columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 22 },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 25 },
            4: { halign: "center", cellWidth: 15 },
            5: { halign: "right", cellWidth: 22 },
            6: { halign: "right", cellWidth: 25 },
        },
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        alternateRowStyles: {
            fillColor: [255, 255, 255]
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