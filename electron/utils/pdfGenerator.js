// electron/utils/pdfGenerator.js
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class PDFGenerator {
    generateSaleInvoice(saleData, shopData, items) {
        const { jsPDF } = require('jspdf');
        require('jspdf-autotable');
        
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Colors
        const primaryColor = [34, 197, 94]; // Emerald
        const textColor = [30, 41, 59]; // Slate-800
        const secondaryColor = [100, 116, 139]; // Slate-500
        
        // ===== HEADER =====
        // Shop Logo/Name
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(shopData.shop_name || 'My Shop', 20, 25);
        
        // Shop Details
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        let shopY = 32;
        
        if (shopData.address) {
            doc.text(`Address: ${shopData.address}`, 20, shopY);
            shopY += 6;
        }
        if (shopData.phone) {
            doc.text(`Phone: ${shopData.phone}`, 20, shopY);
            shopY += 6;
        }
        if (shopData.email) {
            doc.text(`Email: ${shopData.email}`, 20, shopY);
            shopY += 6;
        }
        if (shopData.license_number) {
            doc.text(`License #: ${shopData.license_number}`, 20, shopY);
            shopY += 6;
        }
        if (shopData.gst_number) {
            doc.text(`GST #: ${shopData.gst_number}`, 20, shopY);
            shopY += 6;
        }
        
        // ===== INVOICE TITLE =====
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text('SALE INVOICE', pageWidth - 60, 25);
        
        // Invoice Details (Right side)
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice #: ${saleData.invoice_number || 'N/A'}`, pageWidth - 60, 35);
        doc.text(`Date: ${new Date(saleData.sale_date).toLocaleDateString()}`, pageWidth - 60, 42);
        doc.text(`Status: ${(saleData.status || 'completed').toUpperCase()}`, pageWidth - 60, 49);
        
        // ===== DIVIDER LINE =====
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(0.5);
        doc.line(20, shopY + 10, pageWidth - 20, shopY + 10);
        
        // ===== CUSTOMER INFO =====
        let yPos = shopY + 20;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text('Bill To:', 20, yPos);
        
        yPos += 7;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        
        if (saleData.customer_name) {
            doc.text(`Name: ${saleData.customer_name}`, 20, yPos);
            yPos += 5;
        }
        if (saleData.customer_phone) {
            doc.text(`Phone: ${saleData.customer_phone}`, 20, yPos);
            yPos += 5;
        }
        if (saleData.customer_address) {
            doc.text(`Address: ${saleData.customer_address}`, 20, yPos);
            yPos += 5;
        }
        
        // ===== TABLE HEADER =====
        yPos = Math.max(yPos + 10, 95);
        const tableHeaders = ['#', 'Item', 'Qty', 'Price', 'Total'];
        const tableData = items.map((item, index) => [
            index + 1,
            `${item.product_name}${item.product_code ? ` (${item.product_code})` : ''}`,
            item.quantity.toFixed(2),
            `${shopData.currency || '₨'}${item.sale_price.toFixed(2)}`,
            `${shopData.currency || '₨'}${item.total.toFixed(2)}`
        ]);
        
        doc.autoTable({
            startY: yPos,
            head: [tableHeaders],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 9,
                textColor: textColor
            },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 80 },
                2: { cellWidth: 30, halign: 'right' },
                3: { cellWidth: 35, halign: 'right' },
                4: { cellWidth: 35, halign: 'right' }
            },
            margin: { left: 20, right: 20 }
        });
        
        // ===== SUMMARY =====
        const finalY = doc.lastAutoTable.finalY + 10;
        
        // Summary box
        const summaryX = pageWidth - 80;
        const summaryWidth = 60;
        const summaryHeight = 75;
        const summaryY = finalY;
        
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(summaryX, summaryY, summaryWidth, summaryHeight, 2, 2, 'FD');
        
        let summaryPosY = summaryY + 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        
        doc.text('Subtotal:', summaryX + 10, summaryPosY);
        doc.text(`${shopData.currency || '₨'}${(saleData.subtotal || 0).toFixed(2)}`, summaryX + summaryWidth - 10, summaryPosY, { align: 'right' });
        
        summaryPosY += 7;
        doc.text('Discount:', summaryX + 10, summaryPosY);
        doc.text(`-${shopData.currency || '₨'}${(saleData.discount || 0).toFixed(2)}`, summaryX + summaryWidth - 10, summaryPosY, { align: 'right' });
        
        summaryPosY += 7;
        doc.text('Tax:', summaryX + 10, summaryPosY);
        doc.text(`+${shopData.currency || '₨'}${(saleData.tax || 0).toFixed(2)}`, summaryX + summaryWidth - 10, summaryPosY, { align: 'right' });
        
        summaryPosY += 10;
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.line(summaryX + 10, summaryPosY, summaryX + summaryWidth - 10, summaryPosY);
        
        summaryPosY += 7;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text('Total:', summaryX + 10, summaryPosY);
        doc.text(`${shopData.currency || '₨'}${(saleData.total_amount || 0).toFixed(2)}`, summaryX + summaryWidth - 10, summaryPosY, { align: 'right' });
        
        summaryPosY += 8;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text('Paid:', summaryX + 10, summaryPosY);
        doc.text(`${shopData.currency || '₨'}${(saleData.paid_amount || 0).toFixed(2)}`, summaryX + summaryWidth - 10, summaryPosY, { align: 'right' });
        
        summaryPosY += 7;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const dueAmount = (saleData.total_amount || 0) - (saleData.paid_amount || 0);
        const dueColor = dueAmount > 0 ? [220, 38, 38] : [34, 197, 94];
        doc.setTextColor(dueColor[0], dueColor[1], dueColor[2]);
        doc.text('Due:', summaryX + 10, summaryPosY);
        doc.text(`${shopData.currency || '₨'}${dueAmount.toFixed(2)}`, summaryX + summaryWidth - 10, summaryPosY, { align: 'right' });
        
        // ===== PAYMENT INFO =====
        const paymentY = Math.max(summaryY + summaryHeight + 10, finalY + 75);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text('Payment Details:', 20, paymentY);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.text(`Method: ${(saleData.payment_method || 'cash').toUpperCase()}`, 20, paymentY + 6);
        doc.text(`Date: ${new Date(saleData.sale_date).toLocaleDateString()}`, 20, paymentY + 12);
        
        // ===== NOTES =====
        if (saleData.notes) {
            const notesY = paymentY + 20;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            doc.text('Notes:', 20, notesY);
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            doc.text(saleData.notes, 20, notesY + 6);
        }
        
        // ===== FOOTER =====
        const footerY = pageHeight - 20;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
        
        if (shopData.license_number) {
            doc.text(`License #: ${shopData.license_number}`, pageWidth / 2, footerY - 5, { align: 'center' });
        }
        
        return doc;
    }
    
    async generateAndSave(saleData, items) {
        try {
            // Get shop data
            const db = require('../database/database');
            const shopStmt = db.prepare('SELECT * FROM shop_settings WHERE id = 1');
            const shopData = shopStmt.get() || {};
            
            // Get customer data if exists
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
            
            // Prepare sale data
            const fullSaleData = {
                ...saleData,
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_address: customerAddress
            };
            
            const doc = this.generateSaleInvoice(fullSaleData, shopData, items);
            
            // Save PDF
            const downloadsPath = app.getPath('documents');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `Invoice_${saleData.invoice_number || 'sale'}_${timestamp}.pdf`;
            const filePath = path.join(downloadsPath, filename);
            
            doc.save(filePath);
            return { success: true, path: filePath, filename };
        } catch (error) {
            console.error('PDF generation error:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new PDFGenerator();