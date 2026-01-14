
export type ID = string;
export type ISODate = string; // ISO 8601 UTC
export type MoneyCents = number; // Integer cents

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

// --- Users & Auth ---

export interface UserAccount extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  passwordHash?: string; // filtered out in responses
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

export interface Agreement extends BaseEntity {
  ownerId: ID;
  name: string;
  status: 'Draft' | 'Sent' | 'Signed' | 'Expired';
  signedAt?: ISODate;
  fileId?: ID; // The signed document
}

export interface Vaccination {
  id?: string;
  name: string;
  dateAdministered: ISODate;
  dateExpires: ISODate;
  verifiedBy?: string;
  fileId?: ID; // Proof of vaccination
}

export interface Medication {
  id?: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  active: boolean;
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
  vaccinations: Vaccination[];
  medications: Medication[];
  photoUrl?: string;
}

// --- Facilities & Catalog ---

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
  sku?: string;
  taxRateId?: ID;
  isActive: boolean;
}

// --- Loyalty & Memberships ---

export interface MembershipBenefit {
  id?: string;
  type: 'DISCOUNT_PERCENT' | 'DISCOUNT_FIXED' | 'CREDIT_DROP';
  value: number; 
  targetCategory: string; // 'ALL', 'SERVICE', 'RETAIL'
  description: string;
}

export interface MembershipDefinition extends BaseEntity {
  name: string;
  price: MoneyCents;
  billingFrequency: 'MONTHLY' | 'ANNUALLY';
  benefits: MembershipBenefit[];
  requiresSignature: boolean;
  colorHex: string;
  isActive: boolean;
}

export interface PackageCreditRule {
  serviceCategory: string; // 'SERVICE', 'GROOMING'
  quantity: number;
  isHourly: boolean;
}

export interface PackageDefinition extends BaseEntity {
  name: string;
  price: MoneyCents;
  description: string;
  credits: PackageCreditRule[];
  expirationDays: number;
  isActive: boolean;
}

export interface CreditBalance extends BaseEntity {
  ownerId: ID;
  packageDefinitionId: ID;
  serviceCategory: string;
  remaining: number; // Hours or Units
  isHourly: boolean;
  expiresAt: ISODate;
}

export interface UserMembership extends BaseEntity {
  ownerId: ID;
  membershipDefinitionId: ID;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  startedAt: ISODate;
  nextBillDate: ISODate;
}

export interface UserLedger {
  ownerId: ID;
  credits: CreditBalance[];
  activeMembership?: UserMembership;
}

// --- Reservations & Operations ---

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
  type: string; // ServiceType: 'Boarding', 'Daycare', etc.
  
  // Planned dates
  startAt: ISODate;
  endAt: ISODate;
  
  // Actual timestamps
  checkInAt?: ISODate;
  checkOutAt?: ISODate;
  
  notes?: string;
  isPreChecked: boolean;
  depositPaid: MoneyCents;
  
  estimateId?: ID; // Linked estimate
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
  description?: string; // Optional override
  quantity: number;
  date?: ISODate; // Optional scheduling
  
  // Snapshots at time of creation
  nameSnapshot: string;
  unitPriceCentsSnapshot: MoneyCents;
  unitTypeSnapshot?: string; 
  taxableSnapshot: boolean;
}

// --- Report Cards & Media ---

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
  fileId: ID; // Direct link to file
  type: 'Photo' | 'Video';
  caption?: string;
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

// --- System & Files ---

export interface FileObject extends BaseEntity {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string; 
  publicUrl?: string; // computed on read
}

export interface Attachment extends BaseEntity {
  fileId: ID;
  entityType: string; 
  entityId: ID;
  label?: string;
}

// --- Notifications & Messaging ---

export interface Notification extends BaseEntity {
  type: 'info' | 'warning' | 'error' | 'success' | 'message';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  title: string;
  message: string;
  readByUserIds: ID[]; // List of users who have read this
  entityType?: string;
  entityId?: ID;
}

export interface NotificationComment extends BaseEntity {
  notificationId: ID;
  userId: ID;
  userName: string; // Snapshot for display
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
  authorId: ID; // User ID
  authorName: string; // Snapshot
  body: string;
  direction: 'Internal'; // For now just internal notes/messages
}

export interface AuditLog extends BaseEntity {
  actorId: ID;
  action: string;
  resourceType: string;
  resourceId: ID;
  diff?: string; 
  details?: string;
}

export interface DomainEvent extends BaseEntity {
  type: string; 
  payload: string; 
  processedAt?: ISODate;
}

export interface Workflow extends BaseEntity {
  name: string;
  triggerType: string;
  triggerConfig: string; 
  steps: string; // JSON string of nodes
  edges: string; // JSON string of edges
  isEnabled: boolean;
}

export interface WorkflowStep {
  id?: string;
  type: string;
  name: string;
  config?: any;
}

export interface WorkflowRun extends BaseEntity {
  workflowId: ID;
  status: 'Running' | 'Completed' | 'Failed';
  currentStepIndex: number;
  contextData: string; 
  error?: string;
}

// --- Constants ---

export const DEFAULT_ORG_ID = 'org_default';
export const DEFAULT_LOCATION_ID = 'loc_default';
