
import { PlatinumEngine } from '../lib/platinum-engine';

// This file now acts as an Adapter/Bridge. 
// It keeps the interface consistent for the React components but redirects traffic to the local Engine.

const mockRes = <T>(data: T) => Promise.resolve({ data });

export const api = {
  // --- Auth ---
  login: (email: string) => PlatinumEngine.login(email, 'password'), // Engine handles basic auth check

  // --- Owners ---
  getOwners: async (params?: { search?: string }) => {
    const data = await PlatinumEngine.getOwners(params?.search);
    return mockRes(data);
  },
  getOwner: async (id: string) => {
    const data = await PlatinumEngine.getOwnerById(id);
    return mockRes(data);
  },
  createOwner: async (data: any) => {
    const res = await PlatinumEngine.createOwner(data);
    return mockRes(res);
  },
  updateOwner: async (id: string, data: any) => {
    const res = await PlatinumEngine.updateOwner(id, data);
    return mockRes(res);
  },

  // --- Pets ---
  getPets: async (params?: { ownerId?: string, search?: string }) => {
    let data = await PlatinumEngine.getPets(params?.ownerId);
    if (params?.search) {
      data = data.filter((p: any) => p.name.toLowerCase().includes(params.search?.toLowerCase()));
    }
    return mockRes(data);
  },
  getPet: async (id: string) => {
    const data = await PlatinumEngine.getPetById(id);
    return mockRes(data);
  },
  createPet: async (data: any) => {
    const res = await PlatinumEngine.createPet(data);
    return mockRes(res);
  },
  updatePet: async (id: string, data: any) => {
    const res = await PlatinumEngine.updatePet(id, data);
    return mockRes(res);
  },
  updatePetVaccinations: async (id: string, vaccinations: any[]) => {
    // Mock implementation for now inside updatePet
    const res = await PlatinumEngine.updatePet(id, { vaccinations, vaccineStatus: 'Valid' });
    return mockRes(res);
  },

  // --- Reservations ---
  getReservations: async (params?: { status?: string, search?: string }) => {
    let data = await PlatinumEngine.getReservations(params);
    // Search is handled client side mostly in this mock, but we can filter if needed
    return mockRes(data);
  },
  getReservation: async (id: string) => {
    const data = await PlatinumEngine.getReservationById(id);
    return mockRes(data || { segments: [], lineItems: [] }); // Polyfill missing shapes
  },
  createReservation: async (data: any) => {
    const res = await PlatinumEngine.createReservation(data);
    return mockRes(res);
  },
  updateReservation: async (id: string, data: any) => {
    // Simple update proxy
    return mockRes({}); 
  },
  confirmReservation: async (id: string) => mockRes(await PlatinumEngine.updateReservationStatus(id, 'Confirmed')),
  checkInReservation: async (id: string) => mockRes(await PlatinumEngine.updateReservationStatus(id, 'CheckedIn')),
  checkOutReservation: async (id: string) => mockRes(await PlatinumEngine.updateReservationStatus(id, 'CheckedOut')),
  
  // Complex nested updates (Mocked for UI success)
  updateReservationSegments: async (id: string, segments: any[]) => mockRes(segments),
  updateReservationLineItems: async (id: string, items: any[]) => mockRes(items),
  getAvailability: async (start: string, end: string) => {
    const units = await PlatinumEngine.getUnits();
    return mockRes(units.map((u: any) => ({ unit: u, available: true, conflicts: [] })));
  },

  // --- Facilities ---
  getUnits: async () => mockRes(await PlatinumEngine.getUnits()),
  createUnit: async (data: any) => mockRes({ id: 'u-new', ...data }),

  // --- Catalog / POS ---
  getCatalog: async () => mockRes(await PlatinumEngine.getCatalog()),
  createCatalogItem: async (data: any) => mockRes({ id: 'c-new', ...data }),
  posCheckout: async (data: any) => {
    await PlatinumEngine.processOrder(data);
    return mockRes({ id: `ord-${Date.now()}`, status: 'Paid', total: data.payment?.amountCents || 0 });
  },

  // --- Notifications ---
  listNotifications: async (params?: any) => {
    const raw = await PlatinumEngine.getNotifications();
    // Transform legacy mock to domain shape expected by UI
    const data = raw.map((n: any) => ({
      ...n,
      createdAt: n.timestamp, // Map timestamp to createdAt if needed
      readByUserIds: n.read ? ['current-user'] : [], // Mock mapping for read status
    }));
    return mockRes(data);
  },
  markNotificationRead: async (id: string) => mockRes({}),
  listNotificationComments: async (id: string) => mockRes([]),
  createNotificationComment: async (id: string, text: string) => mockRes({ id: 'c1', text, userName: 'Me', timestamp: new Date().toISOString() }),

  // --- Finance ---
  createEstimate: async (resId: string) => mockRes({ id: `est-${Date.now()}`, reservationId: resId, total: 15000, status: 'Draft', lineItems: [] }),
  getEstimate: async (id: string) => mockRes({ id, total: 15000, subtotal: 14000, taxTotal: 1000, discount: 0, status: 'Draft', lineItems: [] }),
  updateEstimate: async (id: string, data: any) => mockRes({ id, ...data }),
  acceptEstimate: async (id: string) => mockRes({ id, status: 'Accepted' }),
  listOwnerInvoices: async (id: string) => mockRes([]), // Pending implementation in Engine

  // --- Files / Misc ---
  createAttachment: async (data: any) => mockRes({ id: `att-${Date.now()}`, ...data }),
  listAttachments: async (type: string, id: string) => mockRes([]),
  listAgreements: async (ownerId: string) => mockRes([]),
  
  listReportCards: async () => mockRes([]),
  createReportCard: async (data: any) => mockRes({ id: `rc-${Date.now()}`, ...data }),
  updateReportCard: async (id: string, data: any) => mockRes({ id, ...data }),
  getReportCardMedia: async (id: string) => mockRes([]),
  addReportCardMedia: async (id: string, fileId: string) => mockRes({}),

  // --- Messaging ---
  listThreads: async (ownerId: string) => mockRes([]),
  createThread: async (ownerId: string, subject: string) => mockRes({ id: 'th-1', subject }),
  listMessages: async (threadId: string) => mockRes([]),
  createMessage: async (threadId: string, body: string) => mockRes({ id: 'msg-1', body, createdAt: new Date().toISOString() }),

  // --- Admin ---
  listUsers: async () => mockRes([{ id: 'u1', name: 'Admin', role: 'Admin', email: 'admin@platinum.com' }]),
  createUser: async (data: any) => mockRes(data),
  updateUser: async (id: string, data: any) => mockRes(data),
  listAuditLogs: async (params?: any) => mockRes([]),
  
  listWorkflows: async () => mockRes([]),
  createWorkflow: async (data: any) => mockRes(data),
  listWorkflowRuns: async () => mockRes([]),
};
