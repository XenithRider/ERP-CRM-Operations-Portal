const PDFDocument = require('pdfkit');

/**
 * Streams a simple, clean invoice PDF for a confirmed challan directly to
 * the given writable stream (typically the Express `res` object).
 *
 * `challan` is expected to be the object returned by
 * challan.controller.js#getChallanWithItems: the challan header fields,
 * `customer_name` / `customer_mobile`, and an `items` array of
 * challan_items rows (with *_snapshot fields).
 */
function generateInvoicePdf(challan, outputStream) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(outputStream);

  // Header
  doc.fontSize(20).text('INVOICE', { align: 'right' });
  doc.moveDown(0.2);
  doc.fontSize(10).fillColor('#555').text(`Challan No: ${challan.challan_number}`, { align: 'right' });
  doc.text(`Date: ${formatDate(challan.created_at)}`, { align: 'right' });
  doc.fillColor('#000');
  doc.moveDown(1.5);

  // Bill-to block
  doc.fontSize(12).text('Bill To:', { underline: true });
  doc.fontSize(11).text(challan.customer_name || '-');
  doc.text(challan.customer_mobile || '-');
  doc.moveDown(1.5);

  // Table header
  const tableTop = doc.y;
  const columns = {
    sn: { x: 50, width: 30, label: '#' },
    name: { x: 80, width: 190, label: 'Item' },
    sku: { x: 270, width: 90, label: 'SKU' },
    qty: { x: 360, width: 50, label: 'Qty' },
    price: { x: 410, width: 65, label: 'Unit Price' },
    total: { x: 475, width: 75, label: 'Total' }
  };

  doc.fontSize(10).font('Helvetica-Bold');
  Object.values(columns).forEach((col) => {
    doc.text(col.label, col.x, tableTop, { width: col.width });
  });
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#ccc').stroke();

  // Table rows
  doc.font('Helvetica').fontSize(10);
  let rowY = tableTop + 22;
  let invoiceTotal = 0;

  challan.items.forEach((item, index) => {
    const lineTotal = Number(item.unit_price_snapshot) * item.quantity;
    invoiceTotal += lineTotal;

    doc.text(String(index + 1), columns.sn.x, rowY, { width: columns.sn.width });
    doc.text(item.product_name_snapshot, columns.name.x, rowY, { width: columns.name.width });
    doc.text(item.sku_snapshot, columns.sku.x, rowY, { width: columns.sku.width });
    doc.text(String(item.quantity), columns.qty.x, rowY, { width: columns.qty.width });
    doc.text(formatCurrency(item.unit_price_snapshot), columns.price.x, rowY, {
      width: columns.price.width
    });
    doc.text(formatCurrency(lineTotal), columns.total.x, rowY, { width: columns.total.width });

    rowY += 20;
  });

  doc.moveTo(50, rowY + 5).lineTo(550, rowY + 5).strokeColor('#ccc').stroke();

  // Totals
  doc.font('Helvetica-Bold').fontSize(11);
  doc.text(`Total Quantity: ${challan.total_quantity}`, 50, rowY + 20);
  doc.text(`Grand Total: ${formatCurrency(invoiceTotal)}`, 350, rowY + 20, { width: 200, align: 'right' });

  // Footer
  doc.font('Helvetica').fontSize(9).fillColor('#888');
  doc.text('This invoice was generated automatically from a confirmed sales challan.', 50, 760, {
    align: 'center',
    width: 500
  });

  doc.end();
}

function formatCurrency(value) {
  return Number(value).toFixed(2);
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toISOString().slice(0, 10);
}

module.exports = { generateInvoicePdf };
