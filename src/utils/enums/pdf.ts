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
    // discount?: number;
}

export interface Entity {
    name: string;
    no: string;
    shop: {
        name: string;
        address?: string;
    };
}

// value extractor
const getItemName = (item: TransactionDetail): string => {
    console.log(item)
    return (
        item.inventory?.name ||
        item.itemName ||
        item.name ||
        "N/A"
    );
};

const getQuantity = (item: TransactionDetail): number => {
    if (item.quantity != null) return item.quantity
    if (item.qty != null) return item.qty
    return 0
}

const getPrice = (item: TransactionDetail): number => {
    if (item.price != null) return item.price
    if (item.unitPrice != null) return item.unitPrice
    return 0
}

const getTotal = (item: TransactionDetail): number => {
    if (item.total != null) return item.total
    if (item.amount != null) return item.amount

    // last fallback
    const qty = getQuantity(item)
    const price = getPrice(item)
    return qty * price
}

export const generatePDF = (
    entity: Entity,
    transactions: Transaction[],
    summary: Summary
) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // header
    doc.setFontSize(18)
    const shopNameWidth = doc.getTextWidth(entity.shop.name)
    doc.text(entity.shop.name, (pageWidth - shopNameWidth) / 2, 15)

    doc.setFontSize(12)
    const shopAddress = entity.shop.address || ""
    const shopAddressWidth = doc.getTextWidth(shopAddress)
    doc.text(shopAddress, (pageWidth - shopAddressWidth) / 2, 22)

    doc.setFontSize(16)
    doc.text("Transaction Report", 14, 35)

    doc.setFontSize(12)
    doc.text(`Customer / Vendor: ${entity.name}`, 14, 52)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 45)

    // table data
    const rows: any[] = []
    transactions.forEach((trx) => {
        trx.details.forEach((item) => {
            rows.push([
                getItemName(item),
                getQuantity(item),
                getPrice(item),
                getTotal(item),
            ])
        })
    })

    // table
    autoTable(doc, {
        startY: 70,
        head: [["Item Name", "Quantity", "Price", "Total"]],
        body: rows,
    })

    // summary
    const finalY = (doc as any).lastAutoTable.finalY + 10
    const rightMargin = pageWidth - 36 // 14pt from right edge

    // doc.setFontSize(13)
    // const summaryTitle = "Summary"
    // const summaryTitleWidth = doc.getTextWidth(summaryTitle)
    // doc.text(summaryTitle, rightMargin - summaryTitleWidth, finalY)

    doc.setFontSize(11)
    const lines = [
        `Subtotal: ${summary.totalAmount}`,
        `Paid: ${summary.totalPaid}`,
        `Advance Paid: ${summary.totalAdvancePaid}`,
        `Total Payable: ${summary.totalAmount - (summary.totalPaid ?? 0 + summary.totalAdvancePaid)}`,
    ]

    lines.forEach((line, index) => {
        const lineWidth = doc.getTextWidth(line)
        doc.text(line, rightMargin - lineWidth, finalY + 10 + index * 7)
    })

    // footer
    const footerText = `Powered by ${COMPANY_NAME || "Your Company"}`;
    doc.setFontSize(10);

    const pageHeight = doc.internal.pageSize.getHeight();
    const footerWidth = doc.getTextWidth(footerText);

    doc.text(
        footerText,
        (pageWidth - footerWidth) / 2,
        pageHeight - 10
    );

    doc.save(`Transaction_Report_${entity.name}.pdf`)
}