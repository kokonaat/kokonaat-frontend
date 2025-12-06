import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || "Company Name"

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
    shop: {
        name: string;
        address?: string;
    };
}

// value extractor
const getItemName = (item: TransactionDetail): string => {
    return item.inventory?.name || item.itemName || item.name || "N/A"
}

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
    const reportTitle = "Transaction Report"
    const reportTitleWidth = doc.getTextWidth(reportTitle)
    doc.text(reportTitle, (pageWidth - reportTitleWidth) / 2, 35)

    // date
    doc.setFontSize(12)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 45)

    // customer / vendor
    const entityLabel = `Customer / Vendor: ${entity.name}`
    const entityWidth = doc.getTextWidth(entityLabel)
    doc.text(entityLabel, pageWidth - entityWidth - 14, 45)

    // table
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

    autoTable(doc, {
        startY: 60,
        head: [["Item Name", "Quantity", "Price", "Total"]],
        body: rows,
    })

    // summary
    const finalY = (doc as any).lastAutoTable.finalY + 10
    const rightMargin = pageWidth - 36

    doc.setFontSize(11)
    const lines = [
        `Subtotal: ${summary.totalAmount}`,
        `Paid: ${summary.totalPaid ?? 0}`,
        `Advance Paid: ${summary.totalAdvancePaid}`,
        `Total Payable: ${summary.totalAmount - ((summary.totalPaid ?? 0) + summary.totalAdvancePaid)}`,
    ]

    lines.forEach((line, index) => {
        const lineWidth = doc.getTextWidth(line)
        doc.text(line, rightMargin - lineWidth, finalY + 10 + index * 7)
    })

    // footer
    // split into two parts
    const footerPrefix = "Powered by "
    const footerCompany = COMPANY_NAME || "Your Company"

    doc.setFontSize(10)

    // get width with positioning
    const prefixWidth = doc.getTextWidth(footerPrefix)
    const companyWidth = doc.getTextWidth(footerCompany)
    const totalWidth = prefixWidth + companyWidth

    // calculate starting X to center the full footer
    const startX = (pageWidth - totalWidth) / 2
    const pageHeight = doc.internal.pageSize.getHeight()
    const footerY = pageHeight - 10

    // draw normal prefix
    doc.setFont("helvetica", "normal")
    doc.text(footerPrefix, startX, footerY)

    // draw bold company name right after prefix
    doc.setFont("helvetica", "bold")
    doc.text(footerCompany, startX + prefixWidth, footerY)

    // reset font style if needed
    doc.setFont("helvetica", "normal")

    // save PDF
    doc.save(`Transaction_Report_${entity.name}.pdf`)
}