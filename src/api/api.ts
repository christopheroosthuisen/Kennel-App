
import { MOCK_OWNERS, MOCK_PETS, MOCK_RESERVATIONS, MOCK_NOTIFICATIONS, MOCK_UNITS, MOCK_WORKFLOWS, MOCK_WORKFLOW_RUNS } from '../constants';
import { Owner, Pet, KennelUnit, CatalogItem, Reservation, ReservationSegment, ReservationLineItem, Estimate, Invoice, Payment, EstimateLineItem, InvoiceLineItem, Agreement, FileObject, Attachment, ReportCard, ReportCardMedia, Notification, NotificationComment, MessageThread, Message, AuditLog, UserAccount, Workflow, WorkflowRun, MembershipDefinition, PackageDefinition, UserLedger } from '../../shared/domain';

// --- MOCK DATABASE STATE ---
// We initialize state from constants but allow mutation during the session
let DB = {
  owners: JSON.parse(JSON.stringify(MOCK_OWNERS)) as any[],
  pets: JSON.parse(JSON.stringify(MOCK_PETS)) as any[],
  reservations: JSON.parse(JSON.stringify(MOCK_RESERVATIONS)) as any[],
  notifications: JSON.parse(JSON.stringify(MOCK_NOTIFICATIONS)) as any[],
  units: JSON.parse(JSON.stringify(MOCK_UNITS)) as any[],
  workflows: JSON.parse(JSON.stringify(MOCK_WORKFLOWS)) as any[],
  workflowRuns: JSON.parse(JSON.stringify(MOCK_WORKFLOW_RUNS)) as any[],
  catalog: [
    { id: '1', name: 'Premium Kibble', type: 'Retail', basePrice: 2499, category: 'Food' },
    { id: '2', name: 'Standard Boarding', type: 'Service', basePrice: 5500, category: 'Boarding' },
    { id: '3', name: 'Full Day Daycare', type: 'Service', basePrice: 3500, category: 'Daycare' },
    { id: '4', name: 'Exit Bath', type: 'AddOn', basePrice: 3000, category: 'Grooming' },
  ] as any[],
  users: [
    { id: 'u1', name: 'Demo Admin', email: 'admin@local', role: 'Admin', password: 'password', onboarded: true }
  ] as any[]
};

// Helper to simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Response Wrapper
const mockRes = <T>(data: T) => Promise.resolve({ data });

export const api = {
  // --- Auth ---
  login: async (email: string) => {
    await delay(500);
    // Auto-login for demo purposes or check mock users
    const user = DB.users.find(u => u.email === email) || DB.users[0];
    return { 
      token: 'mock-jwt-token',
      user: { ...user, token: 'mock-jwt-token' }
    };
  },
  
  // --- Owners ---
  getOwners: async (params?: { search?: string }) => {
    await delay();
    let res = DB.owners;
    if (params?.search) {
      const q = params.search.toLowerCase();
      res = res.filter(o => o.name?.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q));
    }
    return mockRes(res);
  },
  getOwner: async (id: string) => {
    await delay();
    return mockRes(DB.owners.find(o => o.id === id));
  },
  createOwner: async (data: Partial<Owner>) => {
    await delay();
    const newOwner = { id: `o-${Date.now()}`, ...data, balance: 0, tags: [] };
    DB.owners.push(newOwner);
    return mockRes(newOwner);
  },
  updateOwner: async (id: string, data: Partial<Owner>) => {
    await delay();
    const idx = DB.owners.findIndex(o => o.id === id);
    if (idx >= 0) DB.owners[idx] = { ...DB.owners[idx], ...data };
    return mockRes(DB.owners[idx]);
  },

  // --- Pets ---
  getPets: async (params?: { ownerId?: string, search?: string }) => {
    await delay();
    let res = DB.pets;
    if (params?.ownerId) res = res.filter(p => p.ownerId === params.ownerId);
    if (params?.search) res = res.filter(p => p.name.toLowerCase().includes(params.search!.toLowerCase()));
    return mockRes(res);
  },
  getPet: async (id: string) => {
    await delay();
    return mockRes(DB.pets.find(p => p.id === id));
  },
  createPet: async (data: Partial<Pet>) => {
    await delay();
    const newPet = { 
      id: `p-${Date.now()}`, 
      alerts: [], 
      vaccinations: [], 
      vaccineStatus: 'Unknown',
      ...data 
    };
    DB.pets.push(newPet);
    return mockRes(newPet);
  },
  updatePet: async (id: string, data: Partial<Pet>) => {
    await delay();
    const idx = DB.pets.findIndex(p => p.id === id);
    if (idx >= 0) DB.pets[idx] = { ...DB.pets[idx], ...data };
    return mockRes(DB.pets[idx]);
  },
  updatePetVaccinations: async (id: string, vaccinations: any[]) => {
    await delay();
    const idx = DB.pets.findIndex(p => p.id === id);
    if (idx >= 0) {
      DB.pets[idx].vaccinations = vaccinations;
      DB.pets[idx].vaccineStatus = 'Valid'; // Mock logic
    }
    return mockRes(DB.pets[idx]);
  },

  // --- Reservations ---
  getReservations: async (params?: { status?: string, search?: string }) => {
    await delay();
    let res = DB.reservations;
    if (params?.status && params.status !== 'all') res = res.filter(r => r.status === params.status);
    // Search implies joining with pet/owner, simplified here
    return mockRes(res);
  },
  getReservation: async (id: string) => {
    await delay();
    const r = DB.reservations.find(res => res.id === id);
    const pet = DB.pets.find(p => p.id === r?.petId);
    const owner = DB.owners.find(o => o.id === r?.ownerId);
    return mockRes({ ...r, pet, owner, segments: [], lineItems: [] });
  },
  createReservation: async (data: Partial<Reservation>) => {
    await delay();
    const newRes = { 
      id: `r-${Date.now()}`, 
      status: 'Requested', 
      services: [],
      ...data 
    };
    DB.reservations.push(newRes);
    return mockRes(newRes);
  },
  updateReservation: async (id: string, data: Partial<Reservation>) => {
    await delay();
    const idx = DB.reservations.findIndex(r => r.id === id);
    if (idx >= 0) DB.reservations[idx] = { ...DB.reservations[idx], ...data };
    return mockRes(DB.reservations[idx]);
  },
  confirmReservation: async (id: string) => {
    const idx = DB.reservations.findIndex(r => r.id === id);
    if (idx >= 0) DB.reservations[idx].status = 'Confirmed';
    return mockRes(DB.reservations[idx]);
  },
  checkInReservation: async (id: string) => {
    const idx = DB.reservations.findIndex(r => r.id === id);
    if (idx >= 0) DB.reservations[idx].status = 'CheckedIn';
    return mockRes(DB.reservations[idx]);
  },
  checkOutReservation: async (id: string) => {
    const idx = DB.reservations.findIndex(r => r.id === id);
    if (idx >= 0) DB.reservations[idx].status = 'CheckedOut';
    return mockRes(DB.reservations[idx]);
  },
  updateReservationSegments: async (id: string, segments: any[]) => mockRes(segments),
  updateReservationLineItems: async (id: string, items: any[]) => mockRes(items),
  
  getAvailability: async (start: string, end: string) => {
    await delay();
    return mockRes(DB.units.map(u => ({ unit: u, available: true, conflicts: [] })));
  },

  // --- Facilities ---
  getUnits: async () => mockRes(DB.units),
  createUnit: async (data: any) => {
    const u = { id: `u-${Date.now()}`, ...data };
    DB.units.push(u);
    return mockRes(u);
  },

  // --- Catalog ---
  getCatalog: async () => mockRes(DB.catalog),
  createCatalogItem: async (data: any) => {
    const i = { id: `c-${Date.now()}`, ...data };
    DB.catalog.push(i);
    return mockRes(i);
  },

  // --- Finance (Estimates/Invoices) ---
  createEstimate: async (resId: string) => {
    await delay();
    return mockRes({ 
      id: `est-${Date.now()}`, 
      reservationId: resId, 
      total: 15000, 
      status: 'Draft', 
      lineItems: [],
      subtotal: 14000,
      taxTotal: 1000,
      discount: 0
    });
  },
  getEstimate: async (id: string) => mockRes({ id, total: 15000, subtotal: 14000, taxTotal: 1000, discount: 0, status: 'Draft', lineItems: [] }),
  updateEstimate: async (id: string, data: any) => mockRes({ id, ...data }),
  acceptEstimate: async (id: string) => mockRes({ id, status: 'Accepted' }),
  
  createInvoice: async (resId: string) => mockRes({ id: `inv-${Date.now()}`, total: 15000, status: 'Draft' }),
  getInvoice: async (id: string) => mockRes({ id, total: 15000, status: 'Paid', lineItems: [], payments: [] }),
  listOwnerInvoices: async (ownerId: string) => mockRes([]),
  
  // --- POS ---
  posCheckout: async (data: any) => {
    await delay();
    return mockRes({ id: `ord-${Date.now()}`, status: 'Paid', total: data.payment?.amountCents || 0 });
  },

  // --- Notifications ---
  listNotifications: async (params?: any) => {
    await delay();
    return mockRes(DB.notifications);
  },
  markNotificationRead: async (id: string) => {
    const idx = DB.notifications.findIndex(n => n.id === id);
    if (idx >= 0) DB.notifications[idx].read = true;
    return mockRes({});
  },
  listNotificationComments: async (id: string) => mockRes([]),
  createNotificationComment: async (id: string, text: string) => mockRes({ id: 'c1', text, userName: 'Me', timestamp: new Date().toISOString() }),

  // --- Loyalty ---
  getMembershipDefinitions: async () => mockRes([]),
  getPackageDefinitions: async () => mockRes([]),
  getOwnerLedger: async (ownerId: string) => mockRes({ ownerId, credits: [], activeMembership: null }),

  // --- Files & Report Cards ---
  createAttachment: async (data: any) => mockRes({ id: `att-${Date.now()}`, ...data }),
  listAttachments: async (type: string, id: string) => mockRes([]),
  listAgreements: async (ownerId: string) => mockRes([]),
  createAgreement: async (data: any) => mockRes({ id: `agr-${Date.now()}`, status: 'Signed', ...data }),
  
  listReportCards: async () => mockRes([]),
  createReportCard: async (data: any) => mockRes({ id: `rc-${Date.now()}`, status: 'Draft', ...data }),
  updateReportCard: async (id: string, data: any) => mockRes({ id, ...data }),
  getReportCardMedia: async (id: string) => mockRes([]),
  addReportCardMedia: async (id: string, fileId: string) => mockRes({ id: `m-${Date.now()}`, fileId }),

  // --- Messaging ---
  listThreads: async (ownerId: string) => mockRes([]),
  createThread: async (ownerId: string, subject: string) => mockRes({ id: `th-${Date.now()}`, subject, messages: [] }),
  listMessages: async (threadId: string) => mockRes([]),
  createMessage: async (threadId: string, body: string) => mockRes({ id: `msg-${Date.now()}`, body, createdAt: new Date().toISOString() }),

  // --- Audit ---
  listAuditLogs: async (params?: any) => mockRes([]),

  // --- Admin ---
  listUsers: async () => mockRes(DB.users),
  createUser: async (data: any) => { DB.users.push({ ...data, id: `u-${Date.now()}` }); return mockRes(data); },
  updateUser: async (id: string, data: any) => mockRes(data),

  // --- Workflows ---
  listWorkflows: async () => mockRes(DB.workflows),
  createWorkflow: async (data: any) => {
    const wf = { id: `wf-${Date.now()}`, ...data, stats: { runs: 0, successRate: 0 } };
    DB.workflows.push(wf);
    return mockRes(wf);
  },
  listWorkflowRuns: async () => mockRes(DB.workflowRuns),
};
