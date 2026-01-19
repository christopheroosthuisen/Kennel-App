
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
  vet: string; // Legacy string
  vetClinicId?: string; // Link to new Vet Platform
  veterinarianId?: string; // Link to specific doctor
  feedingInstructions: string;
  behaviorNotes?: string;
  activeProgram?: string; // e.g., "Puppy Jump Start"
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

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'Email' | 'SMS';
  category: 'Reservation' | 'Financial' | 'Health' | 'Operations' | 'Marketing';
  subject?: string; // Only for email
  body: string;
  trigger: string; // Description of event
  active: boolean;
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
  avatarUrl?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

// --- Workflow Engine Types ---

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

// --- Packages & Memberships Types ---

export interface Package {
  id: string;
  name: string;
  internalName: string;
  description: string;
  price: number;
  serviceTypeTarget: ServiceType; // Which service this applies to (e.g., Daycare)
  creditQuantity: number; // How many units (e.g., 5 days)
  expiryDays?: number; // Null = no expiry
  active: boolean;
}

export interface Membership {
  id: string;
  name: string;
  price: number;
  billingFrequency: 'Monthly' | 'Yearly';
  description: string;
  benefits: MembershipBenefit[];
  active: boolean;
}

export interface MembershipBenefit {
  id: string;
  type: 'Discount' | 'Credit'; 
  targetService: ServiceType | 'All' | 'Retail';
  value: number; // Percentage for Discount, Quantity for Credit
  period?: 'Per Month' | 'Per Year' | 'Unlimited'; // For credits
}

// --- Messaging Types ---

export interface Message {
  id: string;
  ownerId: string;
  direction: 'Inbound' | 'Outbound';
  type: 'Email' | 'SMS';
  subject?: string;
  body: string;
  timestamp: string;
  status: 'Sent' | 'Delivered' | 'Read' | 'Failed' | 'Queued';
  sender?: string; // 'System', 'Staff Name', 'Client Name'
  attachments?: string[];
}

export interface Conversation {
  ownerId: string;
  ownerName: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  tags: string[]; // e.g. 'Billing', 'Reservation'
}

// --- Group Class Types ---

export interface ClassType {
  id: string;
  name: string;
  description: string;
  defaultCapacity: number; // 0 = unlimited/open
  defaultPrice: number;
  creditCost: number; // e.g., 1 credit
  color: string;
  requirements?: string[]; // e.g., "Puppy < 6mo", "Vaccines"
  instructorIds?: string[]; // Allowed instructors
}

export interface ClassSession {
  id: string;
  classTypeId: string;
  startTime: string; // ISO Date Time start
  durationMinutes: number;
  instructorId: string;
  capacity: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface ClassEnrollment {
  id: string;
  sessionId: string;
  petId: string;
  ownerId: string;
  status: 'Enrolled' | 'Waitlist' | 'Cancelled' | 'Attended' | 'No Show';
  paymentMethod: 'Package Credit' | 'Drop-In' | 'Membership' | 'Unpaid';
  checkedIn: boolean;
}

// --- Internal Team Chat Types ---

export interface InternalChannel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  description?: string;
  unreadCount: number;
  members: string[]; // User IDs
}

export interface InternalMessageContext {
  type: 'reservation' | 'pet' | 'owner' | 'estimate' | 'report_card' | 'invoice';
  id: string;
  title: string;
  subtitle?: string;
  link?: string;
}

export interface InternalMessage {
  id: string;
  channelId: string;
  senderId: string; // User ID or 'AI'
  content: string;
  timestamp: string;
  reactions: Record<string, number>; // emoji: count
  attachments?: { name: string, type: 'image' | 'file' }[];
  context?: InternalMessageContext;
  isSystem?: boolean;
}

// --- Care Dashboard Types ---

export interface CareTask {
  id: string;
  petId: string;
  unit: string; // "K101"
  type: 'Feeding' | 'Medication';
  shift: 'AM' | 'Noon' | 'PM';
  status: 'Pending' | 'Prepared' | 'Completed' | 'Skipped';
  description: string; // "1 Cup Kibble" or "10mg Apoquel"
  instructions?: string; // "Mix with wet food"
  warning?: boolean; // Allergy or high risk
  assignedTo?: string;
  completedAt?: string;
}

// --- Marketing Types ---

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'Email' | 'SMS';
  status: 'Draft' | 'Scheduled' | 'Sent' | 'Sending';
  sentCount: number;
  openRate?: number;
  clickRate?: number;
  scheduledFor?: string;
  createdAt: string;
  audience: string; // e.g., "All Owners", "Expired Vax"
}

export interface CallLog {
  id: string;
  direction: 'Inbound' | 'Outbound';
  from: string;
  to: string;
  durationSeconds: number;
  timestamp: string;
  status: 'Answered' | 'Missed' | 'Voicemail';
  recordingUrl?: string;
  relatedOwnerId?: string;
}

export interface MarketingConnector {
  id: string;
  provider: 'Twilio' | 'SendGrid' | 'Mailgun' | 'Postmark';
  type: 'SMS' | 'Email' | 'Voice';
  status: 'Connected' | 'Disconnected' | 'Error';
  apiKeyMasked: string;
  phoneNumber?: string;
}

export interface ReportDefinition {
  id: string;
  category: string;
  name: string;
  description: string;
  columns: string[];
}

// --- Service Dashboard Types ---

export type ServiceDepartment = 'Grooming' | 'Training' | 'Enrichment' | 'Medical';

export interface ServiceTask {
  id: string;
  reservationId: string;
  petId: string;
  department: ServiceDepartment;
  name: string; // "Exit Bath", "Puppy 1-on-1"
  status: 'Pending' | 'In Progress' | 'Completed' | 'Skipped';
  scheduledTime: string; // ISO
  durationMinutes: number;
  assignedTo?: string; // User ID
  notes?: string;
  programName?: string; // For training programs
}

// --- AI Agent Types ---

export interface AiAgent {
  id: string;
  name: string;
  description: string;
  icon: any; // Lucide icon
  category: 'Operations' | 'Marketing' | 'Admin' | 'Sales';
  status: 'Idle' | 'Running' | 'Completed' | 'Failed';
  lastRun?: string;
  actionButtonText: string;
}

// --- Vet Platform Types ---

export interface VetClinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  primaryContactName?: string;
  emergency: boolean;
  tags: string[];
  autoRequestRecords: boolean;
  lastRecordRequest?: string;
}

export interface Veterinarian {
  id: string;
  clinicId: string;
  name: string;
  specialty?: string;
  email?: string; // Direct line if different
  phone?: string; // Direct line if different
}
