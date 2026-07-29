const PDFDocument = require('pdfkit');

/**
 * Streams a beautifully designed invoice PDF for a confirmed challan
 * directly to the given writable stream (typically the Express `res` object).
 *
 * `challan` is expected to be the object returned by
 * challan.controller.js#getChallanWithItems: the challan header fields,
 * `customer_name` / `customer_mobile`, and an `items` array of
 * challan_items rows (with *_snapshot fields).
 */
function generateInvoicePdf(challan, outputStream) {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  doc.pipe(outputStream);

  const W = 595.28; // A4 width in points
  const H = 841.89; // A4 height in points
  const MARGIN = 45;
  const CONTENT_W = W - MARGIN * 2;

  // ── Colours ────────────────────────────────────────────────────────────
  const BRAND       = '#4338CA'; // indigo-700
  const BRAND_DARK  = '#1e1b4b'; // indigo-950
  const BRAND_LIGHT = '#ede9fe'; // violet-100
  const ACCENT      = '#818cf8'; // indigo-400
  const TEXT_DARK   = '#1e293b'; // slate-800
  const TEXT_MID    = '#475569'; // slate-600
  const TEXT_LIGHT  = '#94a3b8'; // slate-400
  const BORDER      = '#e2e8f0'; // slate-200
  const ROW_ALT     = '#f8fafc'; // slate-50
  const SUCCESS     = '#059669'; // emerald-600
  const WHITE       = '#ffffff';

  // ── Helper: draw a filled rounded rect ─────────────────────────────────
  function roundedRect(x, y, w, h, r, fillColour) {
    doc
      .roundedRect(x, y, w, h, r)
      .fill(fillColour);
  }

  // ── 1. Hero header band ─────────────────────────────────────────────────
  roundedRect(0, 0, W, 160, 0, BRAND_DARK);

  // Subtle diagonal accent stripe
  doc
    .save()
    .moveTo(W - 180, 0)
    .lineTo(W, 0)
    .lineTo(W, 160)
    .lineTo(W - 280, 160)
    .closePath()
    .fill(BRAND);
  doc.restore();

  // Company / portal name
  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor(WHITE)
    .text('OPS PORTAL', MARGIN, 40, { characterSpacing: 3 });

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(ACCENT)
    .text('ERP · CRM · Operations', MARGIN, 66, { characterSpacing: 1.5 });

  // INVOICE label
  doc
    .font('Helvetica-Bold')
    .fontSize(36)
    .fillColor(WHITE)
    .text('INVOICE', 0, 38, { align: 'right', width: W - MARGIN, characterSpacing: 2 });

  // Challan number pill
  const pillText = challan.challan_number;
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(ACCENT)
    .text(pillText, 0, 84, { align: 'right', width: W - MARGIN });

  // Date
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(TEXT_LIGHT)
    .text(`Date: ${formatDate(challan.created_at)}`, 0, 100, { align: 'right', width: W - MARGIN });

  // Status badge
  doc
    .roundedRect(W - MARGIN - 90, 116, 90, 22, 4)
    .fill(SUCCESS);
  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(WHITE)
    .text('✓  CONFIRMED', W - MARGIN - 90, 122, { width: 90, align: 'center', characterSpacing: 0.8 });

  // ── 2. Meta info bar (Bill To + Details) ────────────────────────────────
  const INFO_Y = 178;
  const INFO_H = 90;

  // Left: Bill To
  doc
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .fillColor(TEXT_LIGHT)
    .text('BILL TO', MARGIN, INFO_Y, { characterSpacing: 1.5 });

  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor(TEXT_DARK)
    .text(challan.customer_name || '—', MARGIN, INFO_Y + 14, { width: 220 });

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(TEXT_MID)
    .text(challan.customer_mobile || '—', MARGIN, INFO_Y + 32);

  // Right column: challan details box
  const boxX = W - MARGIN - 200;
  doc
    .roundedRect(boxX, INFO_Y, 200, INFO_H, 8)
    .fillAndStroke(BRAND_LIGHT, BRAND_LIGHT);

  const detailRows = [
    ['Challan No', challan.challan_number],
    ['Issue Date',  formatDate(challan.created_at)],
    ['Total Items', String(challan.items ? challan.items.length : 0)],
    ['Total Qty',   String(challan.total_quantity)],
  ];
  detailRows.forEach(([label, value], i) => {
    const rowY = INFO_Y + 10 + i * 20;
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(TEXT_MID)
      .text(label, boxX + 12, rowY, { width: 80 });
    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor(TEXT_DARK)
      .text(value, boxX + 95, rowY, { width: 95, align: 'right' });
  });

  // Thin separator line
  const SEP_Y = INFO_Y + INFO_H + 18;
  doc
    .moveTo(MARGIN, SEP_Y)
    .lineTo(W - MARGIN, SEP_Y)
    .lineWidth(0.5)
    .strokeColor(BORDER)
    .stroke();

  // ── 3. Items table ──────────────────────────────────────────────────────
  const TH_Y = SEP_Y + 12;
  const COL = {
    sn:    { x: MARGIN,       w: 28  },
    item:  { x: MARGIN + 28,  w: 180 },
    sku:   { x: MARGIN + 208, w: 95  },
    qty:   { x: MARGIN + 303, w: 45  },
    rate:  { x: MARGIN + 348, w: 80  },
    total: { x: MARGIN + 428, w: CONTENT_W - 428 },
  };

  // Table header background
  doc
    .roundedRect(MARGIN, TH_Y, CONTENT_W, 26, 4)
    .fill(BRAND);

  // Header labels
  const headers = [
    ['#',          COL.sn,    'center'],
    ['ITEM',       COL.item,  'left'  ],
    ['SKU',        COL.sku,   'left'  ],
    ['QTY',        COL.qty,   'center'],
    ['UNIT PRICE', COL.rate,  'right' ],
    ['TOTAL',      COL.total, 'right' ],
  ];
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(WHITE);
  headers.forEach(([label, col, align]) => {
    doc.text(label, col.x + 4, TH_Y + 9, { width: col.w - 8, align, characterSpacing: 0.8 });
  });

  // Table rows
  let rowY = TH_Y + 26;
  let invoiceTotal = 0;

  (challan.items || []).forEach((item, idx) => {
    const lineTotal = Number(item.unit_price_snapshot) * Number(item.quantity);
    invoiceTotal += lineTotal;

    const rowH = 28;
    const isAlt = idx % 2 !== 0;

    // Alt row background
    if (isAlt) {
      doc
        .rect(MARGIN, rowY, CONTENT_W, rowH)
        .fill(ROW_ALT);
    }

    // Row bottom border
    doc
      .moveTo(MARGIN, rowY + rowH)
      .lineTo(W - MARGIN, rowY + rowH)
      .lineWidth(0.3)
      .strokeColor(BORDER)
      .stroke();

    const textY = rowY + 9;

    doc.font('Helvetica').fontSize(9).fillColor(TEXT_LIGHT)
      .text(String(idx + 1), COL.sn.x + 4, textY, { width: COL.sn.w - 8, align: 'center' });

    doc.font('Helvetica-Bold').fontSize(9).fillColor(TEXT_DARK)
      .text(item.product_name_snapshot, COL.item.x + 4, textY, { width: COL.item.w - 8, ellipsis: true });

    if (item.category_snapshot) {
      doc.font('Helvetica').fontSize(7).fillColor(TEXT_LIGHT)
        .text(item.category_snapshot, COL.item.x + 4, textY + 11, { width: COL.item.w - 8 });
    }

    doc.font('Helvetica').fontSize(8).fillColor(TEXT_MID)
      .text(item.sku_snapshot, COL.sku.x + 4, textY, { width: COL.sku.w - 8 });

    doc.font('Helvetica-Bold').fontSize(9).fillColor(TEXT_DARK)
      .text(String(item.quantity), COL.qty.x + 4, textY, { width: COL.qty.w - 8, align: 'center' });

    doc.font('Helvetica').fontSize(9).fillColor(TEXT_MID)
      .text(formatCurrency(item.unit_price_snapshot), COL.rate.x + 4, textY, { width: COL.rate.w - 8, align: 'right' });

    doc.font('Helvetica-Bold').fontSize(9).fillColor(TEXT_DARK)
      .text(formatCurrency(lineTotal), COL.total.x + 4, textY, { width: COL.total.w - 8, align: 'right' });

    rowY += rowH;
  });

  // ── 4. Totals section ──────────────────────────────────────────────────
  const TOTAL_Y = rowY + 16;
  const TOTAL_BOX_W = 220;
  const TOTAL_BOX_X = W - MARGIN - TOTAL_BOX_W;

  // Total box background
  doc
    .roundedRect(TOTAL_BOX_X, TOTAL_Y, TOTAL_BOX_W, 72, 8)
    .fill(BRAND_DARK);

  // Sub-label: Total Quantity
  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(ACCENT)
    .text('Total Quantity', TOTAL_BOX_X + 14, TOTAL_Y + 12, { width: TOTAL_BOX_W - 28 });
  doc
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .fillColor(WHITE)
    .text(String(challan.total_quantity), TOTAL_BOX_X + 14, TOTAL_Y + 12, { width: TOTAL_BOX_W - 28, align: 'right' });

  // Thin divider inside box
  doc
    .moveTo(TOTAL_BOX_X + 14, TOTAL_Y + 30)
    .lineTo(TOTAL_BOX_X + TOTAL_BOX_W - 14, TOTAL_Y + 30)
    .lineWidth(0.3)
    .strokeColor(BRAND)
    .stroke();

  // Grand total label
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(ACCENT)
    .text('Grand Total', TOTAL_BOX_X + 14, TOTAL_Y + 38, { width: TOTAL_BOX_W - 28 });

  // Grand total value
  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .fillColor(WHITE)
    .text(`₹ ${formatCurrency(invoiceTotal)}`, TOTAL_BOX_X + 14, TOTAL_Y + 34, {
      width: TOTAL_BOX_W - 28,
      align: 'right'
    });

  // ── 5. Note ─────────────────────────────────────────────────────────────
  const NOTE_Y = TOTAL_Y + 16;
  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor(TEXT_MID)
    .text('Note:', MARGIN, NOTE_Y);
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(TEXT_LIGHT)
    .text(
      'This is a computer-generated invoice for a confirmed sales challan and does not require a physical signature.',
      MARGIN,
      NOTE_Y + 13,
      { width: TOTAL_BOX_X - MARGIN - 20 }
    );

  // ── 6. Footer band ──────────────────────────────────────────────────────
  const FOOTER_Y = H - 52;
  doc
    .rect(0, FOOTER_Y, W, 52)
    .fill(BRAND_DARK);

  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor(ACCENT)
    .text('OPS PORTAL  ·  ERP + CRM Operations', 0, FOOTER_Y + 12, { align: 'center', width: W });

  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(TEXT_LIGHT)
    .text(
      `Generated automatically on ${formatDate(new Date().toISOString())}  ·  ${challan.challan_number}`,
      0,
      FOOTER_Y + 28,
      { align: 'center', width: W }
    );

  doc.end();
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatCurrency(value) {
  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

module.exports = { generateInvoicePdf };
