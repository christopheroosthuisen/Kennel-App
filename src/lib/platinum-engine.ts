
import { MOCK_OWNERS, MOCK_PETS, MOCK_RESERVATIONS, MOCK_NOTIFICATIONS, MOCK_UNITS, MOCK_WORKFLOWS } from '../constants';

// --- MOCK DATABASE (LocalStorage Backed) ---
const STORAGE_KEY = 'platinum_db_v1';

const DEFAULT_DB = {
  user: {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@platinum.com',
    role: 'ADMIN',
    avatar: 'https://i.pravatar.cc/150?u=admin',
    token: 'mock-jwt-token-123'
  },
  owners: JSON.parse(JSON.stringify(MOCK_OWNERS)),
  pets: JSON.parse(JSON.stringify(MOCK_PETS)),
  reservations: JSON.parse(JSON.stringify(MOCK_RESERVATIONS)),
  notifications: JSON.parse(JSON.stringify(MOCK_NOTIFICATIONS)),
  inventory: [
    { id: '101', name: 'Premium Kibble', price: 8500, category: 'Retail', stock: 15, sku: 'FD-001' }, // Cents
    { id: '102', name: 'Full Grooming', price: 9500, category: 'Service', stock: 999, sku: 'SVC-GRM' },
    { id: '103', name: 'Luxury Leash', price: 4500, category: 'Retail', stock: 3, sku: 'ACC-LSH' }
  ],
  units: JSON.parse(JSON.stringify(MOCK_UNITS)),
  workflows: JSON.parse(JSON.stringify(MOCK_WORKFLOWS))
};

const loadDB = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error("DB Load Error", e); }
  return DEFAULT_DB;
};

const saveDB = (db: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) { console.error("DB Save Error", e); }
};

// --- SIMULATED LATENCY ---
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const PlatinumEngine = {
  // --- AUTHENTICATION ---
  login: async (email: string, pass: string) => {
    await delay(600);
    // Dev bypass
    if (email === 'admin@platinum.com' || email === 'demo@platinum.com') {
      const db = loadDB();
      return { success: true, user: db.user };
    }
    return { success: false, message: 'Invalid Credentials' };
  },

  // --- CRM (OWNERS) ---
  getOwners: async (search?: string) => {
    await delay();
    const db = loadDB();
    let res = db.owners;
    if (search) {
      const q = search.toLowerCase();
      res = res.filter((o: any) => o.name?.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q));
    }
    return res;
  },
  getOwnerById: async (id: string) => {
    await delay();
    const db = loadDB();
    return db.owners.find((o: any) => o.id === id) || null;
  },
  createOwner: async (data: any) => {
    await delay();
    const db = loadDB();
    const newOwner = { id: `o-${Date.now()}`, ...data, balance: 0, tags: [] };
    db.owners.push(newOwner);
    saveDB(db);
    return newOwner;
  },
  updateOwner: async (id: string, data: any) => {
    await delay();
    const db = loadDB();
    const idx = db.owners.findIndex((o: any) => o.id === id);
    if (idx > -1) {
      db.owners[idx] = { ...db.owners[idx], ...data };
      saveDB(db);
      return db.owners[idx];
    }
    return null;
  },

  // --- PETS ---
  getPets: async (ownerId?: string) => {
    await delay();
    const db = loadDB();
    let res = db.pets;
    if (ownerId) res = res.filter((p: any) => p.ownerId === ownerId);
    return res;
  },
  getPetById: async (id: string) => {
    await delay();
    const db = loadDB();
    return db.pets.find((p: any) => p.id === id) || null;
  },
  createPet: async (data: any) => {
    await delay();
    const db = loadDB();
    const newPet = { id: `p-${Date.now()}`, alerts: [], ...data };
    db.pets.push(newPet);
    saveDB(db);
    return newPet;
  },
  updatePet: async (id: string, data: any) => {
    await delay();
    const db = loadDB();
    const idx = db.pets.findIndex((p: any) => p.id === id);
    if (idx > -1) {
      db.pets[idx] = { ...db.pets[idx], ...data };
      saveDB(db);
      return db.pets[idx];
    }
    return null;
  },

  // --- RESERVATIONS ---
  getReservations: async (filters?: any) => {
    await delay();
    const db = loadDB();
    let res = db.reservations;
    if (filters?.status) res = res.filter((r: any) => r.status === filters.status);
    return res;
  },
  getReservationById: async (id: string) => {
    await delay();
    const db = loadDB();
    const r = db.reservations.find((res: any) => res.id === id);
    if (!r) return null;
    // Join data for UI convenience
    const pet = db.pets.find((p: any) => p.id === r.petId);
    const owner = db.owners.find((o: any) => o.id === r.ownerId);
    return { ...r, pet, owner };
  },
  createReservation: async (data: any) => {
    await delay();
    const db = loadDB();
    const newRes = { id: `r-${Date.now()}`, status: 'Requested', services: [], ...data };
    db.reservations.push(newRes);
    saveDB(db);
    return newRes;
  },
  updateReservationStatus: async (id: string, status: string) => {
    await delay();
    const db = loadDB();
    const idx = db.reservations.findIndex((r: any) => r.id === id);
    if (idx > -1) {
      db.reservations[idx].status = status;
      saveDB(db);
      return db.reservations[idx];
    }
    return null;
  },

  // --- POS / INVENTORY ---
  getCatalog: async () => {
    await delay();
    const db = loadDB();
    return db.inventory;
  },
  processOrder: async (order: any) => {
    await delay(800);
    // Logic to deduct stock would go here
    return { success: true, orderId: `ord-${Date.now()}` };
  },

  // --- NOTIFICATIONS ---
  getNotifications: async () => {
    await delay();
    const db = loadDB();
    return db.notifications;
  },
  
  // --- SYSTEM ---
  getUnits: async () => {
    await delay();
    const db = loadDB();
    return db.units;
  }
};
