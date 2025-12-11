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
    advancePaid: number;
}

interface Summary {
    totalAmount: number;
    totalAdvancePaid: number;
    totalPaid?: number;
    totalPending?: number;
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

// Value extractors
const getItemName = (item: TransactionDetail): string =>
    item.inventory?.name || item.itemName || item.name || "N/A";

const getQuantity = (item: TransactionDetail): number =>
    item.quantity ?? item.qty ?? 0;

const getPrice = (item: TransactionDetail): number =>
    item.price ?? item.unitPrice ?? 0;

const getTotal = (item: TransactionDetail): number => {
    if (item.total != null) return item.total;
    if (item.amount != null) return item.amount;
    return getQuantity(item) * getPrice(item);
};

// Remove currency sign, Taka will be added in summary
const formatNumber = (num: number) => num.toFixed(2);

export const generatePDF = (
    entity: Entity,
    transactions: Transaction[],
    summary: Summary
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    const shopNameWidth = doc.getTextWidth(entity.shop.name);
    doc.text(entity.shop.name, (pageWidth - shopNameWidth) / 2, 15);

    if (entity.shop.address) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        const shopAddressWidth = doc.getTextWidth(entity.shop.address);
        doc.text(entity.shop.address, (pageWidth - shopAddressWidth) / 2, 22);
    }

    // Report Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    const reportTitle = "Transaction Report";
    doc.text(reportTitle, pageWidth / 2, 28, { align: "center" });

    // Entity Info - Date left, Customer/Vendor right
    const firstTrx = transactions[0];
    let entityLabel = "Customer / Vendor: N/A";
    if (firstTrx.customer) entityLabel = `Customer: ${firstTrx.customer.name}`;
    else if (firstTrx.vendor) entityLabel = `Vendor: ${firstTrx.vendor.name}`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    const leftX = 14; // left margin
    const rightX = pageWidth - 14; // right margin
    const y = 45; // vertical position

    doc.text(`Date: ${new Date().toLocaleDateString()}`, leftX, y);
    doc.text(entityLabel, rightX, y, { align: "right" });

    // Contact info (phone/email) below right-aligned
    let contactInfo = "";
    // if (entity.email) contactInfo += `Email: ${entity.email}`;
    if (entity.phone) contactInfo += contactInfo ? ` | Phone: ${entity.phone}` : `Phone: ${entity.phone}`;
    if (contactInfo) doc.text(contactInfo, rightX, y + 7, { align: "right" });

    // Table
    const rows = transactions.flatMap(trx =>
        trx.details.map(item => [
            getItemName(item),
            getQuantity(item),
            formatNumber(getPrice(item)),
            formatNumber(getTotal(item))
        ])
    );

    autoTable(doc, {
        startY: 65,
        head: [["Item Name", "Quantity", "Price", "Total"]],
        body: rows,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold", halign: "center" },
        bodyStyles: { fontSize: 11 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
            0: { halign: "left" },
            1: { halign: "center" },
            2: { halign: "center" },
            3: { halign: "center" },
        }
    });

    // Summary Box
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const boxWidth = 76;
    const boxHeight = 32;
    const boxX = pageWidth - boxWidth - 14;
    const boxY = finalY;

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(boxX, boxY, boxWidth, boxHeight);

    const summaryLines = [
        `Subtotal: ${formatNumber(summary.totalAmount)} Taka`,
        `Paid: ${formatNumber(summary.totalPaid ?? 0)} Taka`,
        `Advance Paid: ${formatNumber(summary.totalAdvancePaid)} Taka`,
        `Total Payable: ${formatNumber(summary.totalAmount - ((summary.totalPaid ?? 0) + summary.totalAdvancePaid))} Taka`
    ];

    summaryLines.forEach((line, i) => {
        doc.setFont("helvetica", i === summaryLines.length - 1 ? "bold" : "normal"); // bold last line
        doc.text(line, pageWidth - 16, boxY + 7 + i * 7, { align: "right" });
    });

    // Footer
    const footerPrefix = "Powered by ";
    const footerCompany = COMPANY_NAME || "Your Company";

    doc.setFontSize(10);
    const prefixWidth = doc.getTextWidth(footerPrefix);
    const companyWidth = doc.getTextWidth(footerCompany);
    const totalWidth = prefixWidth + companyWidth;
    const startX = (pageWidth - totalWidth) / 2;
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - 10;

    doc.setFont("helvetica", "normal");
    doc.text(footerPrefix, startX, footerY);
    doc.setFont("helvetica", "bold");
    doc.text(footerCompany, startX + prefixWidth, footerY);

    // Page number
    doc.setFont("helvetica", "normal");
    doc.text("Page 1 of 1", pageWidth - 14, footerY, { align: "right" });

    // Save PDF
    doc.save(`Transaction_Report_${entity.name}.pdf`);
}