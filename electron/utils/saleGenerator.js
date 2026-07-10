// electron/utils/saleGenerator.js

const fs = require('fs');
const path = require('path');
const { app, dialog, BrowserWindow } = require('electron');

const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');

// ==================== THEME ====================
const THEME = {
    primary: [5, 150, 105],
    primaryDark: [4, 120, 87],
    primaryLight: [209, 250, 229],
    slate800: [30, 41, 59],
    slate500: [100, 116, 139],
    slate400: [148, 163, 184],
    slate200: [226, 232, 240],
    slate100: [241, 245, 249],
    slate50: [248, 250, 252],
    white: [255, 255, 255],
    red: [220, 38, 38],
    green: [22, 163, 74],
    amber: [217, 119, 6],
};

// ==================== HELPERS ====================
function drawLogo(doc, cx, cy, size) {
    const r = size / 2;
    doc.setFillColor(...THEME.white);
    doc.circle(cx, cy, r, 'F');
    doc.setFillColor(...THEME.primary);
    doc.circle(cx, cy, r - 0.6, 'F');

    doc.setFillColor(...THEME.white);
    const w = size * 0.34;
    const h = size * 0.62;
    doc.lines(
        [
            [w / 2, h / 2],
            [-w / 2, h / 2],
            [-w / 2, -h / 2],
        ],
        cx, cy - h / 2,
        [1, 1], 'F', true
    );
    doc.setDrawColor(...THEME.primary);
    doc.setLineWidth(0.4);
    doc.line(cx, cy - h / 2 + 1, cx, cy + h / 2 - 1);
}

function formatMoney(shopData, value) {
    const currency = shopData?.currency && shopData.currency !== "PKR"
        ? shopData.currency
        : "Rs.";

    const amount = Number(value || 0);

    return `${currency} ${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function drawHeader(doc, { title, docNumberLabel, docNumber, date }, shopData) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const headerHeight = 38;

    doc.setFillColor(...THEME.primary);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
    doc.setFillColor(...THEME.primaryDark);
    doc.rect(0, headerHeight - 1.4, pageWidth, 1.4, 'F');

    drawLogo(doc, 18, headerHeight / 2, 13);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(...THEME.white);
    doc.text(shopData.shop_name || 'My Shop', 28, headerHeight / 2 - 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...THEME.primaryLight);
    if (shopData.address) {
        doc.text(shopData.address, 28, headerHeight / 2 + 3.5, { maxWidth: pageWidth * 0.45 });
    }

    const contactBits = [];
    if (shopData.phone) contactBits.push(`Tel: ${shopData.phone}`);
    if (shopData.email) contactBits.push(shopData.email);
    if (contactBits.length) {
        doc.text(contactBits.join('   |   '), 28, headerHeight / 2 + 8.5);
    }

    const cardW = 62;
    const cardX = pageWidth - 20 - cardW;
    const cardY = 8;
    const cardH = headerHeight - 16;
    doc.setFillColor(...THEME.white);
    doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, 'F');

    doc.setTextColor(...THEME.primaryDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(title, cardX + cardW / 2, cardY + 7, { align: 'center' });

    doc.setDrawColor(...THEME.slate200);
    doc.setLineWidth(0.2);
    doc.line(cardX + 6, cardY + 9.5, cardX + cardW - 6, cardY + 9.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.setTextColor(...THEME.slate500);
    doc.text(docNumberLabel, cardX + 6, cardY + 14.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...THEME.slate800);
    doc.text(docNumber, cardX + cardW - 6, cardY + 14.5, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...THEME.slate500);
    doc.text('Date', cardX + 6, cardY + 19);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...THEME.slate800);
    doc.text(date, cardX + cardW - 6, cardY + 19, { align: 'right' });

    return headerHeight;
}

function drawStatusBadge(doc, x, y, status) {
    const colorMap = {
        completed: THEME.green,
        paid: THEME.green,
        pending: THEME.amber,
        cancelled: THEME.red,
    };
    const c = colorMap[(status || '').toLowerCase()] || THEME.slate500;
    const label = (status || 'PENDING').toUpperCase();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    const textW = doc.getTextWidth(label);
    const padX = 3;
    const w = textW + padX * 2;
    const h = 5.2;
    doc.setFillColor(c[0], c[1], c[2]);
    doc.roundedRect(x - w, y - h + 1.3, w, h, 1.2, 1.2, 'F');
    doc.setTextColor(...THEME.white);
    doc.text(label, x - w / 2, y, { align: 'center' });
}

function drawInfoCard(doc, x, y, w, h, heading, lines) {
    doc.setFillColor(...THEME.slate50);
    doc.setDrawColor(...THEME.slate200);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...THEME.primaryDark);
    doc.text(heading.toUpperCase(), x + 5, y + 6.5);

    doc.setDrawColor(...THEME.primary);
    doc.setLineWidth(0.5);
    doc.line(x + 5, y + 8.5, x + 18, y + 8.5);

    let ly = y + 14;
    lines.forEach((line, i) => {
        if (!line) return;
        if (i === 0) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(...THEME.slate800);
        } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.3);
            doc.setTextColor(...THEME.slate500);
        }
        doc.text(line, x + 5, ly, { maxWidth: w - 10 });
        ly += i === 0 ? 6 : 5;
    });
}

function drawTable(doc, startY, headers, rows, colStyles) {
    autoTable(doc, {
        startY,
        head: [headers],
        body: rows,
        theme: 'plain',
        styles: {
            font: 'helvetica',
            fontSize: 8.7,
            textColor: THEME.slate800,
            cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
            lineColor: THEME.slate200,
            lineWidth: 0.15,
        },
        headStyles: {
            fillColor: THEME.primary,
            textColor: THEME.white,
            fontStyle: 'bold',
            fontSize: 8.3,
            halign: 'center',
            cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
        },
        alternateRowStyles: {
            fillColor: THEME.slate50,
        },
        columnStyles: colStyles,
        margin: { left: 20, right: 20 },
        tableWidth: 'auto',
        pageBreak: 'auto',
        horizontalPageBreak: false,
        horizontalPageBreakBehavior: 'avoid',
    });
    return doc.lastAutoTable.finalY;
}

function drawSummary(doc, x, y, w, rows, totalRow, dueRow) {
    const lineH = 6.5;
    const padding = 8;
    const h = padding * 2 + rows.length * lineH + 4 + lineH + 5 + lineH * 2 + 3;

    doc.setFillColor(...THEME.slate50);
    doc.setDrawColor(...THEME.slate200);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, w, h, 3, 3, 'FD');

    let cy = y + padding + 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.6);

    const labelX = x + padding;
    const valueX = x + w - padding;

    rows.forEach(([label, value]) => {
        doc.setTextColor(...THEME.slate500);
        doc.text(label, labelX, cy);
        doc.setTextColor(...THEME.slate800);
        doc.text(value, valueX, cy, { align: 'right' });
        cy += lineH;
    });

    cy += 1.5;
    doc.setDrawColor(...THEME.slate200);
    doc.setLineWidth(0.3);
    doc.line(x + padding, cy, x + w - padding, cy);
    cy += 6.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...THEME.primaryDark);
    doc.text(totalRow[0], labelX, cy);
    doc.text(totalRow[1], valueX, cy, { align: 'right' });
    cy += lineH + 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.6);
    doc.setTextColor(...THEME.slate500);
    doc.text('Paid', labelX, cy);
    doc.setTextColor(...THEME.slate800);
    doc.text(dueRow.paid, valueX, cy, { align: 'right' });
    cy += lineH;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...(dueRow.isDue ? THEME.red : THEME.green));
    doc.text('Balance Due', labelX, cy);
    doc.text(dueRow.due, valueX, cy, { align: 'right' });

    return y + h;
}

function drawFooter(doc, shopData, notes) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - 22;

    doc.setDrawColor(...THEME.slate200);
    doc.setLineWidth(0.3);
    doc.line(20, footerY - 8, pageWidth - 20, footerY - 8);

    if (notes) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...THEME.slate800);
        doc.text('Notes:', 20, footerY - 3);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...THEME.slate500);
        doc.text(notes, 40, footerY - 3, { maxWidth: pageWidth - 60 });
    }

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.2);
    doc.setTextColor(...THEME.primaryDark);
    doc.text('Thank you for your business!', pageWidth / 2, footerY + 5, { align: 'center' });

    const metaBits = [];
    if (shopData.license_number) metaBits.push(`License #: ${shopData.license_number}`);
    if (shopData.gst_number) metaBits.push(`GST #: ${shopData.gst_number}`);
    if (metaBits.length) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.3);
        doc.setTextColor(...THEME.slate400);
        doc.text(metaBits.join('   |   '), pageWidth / 2, footerY + 10, { align: 'center' });
    }
}

// ==================== SALE PDF GENERATOR CLASS ====================
class SaleGenerator {
    // ==================== GENERATE SALE INVOICE ====================
    generateSaleInvoice(saleData, shopData, items) {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const headerHeight = drawHeader(doc, {
            title: 'SALE INVOICE',
            docNumberLabel: 'Invoice Number',
            docNumber: saleData.invoice_number || 'N/A',
            date: new Date(saleData.sale_date).toLocaleDateString('en-GB'),
        }, shopData);

        drawStatusBadge(doc, pageWidth - 20, headerHeight + 8, saleData.status);

        const infoY = headerHeight + 10;
        const infoW = (pageWidth - 40 - 6) / 2;

        drawInfoCard(doc, 20, infoY, infoW, 30, 'Bill To', [
            saleData.customer_name || 'Walk-in Customer',
            saleData.customer_phone ? `Tel: ${saleData.customer_phone}` : null,
            saleData.customer_address || null,
        ].filter(Boolean));

        drawInfoCard(doc, 20 + infoW + 6, infoY, infoW, 30, 'Payment', [
            (saleData.payment_method || 'cash').toUpperCase(),
            `Status: ${(saleData.status || 'completed').toUpperCase()}`,
        ]);

        const tableStartY = infoY + 30 + 8;
        const tableHeaders = ['#', 'Item', 'Qty', 'Unit Price', 'Total'];
        const tableData = items.map((item, index) => [
            index + 1,
            `${item.product_name}${item.product_code ? `\n${item.product_code}` : ''}`,
            item.quantity.toFixed(2),
            formatMoney(shopData, item.sale_price),
            formatMoney(shopData, item.total),
        ]);

        const finalY = drawTable(doc, tableStartY, tableHeaders, tableData, {
            0: { cellWidth: 12, halign: 'center', textColor: THEME.slate400 },
            1: { cellWidth: 68, halign: 'left' },
            2: { cellWidth: 25, halign: 'center' },
            3: { cellWidth: 35, halign: 'right' },
            4: { cellWidth: 38, halign: 'right', fontStyle: 'bold' },
        });

        const summaryW = 82;
        const summaryX = pageWidth - 20 - summaryW;
        const dueAmount = (saleData.total_amount || 0) - (saleData.paid_amount || 0);
        const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

        let blockY = finalY + 10;
        const summaryHeight = 75;

        if (blockY + summaryHeight + 25 > pageHeight - 25) {
            doc.addPage();
            blockY = 20;
        }

        drawSummary(doc, summaryX, blockY, summaryW,
            [
                ['Subtotal', formatMoney(shopData, subtotal)],
                ['Discount', `- ${formatMoney(shopData, saleData.discount || 0)}`],
                ['Tax', `+ ${formatMoney(shopData, saleData.tax || 0)}`],
            ],
            ['Total', formatMoney(shopData, saleData.total_amount || subtotal)],
            {
                paid: formatMoney(shopData, saleData.paid_amount || 0),
                due: formatMoney(shopData, dueAmount),
                isDue: dueAmount > 0
            }
        );

        drawFooter(doc, shopData, saleData.notes);

        return doc;
    }

    // ==================== SAVE SALE PDF WITH DIALOG ====================
    async generateAndSaveSale(saleData, items, window = null) {
        try {
            console.log('📄 [SaleGenerator] Starting PDF generation...');
            
            const db = require('../database/database');
            const shopStmt = db.prepare('SELECT * FROM shop_settings WHERE id = 1');
            const shopData = shopStmt.get() || {};

            let customerName = 'Walk-in Customer';
            let customerPhone = '';
            let customerAddress = '';
            if (saleData.customer_id) {
                const customerStmt = db.prepare('SELECT * FROM customers WHERE id = ?');
                const customer = customerStmt.get(saleData.customer_id);
                if (customer) {
                    customerName = customer.name || customerName;
                    customerPhone = customer.phone || '';
                    customerAddress = customer.address || '';
                }
            }

            const fullSaleData = {
                ...saleData,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_address: customerAddress
            };

            const doc = this.generateSaleInvoice(fullSaleData, shopData, items);
            const pdfBuffer = doc.output('arraybuffer');

            const result = await dialog.showSaveDialog(window || BrowserWindow.getFocusedWindow(), {
                title: 'Save Invoice',
                defaultPath: path.join(
                    app.getPath('documents'),
                    `Invoice_${saleData.invoice_number || 'sale'}_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`
                ),
                filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
            });

            if (!result.canceled && result.filePath) {
                fs.writeFileSync(result.filePath, Buffer.from(pdfBuffer));
                console.log(`✅ PDF saved: ${result.filePath}`);
                return { success: true, path: result.filePath, filename: path.basename(result.filePath) };
            } else {
                return { success: false, canceled: true, message: 'Save canceled by user' };
            }
        } catch (error) {
            console.error('❌ PDF generation error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new SaleGenerator();