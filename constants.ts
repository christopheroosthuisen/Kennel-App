
import { Owner, Pet, Reservation, ReservationStatus, ServiceType, Notification, Invoice, ReportCard, KennelUnit, ServiceConfig, PricingRule, CommunicationTemplate, TaxRate, UserAccount, AutomationRule, Workflow, WorkflowRun, WorkflowTemplate, WorkflowVariable, AuditLogEntry, ApprovalRequest, Package, Membership, Message, ClassType, ClassSession, ClassEnrollment, InternalChannel, InternalMessage, CareTask, MarketingCampaign, CallLog, MarketingConnector, ReportDefinition, ServiceTask, AiAgent, VetClinic, Veterinarian } from './types';
import { ShieldCheck, UserX, Camera, TrendingUp, ClipboardList } from 'lucide-react';

export const MOCK_OWNERS: Owner[] = [
  { 
    id: 'o1', name: 'Alice Johnson', phone: '555-0101', email: 'alice@example.com', balance: 0, address: '123 Maple St, Phoenix, AZ', notes: 'Prefer text messages.',
    tags: ['VIP', 'Trusted'],
    emergencyContact: { name: 'Tom Johnson', phone: '555-9999', relation: 'Spouse' },
    agreements: [
      { id: 'a1', name: 'Service Agreement 2023', signedDate: '2023-01-15', status: 'Signed' },
      { id: 'a2', name: 'Medical Release', signedDate: '2023-01-15', status: 'Signed' }
    ],
    files: [
      { id: 'f1', name: 'Drivers License.pdf', type: 'ID', uploadDate: '2023-01-15', url: '#' }
    ]
  },
  { 
    id: 'o2', name: 'Bob Smith', phone: '555-0102', email: 'bob@example.com', balance: 45.00, address: '456 Oak Ave, Scottsdale, AZ', notes: 'Late pickup often.',
    tags: ['Late Pickup'],
    emergencyContact: { name: 'Sarah Smith', phone: '555-8888', relation: 'Sister' },
    agreements: [
       { id: 'a3', name: 'Service Agreement 2023', signedDate: '2023-05-20', status: 'Signed' }
    ]
  },
  { id: 'o3', name: 'Carol Williams', phone: '555-0103', email: 'carol@example.com', balance: -150.00, address: '789 Pine Ln', notes: '' },
  { id: 'o4', name: 'David Brown', phone: '555-0104', email: 'david@example.com', balance: 0, address: '321 Elm St', notes: 'VIP Client' },
];

export const MOCK_PETS: Pet[] = [
  { 
    id: 'p1', ownerId: 'o1', name: 'Rex', breed: 'Golden Retriever', weight: 75, dob: '2019-05-15', gender: 'M', fixed: true, 
    color: 'Golden', microchip: '9851123456789',
    alerts: ['Meds'], vaccineStatus: 'Valid', photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop', vet: 'Dr. Treat', vetClinicId: 'vc1', 
    feedingInstructions: '2 cups Dry Kibble AM/PM. Mix in wet food on Sundays.',
    behaviorNotes: 'Friendly with all dogs. Loves playing fetch. Can be shy around loud noises.',
    vaccines: [
      { id: 'v1', name: 'Rabies', dateAdministered: '2022-06-01', dateExpires: '2025-06-01', status: 'Valid' },
      { id: 'v2', name: 'Bordetella', dateAdministered: '2023-05-15', dateExpires: '2024-05-15', status: 'Valid' },
      { id: 'v3', name: 'DHPP', dateAdministered: '2022-06-01', dateExpires: '2025-06-01', status: 'Valid' }
    ],
    medications: [
      { id: 'm1', name: 'Apoquel', dosage: '16mg', frequency: 'Once Daily', instructions: 'Give with breakfast', active: true }
    ],
    activeProgram: 'Senior Wellness'
  },
  { 
    id: 'p2', ownerId: 'o1', name: 'Bella', breed: 'Labrador', weight: 60, dob: '2020-08-10', gender: 'F', fixed: true, 
    alerts: [], vaccineStatus: 'Expiring', photoUrl: 'https://images.unsplash.com/photo-1591769225440-811ad7d6eca6?w=200&h=200&fit=crop', vet: 'Dr. Treat', vetClinicId: 'vc1', feedingInstructions: '1.5 cups AM/PM',
    vaccines: [
      { id: 'v4', name: 'Rabies', dateAdministered: '2021-01-01', dateExpires: '2024-01-01', status: 'Expiring' }
    ],
    activeProgram: 'Weight Management'
  },
  { id: 'p3', ownerId: 'o2', name: 'Charlie', breed: 'Beagle', weight: 25, dob: '2021-01-20', gender: 'M', fixed: false, alerts: ['Aggressive'], vaccineStatus: 'Valid', photoUrl: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&h=200&fit=crop', vet: 'City Vet', vetClinicId: 'vc2', feedingInstructions: '1 cup AM', activeProgram: 'Obedience Level 1' },
  { id: 'p4', ownerId: 'o3', name: 'Luna', breed: 'Poodle', weight: 40, dob: '2018-11-05', gender: 'F', fixed: true, alerts: [], vaccineStatus: 'Expired', photoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&h=200&fit=crop', vet: 'City Vet', vetClinicId: 'vc2', feedingInstructions: 'Free feed' },
  { id: 'p5', ownerId: 'o4', name: 'Max', breed: 'German Shepherd', weight: 85, dob: '2022-03-10', gender: 'M', fixed: true, alerts: ['Separation Anxiety'], vaccineStatus: 'Valid', photoUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=200&h=200&fit=crop', vet: 'Dr. Treat', vetClinicId: 'vc1', feedingInstructions: '3 cups PM', activeProgram: 'Puppy Jump Start' },
];

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: 'r1', petId: 'p1', ownerId: 'o1', type: ServiceType.Boarding, status: ReservationStatus.CheckedIn, checkIn: '2023-10-25T08:00:00', checkOut: '2023-10-30T10:00:00', lodging: 'K101', services: ['Bath', 'Nail Trim'], isPreChecked: true, price: 450 },
  { id: 'r2', petId: 'p2', ownerId: 'o1', type: ServiceType.Boarding, status: ReservationStatus.CheckedIn, checkIn: '2023-10-25T08:00:00', checkOut: '2023-10-30T10:00:00', lodging: 'K102', services: [], isPreChecked: true, price: 400 },
  { id: 'r3', petId: 'p3', ownerId: 'o2', type: ServiceType.Daycare, status: ReservationStatus.Expected, checkIn: '2023-10-27T07:30:00', checkOut: '2023-10-27T18:00:00', lodging: 'Playgroup A', services: ['Lunch'], isPreChecked: false, price: 35 },
  { id: 'r4', petId: 'p4', ownerId: 'o3', type: ServiceType.Grooming, status: ReservationStatus.Requested, checkIn: '2023-10-28T10:00:00', checkOut: '2023-10-28T12:00:00', services: ['Full Groom'], isPreChecked: false, price: 85 },
  { id: 'r5', petId: 'p1', ownerId: 'o1', type: ServiceType.Daycare, status: ReservationStatus.CheckedOut, checkIn: '2023-10-24T08:00:00', checkOut: '2023-10-24T17:30:00', lodging: 'Playgroup B', services: [], isPreChecked: true, price: 35 },
  { id: 'r6', petId: 'p3', ownerId: 'o2', type: ServiceType.Boarding, status: ReservationStatus.Unconfirmed, checkIn: '2023-11-01T08:00:00', checkOut: '2023-11-05T10:00:00', lodging: 'Suite 1', services: ['Exit Bath'], isPreChecked: false, price: 550 },
  { id: 'r7', petId: 'p5', ownerId: 'o4', type: ServiceType.Boarding, status: ReservationStatus.Confirmed, checkIn: '2023-10-29T14:00:00', checkOut: '2023-11-02T10:00:00', lodging: 'K103', services: [], isPreChecked: false, price: 320 },
];

export const MOCK_INVOICES: Invoice[] = [
  { 
    id: 'inv1', ownerId: 'o1', reservationId: 'r5', date: '2023-10-24', status: 'Paid', total: 35.00,
    items: [{ id: 'i1', description: 'Full Day Daycare', quantity: 1, price: 35.00 }]
  },
  { 
    id: 'inv2', ownerId: 'o2', reservationId: 'r3', date: '2023-10-27', status: 'Draft', total: 40.00,
    items: [{ id: 'i2', description: 'Full Day Daycare', quantity: 1, price: 35.00 }, { id: 'i3', description: 'Lunch', quantity: 1, price: 5.00 }]
  }
];

export const MOCK_REPORT_CARDS: ReportCard[] = [
  { id: 'rc1', reservationId: 'r1', petId: 'p1', date: '2023-10-26', status: 'Sent', mood: 'Happy', activities: ['Ball Fetch', 'Group Play'], eating: 'All', potty: ['Pee', 'Poop'], notes: 'Rex had a great day!', staffId: 's1' },
  { id: 'rc2', reservationId: 'r2', petId: 'p2', date: '2023-10-26', status: 'Draft', mood: 'Tired', activities: ['Nap', 'Snuggles'], eating: 'Some', potty: ['Pee'], notes: 'Bella seemed a bit sleepy today.', staffId: 's1' }
];

export const MOCK_UNITS: KennelUnit[] = [
  { id: 'K101', name: 'Kennel 101', type: 'Run', size: 'L', status: 'Active' },
  { id: 'K102', name: 'Kennel 102', type: 'Run', size: 'L', status: 'Active' },
  { id: 'K103', name: 'Kennel 103', type: 'Run', size: 'L', status: 'Active' },
  { id: 'S1', name: 'Suite 1', type: 'Suite', size: 'L', status: 'Active' },
  { id: 'S2', name: 'Suite 2', type: 'Suite', size: 'L', status: 'Maintenance' },
  { id: 'C1', name: 'Cage 1', type: 'Cage', size: 'S', status: 'Active' },
  { id: 'C2', name: 'Cage 2', type: 'Cage', size: 'S', status: 'Active' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { 
    id: 'n1', 
    title: 'New SMS Message', 
    message: 'Can you please double check if I packed Rex\'s blue blanket?', 
    type: 'message', 
    priority: 'normal',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    read: false,
    relatedPetId: 'p1',
    relatedOwnerId: 'o1',
    comments: []
  },
  { 
    id: 'n2', 
    title: 'Vaccine Expired: Rabies', 
    message: 'Bella (Labrador) Rabies vaccination expired yesterday. She is currently checked in.', 
    type: 'warning', 
    priority: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: false,
    relatedPetId: 'p2',
    relatedOwnerId: 'o1',
    comments: [
      { id: 'c1', userId: 'u2', userName: 'Sarah Smith', text: 'I called Alice, she is bringing the paperwork at pickup.', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() }
    ]
  },
  { 
    id: 'n3', 
    title: 'Payment Failed', 
    message: 'Bob Smith card ending in 4242 declined for Invoice #INV-2023-001.', 
    type: 'error', 
    priority: 'urgent',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    read: true,
    relatedOwnerId: 'o2',
    comments: []
  },
  {
    id: 'n4',
    title: 'New Reservation Request',
    message: 'Luna (Poodle) for Grooming on Oct 28. Needs confirmation.',
    type: 'info',
    priority: 'normal',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    relatedPetId: 'p4',
    relatedOwnerId: 'o3',
    comments: []
  }
];

export const MOCK_SERVICE_CONFIGS: ServiceConfig[] = [
  { id: 'sc1', name: 'Standard Boarding', type: ServiceType.Boarding, baseRate: 55.00, unitType: 'Night', color: '#3b82f6', enabled: true },
  { id: 'sc2', name: 'Full Day Daycare', type: ServiceType.Daycare, baseRate: 35.00, unitType: 'Day', color: '#22c55e', enabled: true },
  { id: 'sc3', name: 'Half Day Daycare', type: ServiceType.Daycare, baseRate: 25.00, unitType: 'Day', color: '#86efac', enabled: true },
  { id: 'sc4', name: 'Exit Bath', type: ServiceType.Grooming, baseRate: 30.00, unitType: 'Service', color: '#a855f7', enabled: true },
];

export const MOCK_PRICING_RULES: PricingRule[] = [
  { id: 'pr1', name: 'Late Check Out', type: 'LateCheckOut', amount: 20.00, isPercentage: false, triggerCondition: 'After 12:00 PM', enabled: true },
  { id: 'pr2', name: 'Second Dog Discount', type: 'MultiPet', amount: 10.00, isPercentage: true, triggerCondition: 'Same Owner', enabled: true },
  { id: 'pr3', name: 'Holiday Surge', type: 'Holiday', amount: 10.00, isPercentage: false, triggerCondition: 'Dec 24 - Dec 26', enabled: true },
];

export const MOCK_EMAIL_TEMPLATES: CommunicationTemplate[] = [
  // ... (Existing templates)
  { 
    id: 'et1', name: 'Reservation Confirmation', type: 'Email', category: 'Reservation', active: true, trigger: 'ReservationConfirmed', 
    subject: 'Booking Confirmed: {pet_name} at Partners Dogs', 
    body: 'Hi {owner_name},\n\nWe are excited to confirm {pet_name}\'s reservation for {service_type}.\n\nCheck-in: {start_date} at {start_time}\nCheck-out: {end_date}\n\nPlease ensure vaccinations are up to date before arrival.\n\nSee you soon,\nThe Partners Team' 
  },
  { 
    id: 'sms1', name: 'Res Reminder (SMS)', type: 'SMS', category: 'Reservation', active: true, trigger: '24hBeforeCheckIn', 
    body: 'Reminder: {pet_name} is booked for {service_type} starting tomorrow at {start_time}. Reply C to confirm or call us with questions. - Partners Dogs' 
  },
  // ... more templates ...
];

export const MOCK_TAX_RATES: TaxRate[] = [
  { id: 'tr1', name: 'State Sales Tax', rate: 5.6, appliesToServices: false, appliesToProducts: true },
  { id: 'tr2', name: 'City Service Tax', rate: 2.0, appliesToServices: true, appliesToProducts: true },
];

export const MOCK_USERS: UserAccount[] = [
  { id: 'u1', name: 'John Doe', email: 'john@partnersdogs.com', role: 'Admin', status: 'Active', lastLogin: 'Today, 9:00 AM' },
  { id: 'u2', name: 'Sarah Smith', email: 'sarah@partnersdogs.com', role: 'Manager', status: 'Active', lastLogin: 'Yesterday, 5:30 PM' },
  { id: 'u3', name: 'Mike Jones', email: 'mike@partnersdogs.com', role: 'Staff', status: 'Inactive', lastLogin: 'Oct 15, 2023' },
];

export const MOCK_AUTOMATIONS: AutomationRule[] = [
  { id: 'a1', name: 'Pre-Arrival Reminder', trigger: '2 days before Check-In', action: 'Send Email: Reservation Reminder', enabled: true },
  { id: 'a2', name: 'Post-Checkout Survey', trigger: '1 day after Check-Out', action: 'Send Email: Survey', enabled: true },
  { id: 'a3', name: 'Vaccine Expiry Warning', trigger: '30 days before Expiry', action: 'Send SMS: Vaccine Alert', enabled: false },
];

export const MOCK_WORKFLOWS: Workflow[] = [
  // ... (Existing workflows)
];

export const MOCK_WORKFLOW_RUNS: WorkflowRun[] = [
  // ... (Existing runs)
];

export const MOCK_TEMPLATES: WorkflowTemplate[] = [
  // ...
];

export const MOCK_VARIABLES: WorkflowVariable[] = [
  // ...
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  // ...
];

export const MOCK_APPROVALS: ApprovalRequest[] = [
  // ...
];

export const MOCK_PACKAGES: Package[] = [
  // ...
];

export const MOCK_MEMBERSHIPS: Membership[] = [
  // ...
];

export const MOCK_MESSAGES: Message[] = [
  // ...
];

export const MOCK_CLASS_TYPES: ClassType[] = [
  // ...
];

export const MOCK_CLASS_SESSIONS: ClassSession[] = [
  // ...
];

export const MOCK_CLASS_ENROLLMENTS: ClassEnrollment[] = [
  // ...
];

export const MOCK_CHANNELS: InternalChannel[] = [
  // ...
];

export const MOCK_INTERNAL_MESSAGES: InternalMessage[] = [
  // ...
];

export const MOCK_CARE_TASKS: CareTask[] = [
  // ...
];

export const MOCK_CAMPAIGNS: MarketingCampaign[] = [
  // ...
];

export const MOCK_CALL_LOGS: CallLog[] = [
  // ...
];

export const MOCK_CONNECTORS: MarketingConnector[] = [
  // ...
];

export const ALL_REPORTS_CONFIG: ReportDefinition[] = [
  // ...
];

export const MOCK_AGENTS: AiAgent[] = [
  { 
    id: 'vac-agent', 
    name: 'Vaccine Compliance', 
    description: 'Audits health records and drafts emails for expiring vaccines.', 
    icon: ShieldCheck, 
    category: 'Admin', 
    status: 'Idle', 
    lastRun: '1 day ago',
    actionButtonText: 'Scan Records'
  },
  { 
    id: 'churn-agent', 
    name: 'Churn Prevention', 
    description: 'Identifies clients who haven\'t booked recently and creates campaigns.', 
    icon: UserX, 
    category: 'Marketing', 
    status: 'Idle', 
    lastRun: '3 days ago',
    actionButtonText: 'Find At-Risk'
  },
  { 
    id: 'social-agent', 
    name: 'Social Content', 
    description: 'Generates captions and hashtags for daily pet photos.', 
    icon: Camera, 
    category: 'Marketing', 
    status: 'Idle', 
    lastRun: '4 hours ago',
    actionButtonText: 'Generate Posts'
  },
  { 
    id: 'rev-agent', 
    name: 'Revenue Optimizer', 
    description: 'Analyzes occupancy and suggests flash sales or upgrades.', 
    icon: TrendingUp, 
    category: 'Sales', 
    status: 'Idle', 
    lastRun: '1 week ago',
    actionButtonText: 'Analyze'
  },
  { 
    id: 'shift-agent', 
    name: 'Shift Handoff', 
    description: 'Summarizes daily incidents, tasks, and notes for next shift.', 
    icon: ClipboardList, 
    category: 'Operations', 
    status: 'Idle', 
    lastRun: '8 hours ago',
    actionButtonText: 'Compile Handoff'
  },
];

// --- VETERINARY DATA ---

export const MOCK_VET_CLINICS: VetClinic[] = [
  {
    id: 'vc1',
    name: 'Dr. Treat',
    address: '123 Wellness Way, Phoenix, AZ 85001',
    phone: '(555) 888-9999',
    email: 'records@drtreat.com',
    website: 'www.drtreat.com',
    primaryContactName: 'Front Desk',
    emergency: false,
    tags: ['General', 'Trusted'],
    autoRequestRecords: true,
    lastRecordRequest: '2023-10-20'
  },
  {
    id: 'vc2',
    name: 'City Vet Hospital',
    address: '456 Central Ave, Phoenix, AZ 85004',
    phone: '(555) 777-6666',
    email: 'info@cityvet.com',
    website: 'www.cityvet.com',
    primaryContactName: 'Dr. Brown',
    emergency: true,
    tags: ['Emergency', 'Surgery'],
    autoRequestRecords: false
  },
  {
    id: 'vc3',
    name: 'Happy Paws Clinic',
    address: '789 Scottsdale Rd, Scottsdale, AZ 85251',
    phone: '(555) 444-3333',
    email: 'admin@happypaws.com',
    website: 'www.happypaws.com',
    emergency: false,
    tags: ['Holistic', 'Acupuncture'],
    autoRequestRecords: true,
    lastRecordRequest: '2023-10-25'
  },
  {
    id: 'vc4',
    name: 'Valley Animal Hospital',
    address: '321 Cactus Drive, Tempe, AZ 85281',
    phone: '(555) 222-1212',
    email: 'records@valleyanimal.com',
    website: 'www.valleyanimal.com',
    primaryContactName: 'Nurse Jackie',
    emergency: true,
    tags: ['24/7', 'Trauma'],
    autoRequestRecords: true,
    lastRecordRequest: '2023-10-27'
  },
  {
    id: 'vc5',
    name: 'Paws & Claws Veterinary Center',
    address: '999 Desert Blvd, Mesa, AZ 85202',
    phone: '(555) 111-9090',
    email: 'frontdesk@pawsclaws.com',
    website: 'www.pawsclaws.com',
    emergency: false,
    tags: ['General', 'Exotics'],
    autoRequestRecords: false
  }
];

export const MOCK_VETERINARIANS: Veterinarian[] = [
  { id: 'dr1', clinicId: 'vc1', name: 'Dr. Sarah Miller', specialty: 'General Practice', email: 'smiller@drtreat.com' },
  { id: 'dr2', clinicId: 'vc1', name: 'Dr. James Chen', specialty: 'Dentistry' },
  { id: 'dr3', clinicId: 'vc2', name: 'Dr. Emily Brown', specialty: 'Emergency Medicine', phone: '(555) 777-6667' },
  { id: 'dr4', clinicId: 'vc3', name: 'Dr. Lisa Wu', specialty: 'Holistic Care' },
  { id: 'dr5', clinicId: 'vc4', name: 'Dr. Robert Stone', specialty: 'Surgery', email: 'rstone@valleyanimal.com' },
  { id: 'dr6', clinicId: 'vc4', name: 'Dr. Amanda Lee', specialty: 'Internal Medicine' },
  { id: 'dr7', clinicId: 'vc5', name: 'Dr. Kevin Patel', specialty: 'Exotics' },
  { id: 'dr8', clinicId: 'vc5', name: 'Dr. Jessica Davis', specialty: 'General Practice' }
];
