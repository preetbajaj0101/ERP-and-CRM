const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * PDF Invoice Generator Service
 */
class PDFService {
  static async generateInvoice(transaction, items, customerOrVendor) {
    const invoiceDir = path.join(__dirname, '..', 'invoices');
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    const invoiceNumber = `DG-${Date.now()}`;
    const fileName = `${invoiceNumber}.pdf`;
    const filePath = path.join(invoiceDir, fileName);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // ── Header ──
      doc.fontSize(24).font('Helvetica-Bold')
        .text('DASHMESH GASES', 50, 50, { align: 'center' });
      doc.fontSize(10).font('Helvetica')
        .text('Industrial Gases & Welding Accessories', { align: 'center' });
      doc.moveDown();

      // ── Divider ──
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#2563eb');
      doc.moveDown();

      // ── Invoice Details ──
      doc.fontSize(14).font('Helvetica-Bold')
        .text(`INVOICE`, 50, doc.y);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Invoice #: ${invoiceNumber}`);
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`);
      doc.text(`Type: ${transaction.type.toUpperCase()}`);
      doc.moveDown();

      // ── Customer/Vendor Details ──
      if (customerOrVendor) {
        doc.font('Helvetica-Bold').text('Bill To:');
        doc.font('Helvetica');
        doc.text(customerOrVendor.name);
        if (customerOrVendor.phone) doc.text(`Phone: ${customerOrVendor.phone}`);
        if (customerOrVendor.address) doc.text(`Address: ${customerOrVendor.address}`);
        if (customerOrVendor.gstNumber) doc.text(`GST: ${customerOrVendor.gstNumber}`);
      }
      doc.moveDown();

      // ── Items Table ──
      const tableTop = doc.y;
      const tableHeaders = ['#', 'Item', 'Qty', 'Unit Price', 'Total'];
      const colWidths = [30, 220, 60, 80, 80];
      let xPos = 50;

      // Header row
      doc.font('Helvetica-Bold').fontSize(10);
      doc.rect(50, tableTop, 500, 20).fill('#1e293b');
      doc.fillColor('#ffffff');
      tableHeaders.forEach((header, i) => {
        doc.text(header, xPos + 5, tableTop + 5, { width: colWidths[i] });
        xPos += colWidths[i];
      });
      doc.fillColor('#000000');

      // Data rows
      let yPos = tableTop + 25;
      doc.font('Helvetica').fontSize(9);
      items.forEach((item, index) => {
        xPos = 50;
        if (index % 2 === 0) {
          doc.rect(50, yPos - 3, 500, 18).fill('#f1f5f9');
          doc.fillColor('#000000');
        }
        const row = [
          `${index + 1}`,
          item.inventoryItem?.itemName || 'Item',
          `${item.quantity}`,
          `₹${parseFloat(item.unitPrice).toFixed(2)}`,
          `₹${parseFloat(item.totalPrice).toFixed(2)}`,
        ];
        row.forEach((cell, i) => {
          doc.text(cell, xPos + 5, yPos, { width: colWidths[i] });
          xPos += colWidths[i];
        });
        yPos += 18;
      });

      // ── Totals ──
      doc.moveDown(2);
      yPos += 10;
      doc.moveTo(350, yPos).lineTo(550, yPos).stroke('#2563eb');
      yPos += 10;
      doc.font('Helvetica').fontSize(10);
      doc.text(`Subtotal:`, 350, yPos);
      doc.text(`₹${parseFloat(transaction.totalAmount).toFixed(2)}`, 460, yPos);
      yPos += 18;
      doc.text(`Tax:`, 350, yPos);
      doc.text(`₹${parseFloat(transaction.taxAmount || 0).toFixed(2)}`, 460, yPos);
      yPos += 18;
      doc.text(`Discount:`, 350, yPos);
      doc.text(`-₹${parseFloat(transaction.discountAmount || 0).toFixed(2)}`, 460, yPos);
      yPos += 20;
      doc.font('Helvetica-Bold').fontSize(12);
      doc.text(`Grand Total:`, 350, yPos);
      doc.text(`₹${parseFloat(transaction.grandTotal).toFixed(2)}`, 460, yPos);

      // ── Footer ──
      doc.fontSize(8).font('Helvetica')
        .text('Thank you for your business! | Dashmesh Gases', 50, 750, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve({ invoiceNumber, filePath, fileName });
      });
      stream.on('error', reject);
    });
  }
}

module.exports = PDFService;
