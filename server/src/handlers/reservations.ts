
import { Handler } from '../router';
import { parseJsonBody, sendJson } from '../http';
import { NotFoundError, BadRequestError } from '../errors';
import { withDb, DbSchema } from '../db';
import { generateId, nowISO } from '../../../shared/utils';
import { Reservation, ReservationStatus, ReservationSegment, ReservationLineItem } from '../../../shared/domain';
import { eventBus } from '../event-bus';

// Helper to log changes
const logAudit = (db: DbSchema, req: any, action: string, resourceId: string, details?: string) => {
  db.auditLogs.push({
    id: generateId('al'),
    orgId: req.user!.orgId,
    locationId: req.user!.locationId,
    actorId: req.user!.id,
    action,
    resourceType: 'Reservation',
    resourceId,
    details,
    createdAt: nowISO(),
    updatedAt: nowISO(),
    tags: []
  });
};

// Helper: Check if two date ranges overlap
const rangesOverlap = (start1: string, end1: string, start2: string, end2: string) => {
  return start1 < end2 && start2 < end1;
};

// --- CRUD ---

export const listReservations: Handler = async (req, res) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const status = url.searchParams.get('status');
  const dateFrom = url.searchParams.get('dateFrom');
  const dateTo = url.searchParams.get('dateTo');
  const search = url.searchParams.get('search')?.toLowerCase();

  await withDb(db => {
    let results = db.reservations.filter(r => r.orgId === req.user!.orgId);

    if (status && status !== 'all') {
      results = results.filter(r => r.status === status);
    }

    if (dateFrom || dateTo) {
      results = results.filter(r => {
        const start = dateFrom || '0000-01-01';
        const end = dateTo || '9999-12-31';
        return rangesOverlap(r.startAt, r.endAt, start, end);
      });
    }

    if (search) {
      const petIds = new Set(db.pets.filter(p => p.name.toLowerCase().includes(search)).map(p => p.id));
      const ownerIds = new Set(db.owners.filter(o => o.firstName.toLowerCase().includes(search) || o.lastName.toLowerCase().includes(search)).map(o => o.id));
      results = results.filter(r => petIds.has(r.petId) || ownerIds.has(r.ownerId));
    }

    sendJson(res, 200, { data: results });
  });
};

export const getReservation: Handler = async (req, res, params) => {
  const { id } = params;
  await withDb(db => {
    const r = db.reservations.find(r => r.id === id && r.orgId === req.user!.orgId);
    if (!r) throw new NotFoundError('Reservation not found');

    const segments = db.reservationSegments.filter(s => s.reservationId === id);
    const lineItems = db.reservationLineItems.filter(l => l.reservationId === id);
    const pet = db.pets.find(p => p.id === r.petId);
    const owner = db.owners.find(o => o.id === r.ownerId);

    sendJson(res, 200, { data: { ...r, segments, lineItems, pet, owner } });
  });
};

export const createReservation: Handler = async (req, res) => {
  const body = await parseJsonBody(req);
  if (!body.petId || !body.ownerId || !body.startAt || !body.endAt) {
    throw new BadRequestError('Missing required fields');
  }

  await withDb(db => {
    const reservation: Reservation = {
      id: generateId('res'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      status: 'Requested',
      type: body.type || 'Boarding',
      petId: body.petId,
      ownerId: body.ownerId,
      startAt: body.startAt,
      endAt: body.endAt,
      isPreChecked: false,
      depositPaid: 0,
      notes: body.notes
    };

    db.reservations.push(reservation);
    logAudit(db, req, 'reservation.create', reservation.id, 'Created reservation');
    
    // Notify
    eventBus.publish('reservation', { action: 'created', id: reservation.id, status: reservation.status });

    sendJson(res, 201, { data: reservation });
  });
};

export const updateReservation: Handler = async (req, res, params) => {
  const { id } = params;
  const body = await parseJsonBody(req);

  await withDb(db => {
    const idx = db.reservations.findIndex(r => r.id === id && r.orgId === req.user!.orgId);
    if (idx === -1) throw new NotFoundError();

    delete body.status; // Protected
    delete body.checkInAt;
    delete body.checkOutAt;

    db.reservations[idx] = { ...db.reservations[idx], ...body, updatedAt: nowISO() };
    logAudit(db, req, 'reservation.update', id, 'Updated fields');
    sendJson(res, 200, { data: db.reservations[idx] });
  });
};

// --- Commands ---

const VALID_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  'Requested': ['Confirmed', 'Cancelled'],
  'Confirmed': ['CheckedIn', 'Cancelled'],
  'CheckedIn': ['CheckedOut'],
  'CheckedOut': [],
  'Cancelled': []
};

const transitionStatus = (
  db: DbSchema, 
  req: any, 
  id: string, 
  targetStatus: ReservationStatus,
  extras: Partial<Reservation> = {}
) => {
  const idx = db.reservations.findIndex(r => r.id === id && r.orgId === req.user!.orgId);
  if (idx === -1) throw new NotFoundError();
  
  const current = db.reservations[idx];
  if (!VALID_TRANSITIONS[current.status].includes(targetStatus)) {
    throw new BadRequestError(`Cannot transition from ${current.status} to ${targetStatus}`);
  }

  db.reservations[idx] = { 
    ...current, 
    status: targetStatus, 
    updatedAt: nowISO(),
    ...extras 
  };
  
  logAudit(db, req, `reservation.${targetStatus.toLowerCase()}`, id, `Status changed to ${targetStatus}`);
  eventBus.publish('reservation', { action: 'status_change', id, status: targetStatus });
  
  return db.reservations[idx];
};

export const confirmReservation: Handler = async (req, res, params) => {
  await withDb(db => {
    const updated = transitionStatus(db, req, params.id, 'Confirmed');
    sendJson(res, 200, { data: updated });
  });
};

export const checkInReservation: Handler = async (req, res, params) => {
  await withDb(db => {
    const updated = transitionStatus(db, req, params.id, 'CheckedIn', { checkInAt: nowISO() });
    sendJson(res, 200, { data: updated });
  });
};

export const checkOutReservation: Handler = async (req, res, params) => {
  await withDb(db => {
    const updated = transitionStatus(db, req, params.id, 'CheckedOut', { checkOutAt: nowISO() });
    sendJson(res, 200, { data: updated });
  });
};

export const cancelReservation: Handler = async (req, res, params) => {
  const { reason } = await parseJsonBody(req);
  await withDb(db => {
    const updated = transitionStatus(db, req, params.id, 'Cancelled');
    if (reason) {
      updated.notes = (updated.notes ? updated.notes + '\n' : '') + `Cancellation Reason: ${reason}`;
    }
    sendJson(res, 200, { data: updated });
  });
};

// --- Segments (Lodging) ---

export const updateSegments: Handler = async (req, res, params) => {
  const { id } = params;
  const segments: Partial<ReservationSegment>[] = await parseJsonBody(req);
  
  if (!Array.isArray(segments)) throw new BadRequestError('Body must be array of segments');

  await withDb(db => {
    const reservation = db.reservations.find(r => r.id === id);
    if (!reservation) throw new NotFoundError();

    for (const seg of segments) {
      if (!seg.startAt || !seg.endAt || !seg.kennelUnitId) throw new BadRequestError('Invalid segment data');
    }

    // Remove old
    db.reservationSegments = db.reservationSegments.filter(s => s.reservationId !== id);
    
    // Add new
    const newEntities: ReservationSegment[] = segments.map(s => ({
      id: generateId('seg'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      reservationId: id,
      kennelUnitId: s.kennelUnitId!,
      startAt: s.startAt!,
      endAt: s.endAt!
    }));

    db.reservationSegments.push(...newEntities);
    logAudit(db, req, 'reservation.segments_updated', id, `Updated ${newEntities.length} segments`);
    
    sendJson(res, 200, { data: newEntities });
  });
};

// --- Line Items (Services) ---

export const updateLineItems: Handler = async (req, res, params) => {
  const { id } = params;
  const items: Partial<ReservationLineItem>[] = await parseJsonBody(req);

  if (!Array.isArray(items)) throw new BadRequestError('Body must be array of line items');

  await withDb(db => {
    const reservation = db.reservations.find(r => r.id === id);
    if (!reservation) throw new NotFoundError();

    // Remove old
    db.reservationLineItems = db.reservationLineItems.filter(l => l.reservationId !== id);

    // Add new
    const newEntities: ReservationLineItem[] = [];
    
    for (const item of items) {
      if (!item.catalogItemId) continue;
      
      const catalogItem = db.catalogItems.find(c => c.id === item.catalogItemId);
      if (!catalogItem) continue;

      newEntities.push({
        id: generateId('li'),
        orgId: req.user!.orgId,
        locationId: req.user!.locationId,
        createdAt: nowISO(),
        updatedAt: nowISO(),
        tags: [],
        reservationId: id,
        catalogItemId: item.catalogItemId,
        quantity: item.quantity || 1,
        date: item.date,
        description: item.description,
        nameSnapshot: catalogItem.name,
        unitPriceCentsSnapshot: catalogItem.basePrice,
        unitTypeSnapshot: catalogItem.type,
        taxableSnapshot: true
      });
    }

    db.reservationLineItems.push(...newEntities);
    logAudit(db, req, 'reservation.lineitems_updated', id, `Updated ${newEntities.length} line items`);
    
    sendJson(res, 200, { data: newEntities });
  });
};

// --- Availability ---

export const checkAvailability: Handler = async (req, res) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const startAt = url.searchParams.get('startAt');
  const endAt = url.searchParams.get('endAt');

  if (!startAt || !endAt) throw new BadRequestError('startAt and endAt required');

  await withDb(db => {
    const units = db.kennelUnits.filter(u => u.orgId === req.user!.orgId && u.status === 'Active');
    
    const activeReservationIds = new Set(
      db.reservations
        .filter(r => ['Requested', 'Confirmed', 'CheckedIn'].includes(r.status))
        .map(r => r.id)
    );

    const conflictingSegments = db.reservationSegments.filter(s => 
      activeReservationIds.has(s.reservationId) &&
      rangesOverlap(s.startAt, s.endAt, startAt, endAt)
    );

    const availability = units.map(unit => {
      const conflicts = conflictingSegments.filter(s => s.kennelUnitId === unit.id);
      return {
        unit,
        available: conflicts.length === 0,
        conflicts: conflicts.map(c => c.reservationId)
      };
    });

    sendJson(res, 200, { data: availability });
  });
};
