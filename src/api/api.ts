
import { apiFetch } from '../auth/auth';
import { Owner, Pet, KennelUnit, CatalogItem, Reservation, ReservationSegment, ReservationLineItem, Estimate, Invoice, Payment, EstimateLineItem, InvoiceLineItem, Agreement, FileObject, Attachment, ReportCard, ReportCardMedia, Notification, NotificationComment, MessageThread, Message, AuditLog, UserAccount, Workflow, WorkflowRun, MembershipDefinition, PackageDefinition, UserLedger } from '../../shared/domain';

// Availability Response
interface AvailabilityResponse {
  data: Array<{
    unit: KennelUnit;
    available: boolean;
    conflicts: string[];
  }>;
}

export const api = {
  // Owners
  getOwners: (params?: { search?: string, archived?: boolean }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch<{ data: Owner[] }>(`/api/owners?${qs}`);
  },
  getOwner: (id: string) => apiFetch<{ data: Owner }>(`/api/owners/${id}`),
  createOwner: (data: Partial<Owner>) => apiFetch<{ data: Owner }>('/api/owners', { method: 'POST', data }),
  updateOwner: (id: string, data: Partial<Owner>) => apiFetch<{ data: Owner }>(`/api/owners/${id}`, { method: 'PATCH', data }),

  // Pets
  getPets: (params?: { ownerId?: string, search?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch<{ data: Pet[] }>(`/api/pets?${qs}`);
  },
  getPet: (id: string) => apiFetch<{ data: Pet }>(`/api/pets/${id}`),
  createPet: (data: Partial<Pet>) => apiFetch<{ data: Pet }>('/api/pets', { method: 'POST', data }),
  updatePet: (id: string, data: Partial<Pet>) => apiFetch<{ data: Pet }>(`/api/pets/${id}`, { method: 'PATCH', data }),
  updatePetVaccinations: (id: string, vaccinations: any[]) => apiFetch<{ data: Pet }>(`/api/pets/${id}/vaccinations`, { method: 'PUT', data: vaccinations }),
  
  // Facilities
  getUnits: () => apiFetch<{ data: KennelUnit[] }>('/api/kennel-units'),
  createUnit: (data: Partial<KennelUnit>) => apiFetch<{ data: KennelUnit }>('/api/kennel-units', { method: 'POST', data }),
  
  // Catalog
  getCatalog: () => apiFetch<{ data: CatalogItem[] }>('/api/catalog-items'),
  createCatalogItem: (data: Partial<CatalogItem>) => apiFetch<{ data: CatalogItem }>('/api/catalog-items', { method: 'POST', data }),

  // Reservations
  getReservations: (params?: { status?: string, dateFrom?: string, dateTo?: string, search?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch<{ data: Reservation[] }>(`/api/reservations?${qs}`);
  },
  getReservation: (id: string) => 
    apiFetch<{ data: Reservation & { segments: ReservationSegment[], lineItems: ReservationLineItem[], pet: Pet, owner: Owner } }>(`/api/reservations/${id}`),
  
  createReservation: (data: Partial<Reservation>) => apiFetch<{ data: Reservation }>('/api/reservations', { method: 'POST', data }),
  updateReservation: (id: string, data: Partial<Reservation>) => apiFetch<{ data: Reservation }>(`/api/reservations/${id}`, { method: 'PATCH', data }),
  
  confirmReservation: (id: string) => apiFetch<{ data: Reservation }>(`/api/reservations/${id}/confirm`, { method: 'POST' }),
  checkInReservation: (id: string) => apiFetch<{ data: Reservation }>(`/api/reservations/${id}/check-in`, { method: 'POST' }),
  checkOutReservation: (id: string) => apiFetch<{ data: Reservation }>(`/api/reservations/${id}/check-out`, { method: 'POST' }),
  cancelReservation: (id: string, reason?: string) => apiFetch<{ data: Reservation }>(`/api/reservations/${id}/cancel`, { method: 'POST', data: { reason } }),

  updateReservationSegments: (id: string, segments: Partial<ReservationSegment>[]) => 
    apiFetch<{ data: ReservationSegment[] }>(`/api/reservations/${id}/segments`, { method: 'PUT', data: segments }),
    
  updateReservationLineItems: (id: string, items: Partial<ReservationLineItem>[]) =>
    apiFetch<{ data: ReservationLineItem[] }>(`/api/reservations/${id}/line-items`, { method: 'PUT', data: items }),

  getAvailability: (startAt: string, endAt: string) => 
    apiFetch<AvailabilityResponse>(`/api/availability?startAt=${startAt}&endAt=${endAt}`),

  // Finance
  createEstimate: (reservationId: string) => 
    apiFetch<{ data: Estimate }>(`/api/reservations/${reservationId}/estimate`, { method: 'POST' }),
  getEstimate: (id: string) => 
    apiFetch<{ data: Estimate & { lineItems: EstimateLineItem[] } }>(`/api/estimates/${id}`),
  updateEstimate: (id: string, data: Partial<Estimate>) =>
    apiFetch<{ data: Estimate }>(`/api/estimates/${id}`, { method: 'PATCH', data }),
  acceptEstimate: (id: string) =>
    apiFetch<{ data: Estimate }>(`/api/estimates/${id}/accept`, { method: 'POST' }),

  createInvoice: (reservationId: string) =>
    apiFetch<{ data: Invoice }>(`/api/reservations/${reservationId}/invoice`, { method: 'POST' }),
  getInvoice: (id: string) =>
    apiFetch<{ data: Invoice & { lineItems: InvoiceLineItem[], payments: Payment[] } }>(`/api/invoices/${id}`),
  listOwnerInvoices: (ownerId: string) =>
    apiFetch<{ data: Invoice[] }>(`/api/owners/${ownerId}/invoices`),
  
  // POS & Payments
  recordPayment: (data: { invoiceId: string, amountCents: number, method: string, reference?: string }) =>
    apiFetch<{ data: Payment }>('/api/payments', { method: 'POST', data }),
  
  posCheckout: (data: { ownerId?: string, items: {catalogItemId: string, quantity: number}[], payment?: {method: string, amountCents: number, reference?: string} }) =>
    apiFetch<{ data: Invoice }>('/api/pos/checkout', { method: 'POST', data }),

  // Loyalty
  getMembershipDefinitions: () => apiFetch<{ data: MembershipDefinition[] }>('/api/memberships/definitions'),
  getPackageDefinitions: () => apiFetch<{ data: PackageDefinition[] }>('/api/packages/definitions'),
  getOwnerLedger: (ownerId: string) => apiFetch<{ data: UserLedger }>(`/api/owners/${ownerId}/ledger`),

  // Files & Attachments
  createAttachment: (data: { entityType: string, entityId: string, fileId: string, label?: string }) =>
    apiFetch<{ data: Attachment }>('/api/attachments', { method: 'POST', data }),
  listAttachments: (entityType: string, entityId: string) =>
    apiFetch<{ data: (Attachment & { file: FileObject })[] }>(`/api/attachments?entityType=${entityType}&entityId=${entityId}`),
  
  // Agreements
  listAgreements: (ownerId: string) =>
    apiFetch<{ data: Agreement[] }>(`/api/owners/${ownerId}/agreements`),
  createAgreement: (ownerId: string, data: { name: string, fileId: string }) =>
    apiFetch<{ data: Agreement }>(`/api/owners/${ownerId}/agreements`, { method: 'POST', data: { ...data, ownerId } }),

  // Report Cards
  listReportCards: (params?: { petId?: string, date?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch<{ data: ReportCard[] }>(`/api/report-cards?${qs}`);
  },
  createReportCard: (data: Partial<ReportCard>) =>
    apiFetch<{ data: ReportCard }>('/api/report-cards', { method: 'POST', data }),
  updateReportCard: (id: string, data: Partial<ReportCard>) =>
    apiFetch<{ data: ReportCard }>(`/api/report-cards/${id}`, { method: 'PATCH', data }),
  addReportCardMedia: (id: string, fileId: string) =>
    apiFetch<{ data: ReportCardMedia }>(`/api/report-cards/${id}/media`, { method: 'POST', data: { fileId } }),
  getReportCardMedia: (id: string) =>
    apiFetch<{ data: (ReportCardMedia & { url: string })[] }>(`/api/report-cards/${id}/media`),

  // Notifications
  listNotifications: (params?: { unreadOnly?: boolean, limit?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch<{ data: Notification[] }>(`/api/notifications?${qs}`);
  },
  markNotificationRead: (id: string) => apiFetch(`/api/notifications/${id}/read`, { method: 'POST' }),
  markNotificationUnread: (id: string) => apiFetch(`/api/notifications/${id}/unread`, { method: 'POST' }),
  listNotificationComments: (id: string) => apiFetch<{ data: NotificationComment[] }>(`/api/notifications/${id}/comments`),
  createNotificationComment: (id: string, text: string) => apiFetch<{ data: NotificationComment }>(`/api/notifications/${id}/comments`, { method: 'POST', data: { text } }),

  // Messaging
  listThreads: (ownerId: string) => apiFetch<{ data: MessageThread[] }>(`/api/owners/${ownerId}/threads`),
  createThread: (ownerId: string, subject: string) => apiFetch<{ data: MessageThread }>(`/api/owners/${ownerId}/threads`, { method: 'POST', data: { subject } }),
  listMessages: (threadId: string) => apiFetch<{ data: Message[] }>(`/api/threads/${threadId}/messages`),
  createMessage: (threadId: string, body: string) => apiFetch<{ data: Message }>(`/api/threads/${threadId}/messages`, { method: 'POST', data: { body } }),

  // Audit
  listAuditLogs: (params?: { entityType?: string, entityId?: string, limit?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return apiFetch<{ data: (AuditLog & { actorName: string })[] }>(`/api/audit-logs?${qs}`);
  },

  // Admin & Users
  listUsers: () => apiFetch<{ data: UserAccount[] }>('/api/users'),
  createUser: (data: Partial<UserAccount> & { password?: string }) => apiFetch<{ data: UserAccount }>('/api/users', { method: 'POST', data }),
  updateUser: (id: string, data: Partial<UserAccount>) => apiFetch<{ data: UserAccount }>(`/api/users/${id}`, { method: 'PATCH', data }),

  // Workflows
  listWorkflows: () => apiFetch<{ data: Workflow[] }>('/api/workflows'),
  createWorkflow: (data: Partial<Workflow> & { steps?: any[] }) => apiFetch<{ data: Workflow }>('/api/workflows', { method: 'POST', data }),
  listWorkflowRuns: () => apiFetch<{ data: (WorkflowRun & { workflowName: string })[] }>('/api/workflow-runs'),
};
