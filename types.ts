
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

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Staff';
  orgId?: string;
  onboarded: boolean;
  avatarUrl?: string;
}

export interface Organization {
  id: string;
  name: string;
  address: string;
  phone: string;
  timezone: string;
  description: string;
  welcomeMessage: string;
  capacity: {
    runs: number;
    suites: number;
    playrooms: number;
  };
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
  alerts: string[];
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
  orgId: string;
  type: ServiceType;
  status: ReservationStatus;
  checkIn: string;
  checkOut: string;
  lodging?: string;
  notes?: string;
  services: string[];
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
  actionUrl?: string;
  comments: NotificationComment[];
}

export interface NotificationComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export interface ServiceConfig {
  id: string;
  name: string;
  type: ServiceType;
  baseRate: number;
  unitType: 'Night' | 'Day' | 'Service';
  color: string;
  enabled: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  environment: 'draft' | 'staging' | 'production';
  isEnabled: boolean;
  steps: WorkflowStep[];
  trigger: {
    type: string;
    details: string;
  };
  stats: {
    runsLast24h: number;
    successRate: number;
  };
  lastEdited: string;
}

export interface WorkflowStep {
  id: string;
  type: string;
  name: string;
  config: any;
}

export interface PricingRule {
  id: string;
  name: string;
  type: string;
  amount: number;
  isPercentage: boolean;
  triggerCondition: string;
  enabled: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  trigger: string;
  subject: string;
  body: string;
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
  role: string;
  status: string;
  lastLogin: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'Completed' | 'Failed' | 'Waiting for Approval' | 'Running';
  startedAt: string;
  currentStep?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  stepsCount: number;
}

export interface WorkflowVariable {
  id: string;
  key: string;
  value: string;
  type: string;
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
  status: string;
  dataPayload: any;
}
