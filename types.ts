
export enum ReservationStatus {
  Requested = 'Requested',
  Unconfirmed = 'Unconfirmed',
  Confirmed = 'Confirmed',
  CheckedIn = 'Checked In',
  CheckedOut = 'Checked Out',
  Cancelled = 'Cancelled',
  Expected = 'Expected'
}

export enum ServiceType {
  Boarding = 'Boarding',
  Daycare = 'Daycare',
  Grooming = 'Grooming',
  Training = 'Training'
}

export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
  balance: number;
  address: string;
  notes: string;
  emergencyContact?: { name: string; phone: string; relation: string };
  agreements?: Agreement[];
  files?: FileAttachment[];
  tags?: string[];
}

export interface Agreement {
  id: string;
  name: string;
  signedDate: string;
  status: 'Signed' | 'Pending' | 'Expired';
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  url: string;
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  weight: number;
  dob: string;
  gender: 'M' | 'F';
  fixed: boolean;
  color?: string;
  microchip?: string;
  alerts: string[]; // e.g. "Aggressive", "Meds"
  vaccineStatus: 'Valid' | 'Expiring' | 'Expired';
  vaccines?: Vaccine[];
  medications?: Medication[];
  photoUrl: string;
  vet: string;
  feedingInstructions: string;
  behaviorNotes?: string;
}

export interface Vaccine {
  id: string;
  name: string;
  dateAdministered: string;
  dateExpires: string;
  status: 'Valid' | 'Expiring' | 'Expired';
  verifiedBy?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  active: boolean;
}

export interface Reservation {
  id: string;
  petId: string;
  ownerId: string;
  type: ServiceType;
  status: ReservationStatus;
  checkIn: string; // ISO Date
  checkOut: string; // ISO Date
  lodging?: string;
  notes?: string;
  services: string[]; // Add-on names
  isPreChecked?: boolean;
  price?: number;
}

export interface Invoice {
  id: string;
  ownerId: string;
  reservationId?: string;
  date: string;
  status: 'Draft' | 'Paid' | 'Overdue';
  total: number;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface ReportCard {
  id: string;
  reservationId: string;
  petId: string;
  date: string;
  status: 'Draft' | 'Sent';
  mood: 'Happy' | 'Energetic' | 'Shy' | 'Tired' | 'Anxious';
  activities: string[];
  eating: 'All' | 'Some' | 'None';
  potty: string[];
  notes: string;
  staffId: string;
}

export interface KennelUnit {
  id: string;
  name: string;
  type: 'Run' | 'Suite' | 'Cage' | 'Playroom';
  size: 'S' | 'M' | 'L';
  status: 'Active' | 'Maintenance' | 'Inactive';
}

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  children?: NavItem[];
}

export interface DashboardCount {
  label: string;
  count: number;
  icon: any;
  color: string;
}

export interface NotificationComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'message';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
  relatedPetId?: string;
  relatedOwnerId?: string;
  actionUrl?: string; // Where to go if clicked (e.g., reservation page)
  comments: NotificationComment[];
}

// Admin Config Types
export interface ServiceConfig {
  id: string;
  name: string;
  type: ServiceType;
  baseRate: number;
  unitType: 'Night' | 'Day' | 'Service';
  color: string;
  enabled: boolean;
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'LateCheckOut' | 'Holiday' | 'MultiPet' | 'ExtendedStay';
  amount: number;
  isPercentage: boolean;
  triggerCondition: string;
  enabled: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  trigger: 'ReservationRequested' | 'ReservationConfirmed' | 'CheckOut' | 'VaccineExpired';
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  appliesToServices: boolean;
  appliesToProducts: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Staff';
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

// --- Workflow Engine Types (Block 1-4) ---

export interface Workflow {
  id: string;
  name: string;
  description: string;
  environment: 'draft' | 'staging' | 'production';
  isEnabled: boolean;
  trigger: {
    type: 'Event' | 'Schedule' | 'Webhook';
    details: string;
  };
  steps: WorkflowStep[];
  stats: {
    runsLast24h: number;
    successRate: number;
  };
  lastEdited: string;
}

export interface WorkflowStep {
  id: string;
  type: 'Action' | 'Delay' | 'Condition' | 'Approval' | 'AI';
  name: string;
  config: any;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'Running' | 'Completed' | 'Failed' | 'Waiting for Approval';
  startedAt: string;
  currentStep?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Messaging' | 'Operations' | 'Revenue';
  difficulty: 'Beginner' | 'Advanced';
  stepsCount: number;
}

export interface WorkflowVariable {
  id: string;
  key: string;
  value: string;
  type: 'String' | 'Number' | 'Secret';
  isEncrypted: boolean;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  details: string;
}

export interface ApprovalRequest {
  id: string;
  workflowRunId: string;
  workflowName: string;
  requestedAt: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Denied';
  dataPayload: any;
}
