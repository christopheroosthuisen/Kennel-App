
import { apiFetch } from '../auth/auth';
import { 
  Owner, Pet, Reservation, ReservationSegment, ReservationLineItem,
  KennelUnit, CatalogItem, Notification, NotificationComment,
  Estimate, Invoice, MessageThread, Message, UserAccount,
  AuditLog, Workflow, WorkflowRun, ReportCard, ReportCardMedia, Agreement, Attachment,
  EstimateLineItem, Payment
} from '../types/domain';

export interface ApiResponse<T> {
  data: T;
  meta?: any;
}

export interface ListParams {
  search?: string;
  limit?: number;
  offset?: number;
  [key: string]: any;
}

// Helper: Map Server Owner to UI Owner (Add full name if missing)
const mapOwner = (o: Owner): Owner & { name: string } => ({
  ...o,
  name: `${o.firstName} ${o.lastName}`,
});

// Helper: Map Server Pet to UI Pet
const mapPet = (p: Pet): Pet & { weight: number | undefined, alerts: string[] } => ({
  ...p,
  weight: p.weightLbs,
  alerts: [...(p.tags || [])],
});

export const api = {
  // --- Auth ---
  login: (email: string) => Promise.reject(new Error("Use AuthContext")),

  // --- Owners ---
  getOwners: async (params?: ListParams) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    const res = await apiFetch<ApiResponse<Owner[]>>(`/api/owners?${query.toString()}`);
    return { data: res.data.map(mapOwner) };
  },
  getOwner: async (id: string) => {
    const res = await apiFetch<ApiResponse<Owner>>(`/api/owners/${id}`);
    return { data: mapOwner(res.data) };
  },
  createOwner: async (data: Partial<Owner>) => {
    const res = await apiFetch<ApiResponse<Owner>>('/api/owners', { method: 'POST', data });
    return { data: mapOwner(res.data) };
  },
  updateOwner: async (id: string, data: Partial<Owner>) => {
    const res = await apiFetch<ApiResponse<Owner>>(`/api/owners/${id}`, { method: 'PATCH', data });
    return { data: mapOwner(res.data) };
  },

  // --- Pets ---
  getPets: async (params?: { ownerId?: string, search?: string }) => {
    const query = new URLSearchParams();
    if (params?.ownerId) query.set('ownerId', params.ownerId);
    if (params?.search) query.set('search', params.search);
    const res = await apiFetch<ApiResponse<Pet[]>>(`/api/pets?${query.toString()}`);
    return { data: res.data.map(mapPet) };
  },
  getPet: async (id: string) => {
    const res = await apiFetch<ApiResponse<Pet>>(`/api/pets/${id}`);
    return { data: mapPet(res.data) };
  },
  createPet: async (data: Partial<Pet>) => {
    const res = await apiFetch<ApiResponse<Pet>>('/api/pets', { method: 'POST', data });
    return { data: mapPet(res.data) };
  },
  updatePet: async (id: string, data: Partial<Pet>) => {
    const res = await apiFetch<ApiResponse<Pet>>(`/api/pets/${id}`, { method: 'PATCH', data });
    return { data: mapPet(res.data) };
  },
  updatePetVaccinations: async (id: string, vaccinations: any[]) => {
    const res = await apiFetch<ApiResponse<Pet>>(`/api/pets/${id}/vaccinations`, { method: 'PUT', data: vaccinations });
    return { data: mapPet(res.data) };
  },

  // --- Reservations ---
  getReservations: async (params?: { status?: string, search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    const res = await apiFetch<ApiResponse<Reservation[]>>(`/api/reservations?${query.toString()}`);
    return { data: res.data };
  },
  getReservation: async (id: string) => {
    const res = await apiFetch<ApiResponse<Reservation & { segments: ReservationSegment[], lineItems: ReservationLineItem[], pet?: Pet, owner?: Owner }>>(`/api/reservations/${id}`);
    return { data: res.data };
  },
  createReservation: async (data: Partial<Reservation>) => {
    const res = await apiFetch<ApiResponse<Reservation>>('/api/reservations', { method: 'POST', data });
    return { data: res.data };
  },
  updateReservation: async (id: string, data: Partial<Reservation>) => {
    const res = await apiFetch<ApiResponse<Reservation>>(`/api/reservations/${id}`, { method: 'PATCH', data });
    return { data: res.data };
  },
  confirmReservation: async (id: string) => {
    const res = await apiFetch<ApiResponse<Reservation>>(`/api/reservations/${id}/confirm`, { method: 'POST' });
    return { data: res.data };
  },
  checkInReservation: async (id: string) => {
    const res = await apiFetch<ApiResponse<Reservation>>(`/api/reservations/${id}/check-in`, { method: 'POST' });
    return { data: res.data };
  },
  checkOutReservation: async (id: string) => {
    const res = await apiFetch<ApiResponse<Reservation>>(`/api/reservations/${id}/check-out`, { method: 'POST' });
    return { data: res.data };
  },
  cancelReservation: async (id: string, data: { reason: string }) => {
    const res = await apiFetch<ApiResponse<Reservation>>(`/api/reservations/${id}/cancel`, { method: 'POST', data });
    return { data: res.data };
  },
  updateReservationSegments: async (id: string, segments: Partial<ReservationSegment>[]) => {
    const res = await apiFetch<ApiResponse<ReservationSegment[]>>(`/api/reservations/${id}/segments`, { method: 'PUT', data: segments });
    return { data: res.data };
  },
  updateReservationLineItems: async (id: string, items: Partial<ReservationLineItem>[]) => {
    const res = await apiFetch<ApiResponse<ReservationLineItem[]>>(`/api/reservations/${id}/line-items`, { method: 'PUT', data: items });
    return { data: res.data };
  },
  getAvailability: async (startAt: string, endAt: string) => {
    const params = new URLSearchParams({ startAt, endAt });
    return apiFetch<ApiResponse<{ unit: KennelUnit, available: boolean, conflicts: string[] }[]>>(`/api/availability?${params.toString()}`);
  },

  // --- Facilities ---
  getUnits: async () => apiFetch<ApiResponse<KennelUnit[]>>('/api/kennel-units'),
  createUnit: async (data: Partial<KennelUnit>) => apiFetch<ApiResponse<KennelUnit>>('/api/kennel-units', { method: 'POST', data }),

  // --- Catalog ---
  getCatalog: async () => apiFetch<ApiResponse<CatalogItem[]>>('/api/catalog-items'),
  createCatalogItem: async (data: Partial<CatalogItem>) => apiFetch<ApiResponse<CatalogItem>>('/api/catalog-items', { method: 'POST', data }),
  
  // --- POS ---
  posCheckout: async (data: any) => apiFetch<ApiResponse<Invoice>>('/api/pos/checkout', { method: 'POST', data }),

  // --- Notifications ---
  listNotifications: async (params?: { unreadOnly?: boolean }) => {
    const qs = params?.unreadOnly ? '?unreadOnly=true' : '';
    const res = await apiFetch<ApiResponse<Notification[]>>(`/api/notifications${qs}`);
    return { data: res.data }; 
  },
  markNotificationRead: async (id: string) => apiFetch<ApiResponse<Notification>>(`/api/notifications/${id}/read`, { method: 'POST' }),
  listNotificationComments: async (id: string) => apiFetch<ApiResponse<NotificationComment[]>>(`/api/notifications/${id}/comments`),
  createNotificationComment: async (id: string, text: string) => apiFetch<ApiResponse<NotificationComment>>(`/api/notifications/${id}/comments`, { method: 'POST', data: { text } }),

  // --- Finance ---
  createEstimate: async (resId: string) => apiFetch<ApiResponse<Estimate>>(`/api/reservations/${resId}/estimate`, { method: 'POST' }),
  getEstimate: async (id: string) => apiFetch<ApiResponse<Estimate & { lineItems: EstimateLineItem[] }>>(`/api/estimates/${id}`),
  updateEstimate: async (id: string, data: Partial<Estimate>) => apiFetch<ApiResponse<Estimate>>(`/api/estimates/${id}`, { method: 'PATCH', data }),
  acceptEstimate: async (id: string) => apiFetch<ApiResponse<Estimate>>(`/api/estimates/${id}/accept`, { method: 'POST' }),
  listOwnerInvoices: async (id: string) => apiFetch<ApiResponse<Invoice[]>>(`/api/owners/${id}/invoices`),
  createInvoice: async (resId: string) => apiFetch<ApiResponse<Invoice>>(`/api/reservations/${resId}/invoice`, { method: 'POST' }),
  getInvoice: async (id: string) => apiFetch<ApiResponse<Invoice>>(`/api/invoices/${id}`),
  recordPayment: async (data: any) => apiFetch<ApiResponse<Payment>>('/api/payments', { method: 'POST', data }),

  // --- Files ---
  createAttachment: async (data: any) => apiFetch<ApiResponse<Attachment>>('/api/attachments', { method: 'POST', data }),
  listAttachments: async (type: string, id: string) => apiFetch<ApiResponse<Attachment[]>>(`/api/attachments?entityType=${type}&entityId=${id}`),
  listAgreements: async (ownerId: string) => apiFetch<ApiResponse<Agreement[]>>(`/api/owners/${ownerId}/agreements`),
  createAgreement: async (data: any) => apiFetch<ApiResponse<Agreement>>('/api/agreements', { method: 'POST', data }),

  // --- Report Cards ---
  listReportCards: async () => apiFetch<ApiResponse<ReportCard[]>>('/api/report-cards'),
  createReportCard: async (data: Partial<ReportCard>) => apiFetch<ApiResponse<ReportCard>>('/api/report-cards', { method: 'POST', data }),
  updateReportCard: async (id: string, data: Partial<ReportCard>) => apiFetch<ApiResponse<ReportCard>>(`/api/report-cards/${id}`, { method: 'PATCH', data }),
  getReportCardMedia: async (id: string) => apiFetch<ApiResponse<ReportCardMedia[]>>(`/api/report-cards/${id}/media`),
  addReportCardMedia: async (id: string, fileId: string) => apiFetch<ApiResponse<ReportCardMedia>>(`/api/report-cards/${id}/media`, { method: 'POST', data: { fileId } }),

  // --- Messaging ---
  listThreads: async (ownerId: string) => apiFetch<ApiResponse<MessageThread[]>>(`/api/owners/${ownerId}/threads`),
  createThread: async (ownerId: string, subject: string) => apiFetch<ApiResponse<MessageThread>>(`/api/owners/${ownerId}/threads`, { method: 'POST', data: { subject } }),
  listMessages: async (threadId: string) => apiFetch<ApiResponse<Message[]>>(`/api/threads/${threadId}/messages`),
  createMessage: async (threadId: string, body: string) => apiFetch<ApiResponse<Message>>(`/api/threads/${threadId}/messages`, { method: 'POST', data: { body } }),

  // --- Admin ---
  listUsers: async () => apiFetch<ApiResponse<UserAccount[]>>('/api/users'),
  createUser: async (data: Partial<UserAccount>) => apiFetch<ApiResponse<UserAccount>>('/api/users', { method: 'POST', data }),
  updateUser: async (id: string, data: Partial<UserAccount>) => apiFetch<ApiResponse<UserAccount>>(`/api/users/${id}`, { method: 'PATCH', data }),
  listAuditLogs: async (params?: any) => apiFetch<ApiResponse<AuditLog[]>>('/api/audit-logs'),

  listWorkflows: async () => apiFetch<ApiResponse<Workflow[]>>('/api/workflows'),
  getWorkflow: async (id: string) => apiFetch<ApiResponse<Workflow>>(`/api/workflows/${id}`),
  createWorkflow: async (data: Partial<Workflow>) => apiFetch<ApiResponse<Workflow>>('/api/workflows', { method: 'POST', data }),
  updateWorkflow: async (id: string, data: Partial<Workflow>) => apiFetch<ApiResponse<Workflow>>(`/api/workflows/${id}`, { method: 'PATCH', data }),
  listWorkflowRuns: async (workflowId?: string) => {
    const qs = workflowId ? `?workflowId=${workflowId}` : '';
    return apiFetch<ApiResponse<WorkflowRun[]>>(`/api/workflow-runs${qs}`);
  },
};
