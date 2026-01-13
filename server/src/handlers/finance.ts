
import { Handler } from '../router';
import { parseJsonBody, sendJson } from '../http';
import { NotFoundError, BadRequestError } from '../errors';
import { withDb } from '../db';
import { generateId, nowISO } from '../../../shared/utils';
import { Estimate, Invoice, Payment, EstimateLineItem, InvoiceLineItem } from '../../../shared/domain';
import { quoteReservation } from '../pricing';

const TAX_RATE_BPS = 800; // 8%

// --- Estimates ---

export const createEstimate: Handler = async (req, res, params) => {
  const { id } = params; // Reservation ID
  
  await withDb(db => {
    const reservation = db.reservations.find(r => r.id === id);
    if (!reservation) throw new NotFoundError('Reservation not found');

    const lineItems = db.reservationLineItems.filter(l => l.reservationId === id);
    const catalog = db.catalogItems;

    const quote = quoteReservation(reservation, lineItems, catalog, TAX_RATE_BPS, 0);

    const estimate: Estimate = {
      id: generateId('est'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      reservationId: id,
      status: 'Draft',
      subtotal: quote.subtotal,
      taxTotal: quote.tax,
      discount: 0,
      total: quote.total,
      depositRequired: 0,
      notes: ''
    };

    // Save breakdown as estimate line items
    const estLineItems: EstimateLineItem[] = quote.breakdown.map(b => ({
      id: generateId('eli'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      estimateId: estimate.id,
      description: b.description,
      quantity: b.quantity,
      unitPrice: Math.round(b.amount / b.quantity), // Recover unit price roughly
      totalPrice: b.amount
    }));

    db.estimates.push(estimate);
    db.estimateLineItems.push(...estLineItems);
    
    // Link to reservation
    reservation.estimateId = estimate.id;

    db.auditLogs.push({
      id: generateId('al'),
      actorId: req.user!.id,
      action: 'estimate.created',
      resourceType: 'Estimate',
      resourceId: estimate.id,
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: []
    });

    sendJson(res, 201, { data: estimate });
  });
};

export const getEstimate: Handler = async (req, res, params) => {
  const { id } = params;
  await withDb(db => {
    const estimate = db.estimates.find(e => e.id === id);
    if (!estimate) throw new NotFoundError('Estimate not found');
    const items = db.estimateLineItems.filter(i => i.estimateId === id);
    sendJson(res, 200, { data: { ...estimate, lineItems: items } });
  });
};

export const updateEstimate: Handler = async (req, res, params) => {
  const { id } = params;
  const body = await parseJsonBody(req); // { discount, deposit, status, notes }

  await withDb(db => {
    const idx = db.estimates.findIndex(e => e.id === id);
    if (idx === -1) throw new NotFoundError('Estimate not found');

    const est = db.estimates[idx];
    
    // Recalculate totals if discount changes
    let newTotal = est.total;
    if (typeof body.discount === 'number') {
        const oldDiscount = est.discount;
        newTotal = est.total + oldDiscount - body.discount;
        est.discount = body.discount;
    }

    if (body.depositRequired !== undefined) est.depositRequired = body.depositRequired;
    if (body.notes !== undefined) est.notes = body.notes;
    if (body.status !== undefined) est.status = body.status;
    
    est.total = Math.max(0, newTotal);
    est.updatedAt = nowISO();

    db.estimates[idx] = est;
    sendJson(res, 200, { data: est });
  });
};

export const acceptEstimate: Handler = async (req, res, params) => {
  const { id } = params;
  await withDb(db => {
    const idx = db.estimates.findIndex(e => e.id === id);
    if (idx === -1) throw new NotFoundError();
    
    db.estimates[idx].status = 'Accepted';
    db.estimates[idx].updatedAt = nowISO();
    
    sendJson(res, 200, { data: db.estimates[idx] });
  });
};

// --- Invoices ---

export const createInvoice: Handler = async (req, res, params) => {
  const { id } = params; // Reservation ID
  await withDb(db => {
    const reservation = db.reservations.find(r => r.id === id);
    if (!reservation) throw new NotFoundError('Reservation not found');

    // Use existing estimate if available, otherwise quote fresh
    let quote: any;
    if (reservation.estimateId) {
       const est = db.estimates.find(e => e.id === reservation.estimateId);
       const items = db.estimateLineItems.filter(i => i.estimateId === est?.id);
       if (est && items.length) {
          quote = {
             subtotal: est.subtotal,
             tax: est.taxTotal,
             discount: est.discount,
             total: est.total,
             breakdown: items.map(i => ({ description: i.description, amount: i.totalPrice, quantity: i.quantity }))
          };
       }
    }

    if (!quote) {
       const lineItems = db.reservationLineItems.filter(l => l.reservationId === id);
       quote = quoteReservation(reservation, lineItems, db.catalogItems, TAX_RATE_BPS, 0);
    }

    const invoice: Invoice = {
      id: generateId('inv'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      ownerId: reservation.ownerId,
      reservationId: id,
      estimateId: reservation.estimateId,
      status: 'Sent', // Auto-send for simplicity
      dueDate: reservation.endAt, // Due on checkout
      subtotal: quote.subtotal,
      taxTotal: quote.tax,
      discount: quote.discount,
      total: quote.total,
      amountPaid: 0,
      balanceDue: quote.total
    };

    const invItems: InvoiceLineItem[] = quote.breakdown.map((b: any) => ({
      id: generateId('ili'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      invoiceId: invoice.id,
      description: b.description,
      quantity: b.quantity,
      unitPrice: Math.round(b.amount / b.quantity),
      totalPrice: b.amount
    }));

    db.invoices.push(invoice);
    db.invoiceLineItems.push(...invItems);

    db.auditLogs.push({
      id: generateId('al'),
      actorId: req.user!.id,
      action: 'invoice.created',
      resourceType: 'Invoice',
      resourceId: invoice.id,
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: []
    });

    sendJson(res, 201, { data: invoice });
  });
};

export const getInvoice: Handler = async (req, res, params) => {
  const { id } = params;
  await withDb(db => {
    const invoice = db.invoices.find(i => i.id === id);
    if (!invoice) throw new NotFoundError('Invoice not found');
    const items = db.invoiceLineItems.filter(i => i.invoiceId === id);
    const payments = db.payments.filter(p => p.invoiceId === id);
    sendJson(res, 200, { data: { ...invoice, lineItems: items, payments } });
  });
};

export const listOwnerInvoices: Handler = async (req, res, params) => {
  const { id } = params; // Owner ID
  await withDb(db => {
    const invoices = db.invoices.filter(i => i.ownerId === id);
    sendJson(res, 200, { data: invoices });
  });
};

// --- Payments ---

export const recordPayment: Handler = async (req, res) => {
  const body = await parseJsonBody(req); // { invoiceId, amountCents, method, reference }
  
  if (!body.invoiceId || !body.amountCents) throw new BadRequestError('Missing payment details');

  await withDb(db => {
    const idx = db.invoices.findIndex(i => i.id === body.invoiceId);
    if (idx === -1) throw new NotFoundError('Invoice not found');

    const invoice = db.invoices[idx];
    
    // Create Payment
    const payment: Payment = {
      id: generateId('pay'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      invoiceId: invoice.id,
      ownerId: invoice.ownerId,
      amount: body.amountCents,
      method: body.method || 'Cash',
      reference: body.reference,
      status: 'Success'
    };

    db.payments.push(payment);

    // Update Invoice Balance
    invoice.amountPaid += body.amountCents;
    invoice.balanceDue = invoice.total - invoice.amountPaid;
    
    if (invoice.balanceDue <= 0) {
      invoice.status = 'Paid';
      invoice.balanceDue = 0; // Prevent negative due
    } else {
      invoice.status = 'PartiallyPaid';
    }
    invoice.updatedAt = nowISO();
    
    // Update Owner Balance (Credit/Debit logic - for now simple sync)
    const ownerIdx = db.owners.findIndex(o => o.id === invoice.ownerId);
    if (ownerIdx !== -1) {
       // Reduce owner's outstanding balance
       db.owners[ownerIdx].balance = Math.max(0, db.owners[ownerIdx].balance - body.amountCents);
    }

    db.auditLogs.push({
      id: generateId('al'),
      actorId: req.user!.id,
      action: 'payment.recorded',
      resourceType: 'Payment',
      resourceId: payment.id,
      details: `Paid ${body.amountCents} via ${body.method}`,
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: []
    });

    sendJson(res, 201, { data: payment });
  });
};

// --- POS Checkout ---

export const posCheckout: Handler = async (req, res) => {
  const body = await parseJsonBody(req); // { ownerId, items: [{catalogItemId, quantity}], payment: {method, amountCents} }
  
  if (!body.items || body.items.length === 0) throw new BadRequestError('Empty cart');

  await withDb(db => {
    // 1. Calculate Totals
    let subtotal = 0;
    const invItems: Partial<InvoiceLineItem>[] = [];
    
    for (const item of body.items) {
       const catalogItem = db.catalogItems.find(c => c.id === item.catalogItemId);
       if (catalogItem) {
          const total = catalogItem.basePrice * item.quantity;
          subtotal += total;
          invItems.push({
             description: catalogItem.name,
             quantity: item.quantity,
             unitPrice: catalogItem.basePrice,
             totalPrice: total,
             catalogItemId: catalogItem.id
          });
       }
    }

    const tax = Math.round(subtotal * (TAX_RATE_BPS / 10000));
    const total = subtotal + tax;

    // 2. Create Invoice
    const invoice: Invoice = {
      id: generateId('inv-pos'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: ['POS'],
      ownerId: body.ownerId || 'walk-in',
      status: 'Draft', // Will update if paid
      dueDate: nowISO(),
      subtotal,
      taxTotal: tax,
      discount: 0,
      total,
      amountPaid: 0,
      balanceDue: total
    };
    
    db.invoices.push(invoice);
    
    // Save lines
    const lines = invItems.map(i => ({
       ...i,
       id: generateId('ili'),
       invoiceId: invoice.id,
       orgId: req.user!.orgId,
       locationId: req.user!.locationId,
       createdAt: nowISO(),
       updatedAt: nowISO(),
       tags: []
    } as InvoiceLineItem));
    
    db.invoiceLineItems.push(...lines);

    // 3. Process Payment if provided
    if (body.payment) {
       const payment: Payment = {
          id: generateId('pay-pos'),
          orgId: req.user!.orgId,
          locationId: req.user!.locationId,
          createdAt: nowISO(),
          updatedAt: nowISO(),
          tags: [],
          invoiceId: invoice.id,
          ownerId: body.ownerId || 'walk-in',
          amount: body.payment.amountCents,
          method: body.payment.method,
          reference: body.payment.reference,
          status: 'Success'
       };
       
       db.payments.push(payment);
       
       invoice.amountPaid += payment.amount;
       invoice.balanceDue = Math.max(0, invoice.total - invoice.amountPaid);
       invoice.status = invoice.balanceDue === 0 ? 'Paid' : 'PartiallyPaid';
    }

    sendJson(res, 201, { data: invoice });
  });
};
