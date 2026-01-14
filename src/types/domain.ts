
export type ID = string;
export type ISODate = string; 
export type MoneyCents = number;

export type UserRole = "Admin" | "Manager" | "Staff";

export interface BaseEntity {
  id: ID;
  orgId: ID;
  locationId: ID;
  createdAt: ISODate;
  updatedAt: ISODate;
  archivedAt?: ISODate | null;
  tags: string[];
}

// --- Organizations & Users ---

export interface Organization extends BaseEntity {
  name: string;
  subdomain?: string;
  settings?: Record<string, any>;
}

export interface Location extends BaseEntity {
  name: string;
  address?: string;
  timezone?: string;
}

export interface UserAccount extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  lastLoginAt?: ISODate;
}

// --- CRM ---

export interface Owner extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  balance: MoneyCents;
  notes?: string;
}

export interface Pet extends BaseEntity {
  ownerId: ID;
  name: string;
  breed: string;
  weightLbs?: number;
  dob?: ISODate;
  gender: 'M' | 'F';
  fixed: boolean;
  color?: string;
  microchip?: string;
  vetName?: string;
  feedingInstructions?: string;
  behaviorNotes?: string;
  medicalNotes?: string;
  vaccineStatus: 'Valid' | 'Expiring' | 'Expired' | 'Unknown';
  vaccinations: any[];
  medications: any[];
  photoUrl?: string;
}

// --- Operations ---

export const ServiceType = {
  Boarding: 'Boarding',
  Daycare: 'Daycare',
  Grooming: 'Grooming',
  Training: 'Training'
} as const;

export type ServiceType = typeof ServiceType[keyof typeof ServiceType];

export type ReservationStatus = 
  | 'Requested' 
  | 'Confirmed' 
  | 'CheckedIn' 
  | 'CheckedOut' 
  | 'Cancelled';

export interface Reservation extends BaseEntity {
  petId: ID;
  ownerId: ID;
  status: ReservationStatus;
  type: string;
  startAt: ISODate;
  endAt: ISODate;
  checkInAt?: ISODate;
  checkOutAt?: ISODate;
  notes?: string;
  isPreChecked: boolean;
  depositPaid: MoneyCents;
  estimateId?: ID;
}

export interface ReservationSegment extends BaseEntity {
  reservationId: ID;
  kennelUnitId: ID;
  startAt: ISODate;
  endAt: ISODate;
}

export interface ReservationLineItem extends BaseEntity {
  reservationId: ID;
  catalogItemId: ID;
  description?: string;
  quantity: number;
  date?: ISODate;
  nameSnapshot: string;
  unitPriceCentsSnapshot: MoneyCents;
  unitTypeSnapshot?: string;
  taxableSnapshot: boolean;
}

export interface KennelUnit extends BaseEntity {
  name: string;
  type: 'Run' | 'Suite' | 'Cage' | 'Playroom';
  size: 'S' | 'M' | 'L' | 'XL';
  status: 'Active' | 'Maintenance' | 'Inactive';
}

export interface CatalogItem extends BaseEntity {
  name: string;
  type: 'Service' | 'Retail' | 'AddOn';
  category: string;
  basePrice: MoneyCents;
  isActive: boolean;
  sku?: string;
  taxRateId?: ID;
}

// --- Finance ---

export interface Estimate extends BaseEntity {
  reservationId?: ID;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired';
  expiryDate?: ISODate;
  subtotal: MoneyCents;
  taxTotal: MoneyCents;
  discount: MoneyCents;
  total: MoneyCents;
  depositRequired: MoneyCents;
  notes?: string;
}

export interface EstimateLineItem extends BaseEntity {
  estimateId: ID;
  catalogItemId?: ID;
  description: string;
  quantity: number;
  unitPrice: MoneyCents;
  totalPrice: MoneyCents;
}

export interface Invoice extends BaseEntity {
  ownerId: ID;
  reservationId?: ID;
  estimateId?: ID;
  status: 'Draft' | 'Sent' | 'Paid' | 'Void' | 'Overdue' | 'PartiallyPaid';
  dueDate: ISODate;
  subtotal: MoneyCents;
  taxTotal: MoneyCents;
  discount: MoneyCents;
  total: MoneyCents;
  amountPaid: MoneyCents;
  balanceDue: MoneyCents;
}

export interface InvoiceLineItem extends BaseEntity {
  invoiceId: ID;
  catalogItemId?: ID;
  description: string;
  quantity: number;
  unitPrice: MoneyCents;
  totalPrice: MoneyCents;
}

export interface Payment extends BaseEntity {
  invoiceId?: ID;
  ownerId: ID;
  amount: MoneyCents;
  method: 'CreditCard' | 'Cash' | 'Check' | 'Terminal' | 'Other';
  reference?: string;
  status: 'Success' | 'Failed' | 'Refunded';
}

// --- Automation & System ---

export interface WorkflowStep {
  id?: string;
  type: string;
  name: string;
  config?: any;
}

export interface Workflow extends BaseEntity {
  name: string;
  triggerType: string;
  triggerConfig: string; 
  steps: string; // JSON of nodes
  edges: string; // JSON of edges
  isEnabled: boolean;
}

export interface WorkflowRun extends BaseEntity {
  workflowId: ID;
  status: 'Running' | 'Completed' | 'Failed';
  currentStepIndex: number;
  contextData: string; 
  error?: string;
  workflowName?: string;
}

export interface Notification extends BaseEntity {
  type: 'info' | 'warning' | 'error' | 'success' | 'message';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  title: string;
  message: string;
  readByUserIds: ID[];
  entityType?: string;
  entityId?: ID;
}

export interface NotificationComment extends BaseEntity {
  notificationId: ID;
  userId: ID;
  userName: string;
  text: string;
}

export interface MessageThread extends BaseEntity {
  ownerId: ID;
  subject: string;
  status: 'Open' | 'Closed' | 'Archived';
  lastMessageAt: ISODate;
}

export interface Message extends BaseEntity {
  threadId: ID;
  authorId: ID;
  authorName: string;
  body: string;
  direction: 'Internal'; 
}

export interface AuditLog extends BaseEntity {
  actorId: ID;
  actorName?: string; // Hydrated
  action: string;
  resourceType: string;
  resourceId: ID;
  diff?: string;
  details?: string;
}

export interface Attachment extends BaseEntity {
  fileId: ID;
  entityType: string;
  entityId: ID;
  label?: string;
  file?: { originalName: string, mimeType: string, publicUrl?: string }; // Hydrated
}

export interface Agreement extends BaseEntity {
  ownerId: ID;
  name: string;
  status: 'Draft' | 'Sent' | 'Signed' | 'Expired';
  signedAt?: ISODate;
  fileId?: ID;
}

export interface ReportCard extends BaseEntity {
  reservationId?: ID;
  petId: ID;
  staffId: ID;
  date: ISODate;
  status: 'Draft' | 'Sent';
  mood: string;
  activities: string[];
  eating: 'All' | 'Some' | 'None';
  potty: string[]; 
  notes: string;
}

export interface ReportCardMedia extends BaseEntity {
  reportCardId: ID;
  fileId: ID;
  type: 'Photo' | 'Video';
  caption?: string;
  url?: string; // Hydrated
}
