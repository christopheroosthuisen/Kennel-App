
import { Handler } from '../router';
import { parseJsonBody, sendJson } from '../http';
import { NotFoundError, BadRequestError } from '../errors';
import { withDb } from '../db';
import { generateId, nowISO } from '../../../shared/utils';
import { validateOwnerPayload, validatePetPayload, validateUnitPayload, validateCatalogItemPayload } from '../../../shared/validators';
import { Owner, Pet, KennelUnit, CatalogItem } from '../../../shared/domain';

// --- Owners ---

export const listOwners: Handler = async (req, res, params) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const search = url.searchParams.get('search')?.toLowerCase() || '';
  const archived = url.searchParams.get('archived') === 'true';

  await withDb(db => {
    let owners = db.owners.filter(o => 
      o.orgId === req.user!.orgId && 
      (archived ? !!o.archivedAt : !o.archivedAt)
    );

    if (search) {
      owners = owners.filter(o => 
        o.firstName.toLowerCase().includes(search) || 
        o.lastName.toLowerCase().includes(search) || 
        o.email.toLowerCase().includes(search) ||
        o.phone.includes(search)
      );
    }

    sendJson(res, 200, { data: owners });
  });
};

export const getOwner: Handler = async (req, res, params) => {
  const { id } = params;
  await withDb(db => {
    const owner = db.owners.find(o => o.id === id && o.orgId === req.user!.orgId);
    if (!owner) throw new NotFoundError('Owner not found');
    sendJson(res, 200, { data: owner });
  });
};

export const createOwner: Handler = async (req, res) => {
  const body = await parseJsonBody(req);
  validateOwnerPayload(body);

  await withDb(db => {
    const owner: Owner = {
      id: generateId('o'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      balance: 0,
      ...body
    };
    
    db.owners.push(owner);
    
    // Log
    db.auditLogs.push({
      id: generateId('al'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      actorId: req.user!.id,
      action: 'owner.create',
      resourceType: 'Owner',
      resourceId: owner.id,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: []
    });

    sendJson(res, 201, { data: owner });
  });
};

export const updateOwner: Handler = async (req, res, params) => {
  const { id } = params;
  const body = await parseJsonBody(req);
  
  await withDb(db => {
    const index = db.owners.findIndex(o => o.id === id && o.orgId === req.user!.orgId);
    if (index === -1) throw new NotFoundError('Owner not found');

    const updated = {
      ...db.owners[index],
      ...body,
      updatedAt: nowISO()
    };
    
    db.owners[index] = updated;
    sendJson(res, 200, { data: updated });
  });
};

// --- Pets ---

export const listPets: Handler = async (req, res) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const ownerId = url.searchParams.get('ownerId');
  const search = url.searchParams.get('search')?.toLowerCase() || '';

  await withDb(db => {
    let pets = db.pets.filter(p => p.orgId === req.user!.orgId && !p.archivedAt);

    if (ownerId) {
      pets = pets.filter(p => p.ownerId === ownerId);
    }

    if (search) {
      pets = pets.filter(p => p.name.toLowerCase().includes(search));
    }

    sendJson(res, 200, { data: pets });
  });
};

export const getPet: Handler = async (req, res, params) => {
  const { id } = params;
  await withDb(db => {
    const pet = db.pets.find(p => p.id === id && p.orgId === req.user!.orgId);
    if (!pet) throw new NotFoundError('Pet not found');
    sendJson(res, 200, { data: pet });
  });
};

export const createPet: Handler = async (req, res) => {
  const body = await parseJsonBody(req);
  validatePetPayload(body);

  await withDb(db => {
    const pet: Pet = {
      id: generateId('p'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      vaccineStatus: 'Unknown',
      vaccinations: [],
      medications: [],
      fixed: false,
      gender: 'M',
      ...body
    };

    db.pets.push(pet);
    sendJson(res, 201, { data: pet });
  });
};

export const updatePet: Handler = async (req, res, params) => {
  const { id } = params;
  const body = await parseJsonBody(req);

  await withDb(db => {
    const index = db.pets.findIndex(p => p.id === id && p.orgId === req.user!.orgId);
    if (index === -1) throw new NotFoundError('Pet not found');

    const updated = { ...db.pets[index], ...body, updatedAt: nowISO() };
    db.pets[index] = updated;
    sendJson(res, 200, { data: updated });
  });
};

export const updatePetMedical: Handler = async (req, res, params) => {
  const { id } = params;
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const type = url.pathname.endsWith('vaccinations') ? 'vaccinations' : 'medications';
  const body = await parseJsonBody(req); // Array of Vax or Meds

  await withDb(db => {
    const index = db.pets.findIndex(p => p.id === id && p.orgId === req.user!.orgId);
    if (index === -1) throw new NotFoundError('Pet not found');

    if (!Array.isArray(body)) throw new BadRequestError('Body must be an array');

    const pet = db.pets[index];
    if (type === 'vaccinations') {
      pet.vaccinations = body;
      // Simple status logic
      const now = new Date();
      const hasExpired = body.some(v => new Date(v.dateExpires) < now);
      pet.vaccineStatus = hasExpired ? 'Expired' : body.length > 0 ? 'Valid' : 'Unknown';
    } else {
      pet.medications = body;
    }
    
    pet.updatedAt = nowISO();
    sendJson(res, 200, { data: pet });
  });
};

// --- Kennel Units ---

export const listUnits: Handler = async (req, res) => {
  await withDb(db => {
    const units = db.kennelUnits.filter(u => u.orgId === req.user!.orgId && !u.archivedAt);
    sendJson(res, 200, { data: units });
  });
};

export const createUnit: Handler = async (req, res) => {
  const body = await parseJsonBody(req);
  validateUnitPayload(body);

  await withDb(db => {
    const unit: KennelUnit = {
      id: generateId('k'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      status: 'Active',
      ...body
    };
    db.kennelUnits.push(unit);
    sendJson(res, 201, { data: unit });
  });
};

// --- Catalog ---

export const listCatalog: Handler = async (req, res) => {
  await withDb(db => {
    const items = db.catalogItems.filter(i => i.orgId === req.user!.orgId);
    sendJson(res, 200, { data: items });
  });
};

export const createCatalogItem: Handler = async (req, res) => {
  const body = await parseJsonBody(req);
  validateCatalogItemPayload(body);

  await withDb(db => {
    const item: CatalogItem = {
      id: generateId('cat'),
      orgId: req.user!.orgId,
      locationId: req.user!.locationId,
      createdAt: nowISO(),
      updatedAt: nowISO(),
      tags: [],
      isActive: true,
      category: 'General',
      ...body
    };
    db.catalogItems.push(item);
    sendJson(res, 201, { data: item });
  });
};
