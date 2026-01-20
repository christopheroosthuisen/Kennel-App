

import { Owner, Pet, Reservation, ReservationStatus, ServiceType, Notification, Invoice, ReportCard, KennelUnit, ServiceConfig, PricingRule, CommunicationTemplate, TaxRate, UserAccount, AutomationRule, Workflow, WorkflowRun, WorkflowTemplate, WorkflowVariable, AuditLogEntry, ApprovalRequest, Package, Membership, Message, ClassType, ClassSession, ClassEnrollment, InternalChannel, InternalMessage, CareTask, MarketingCampaign, CallLog, MarketingConnector, ReportDefinition, ServiceTask, AiAgent, VetClinic, Veterinarian } from './types';
import { ShieldCheck, UserX, Camera, TrendingUp, ClipboardList } from 'lucide-react';

export const MOCK_VET_CLINICS: VetClinic[] = [
  { id: 'vc1', name: 'Downtown Animal Hospital', phone: '(555) 123-4567', email: 'records@downtownvet.com', address: '101 Main St, Phoenix, AZ 85001', emergency: false },
  { id: 'vc2', name: '24/7 Pet Care Center', phone: '(555) 987-6543', email: 'urgent@petcare247.com', address: '500 Emergency Dr, Phoenix, AZ 85004', emergency: true },
  { id: 'vc3', name: 'Scottsdale Veterinary Clinic', phone: '(480) 555-1234', email: 'info@scottsdalevet.com', address: '789 Scottsdale Rd, Scottsdale, AZ 85251', emergency: false, website: 'www.scottsdalevet.com' },
];

export const MOCK_VETERINARIANS: Veterinarian[] = [
  { id: 'dr1', clinicId: 'vc1', name: 'Dr. Sarah Miller', specialty: 'General Practice', email: 'smiller@downtownvet.com' },
  { id: 'dr2', clinicId: 'vc1', name: 'Dr. James Chen', specialty: 'Dentistry' },
  { id: 'dr3', clinicId: 'vc2', name: 'Dr. Emily Brown', specialty: 'Emergency Medicine', phone: '(555) 777-6667' },
  { id: 'dr4', clinicId: 'vc3', name: 'Dr. Lisa Wu', specialty: 'Holistic Care' },
];

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
  { id: 'rc1', reservationId: 'r1', petId: 'p1', date: '2023-10-26', status: 'Sent', mood: ['Happy'], activities: ['Ball Fetch', 'Group Play'], eating: 'All', potty: ['Pee', 'Poop'], notes: 'Rex had a great day!', staffId: 's1', media: [] },
  { id: 'rc2', reservationId: 'r2', petId: 'p2', date: '2023-10-26', status: 'Draft', mood: ['Tired'], activities: ['Nap', 'Snuggles'], eating: 'Some', potty: ['Pee'], notes: 'Bella seemed a bit sleepy today.', staffId: 's1', media: [] }
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
  { 
    id: 'et1', name: 'Reservation Confirmation', type: 'Email', category: 'Reservation', active: true, trigger: 'ReservationConfirmed', 
    subject: 'Booking Confirmed: {pet_name} at Partners Dogs', 
    body: 'Hi {owner_name},\n\nWe are excited to confirm {pet_name}\'s reservation for {service_type}.\n\nCheck-in: {start_date} at {start_time}\nCheck-out: {end_date}\n\nPlease ensure vaccinations are up to date before arrival.\n\nSee you soon,\nThe Partners Team' 
  },
  { 
    id: 'sms1', name: 'Res Reminder (SMS)', type: 'SMS', category: 'Reservation', active: true, trigger: '24hBeforeCheckIn', 
    body: 'Reminder: {pet_name} is booked for {service_type} starting tomorrow at {start_time}. Reply C to confirm or call us with questions. - Partners Dogs' 
  },
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
  {
    id: 'wf1', name: 'New Client Onboarding', description: 'Welcome email and data collection form', 
    environment: 'production', isEnabled: true,
    trigger: { type: 'Event', details: 'Owner Created' },
    steps: [{id: 's1', type: 'Action', name: 'Send Welcome Email', config: {}}, {id: 's2', type: 'Delay', name: 'Wait 2 Days', config: {}}],
    stats: { runsLast24h: 12, successRate: 100 }, lastEdited: '2 days ago'
  },
  {
    id: 'wf2', name: 'Missed Vaccination Follow-up', description: 'Automated follow-up for missing records',
    environment: 'staging', isEnabled: false,
    trigger: { type: 'Schedule', details: 'Daily at 9:00 AM' },
    steps: [{id: 's1', type: 'Condition', name: 'Check Expiry', config: {}}, {id: 's2', type: 'Action', name: 'Send Reminder', config: {}}],
    stats: { runsLast24h: 0, successRate: 0 }, lastEdited: '1 week ago'
  }
];

export const MOCK_WORKFLOW_RUNS: WorkflowRun[] = [
  { id: 'run1', workflowId: 'wf1', workflowName: 'New Client Onboarding', status: 'Completed', startedAt: '2023-10-25 09:30 AM' },
  { id: 'run2', workflowId: 'wf1', workflowName: 'New Client Onboarding', status: 'Running', startedAt: '2023-10-26 10:15 AM', currentStep: 'Wait 2 Days' },
];

export const MOCK_TEMPLATES: WorkflowTemplate[] = [
  { id: 't1', name: 'Review Request', description: 'Ask for Google Review after positive feedback', category: 'Marketing', difficulty: 'Beginner', stepsCount: 3 },
  { id: 't2', name: 'Birthday Discount', description: 'Send coupon on pet birthday', category: 'Revenue', difficulty: 'Beginner', stepsCount: 2 },
];

export const MOCK_VARIABLES: WorkflowVariable[] = [
  { id: 'v1', key: 'COMPANY_NAME', value: 'Partners Dogs', type: 'String', isEncrypted: false },
  { id: 'v2', key: 'STRIPE_API_KEY', value: 'sk_test_...', type: 'Secret', isEncrypted: true },
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'log1', actor: 'John Doe', action: 'Modified Reservation', target: 'Res #r1', timestamp: '2023-10-25 14:30', details: 'Changed lodging from K101 to K102', category: 'Operations' },
  { id: 'log2', actor: 'System', action: 'Sent Email', target: 'Alice Johnson', timestamp: '2023-10-25 09:00', details: 'Reservation Confirmation', category: 'System' },
];

export const MOCK_APPROVALS: ApprovalRequest[] = [
  { id: 'app1', workflowRunId: 'run3', workflowName: 'Refund Process', requestedAt: '2023-10-26 11:00 AM', description: 'Refund $50.00 to Bob Smith', status: 'Pending', dataPayload: { amount: 50, reason: 'Dissatisfied' } }
];

export const MOCK_PACKAGES: Package[] = [
  { id: 'pkg1', name: '5 Day Daycare Pass', internalName: 'Daycare 5-Pack', description: 'Prepaid 5 full days of daycare.', price: 165.00, serviceTypeTarget: ServiceType.Daycare, creditQuantity: 5, active: true },
  { id: 'pkg2', name: '10 Day Daycare Pass', internalName: 'Daycare 10-Pack', description: 'Prepaid 10 full days. Best value.', price: 315.00, serviceTypeTarget: ServiceType.Daycare, creditQuantity: 10, active: true }
];

export const MOCK_MEMBERSHIPS: Membership[] = [
  { id: 'mem1', name: 'VIP Club', price: 99.00, billingFrequency: 'Monthly', description: 'Unlimited daycare and 10% off boarding.', benefits: [{id: 'b1', type: 'Discount', targetService: ServiceType.Boarding, value: 10}], active: true }
];

export const MOCK_MESSAGES: Message[] = [
  { id: 'msg1', ownerId: 'o1', direction: 'Inbound', type: 'SMS', body: 'Running 10 mins late for pickup!', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'Read' },
  { id: 'msg2', ownerId: 'o1', direction: 'Outbound', type: 'SMS', body: 'No problem, drive safe!', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), status: 'Delivered', sender: 'Sarah' }
];

export const MOCK_CLASS_TYPES: ClassType[] = [
  { id: 'ct1', name: 'Puppy Kindergarten', description: 'Socialization for puppies under 6 months.', defaultCapacity: 8, defaultPrice: 150, creditCost: 1, color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'ct2', name: 'Obedience 101', description: 'Basic commands: Sit, Stay, Come.', defaultCapacity: 6, defaultPrice: 180, creditCost: 1, color: 'bg-blue-100 text-blue-700 border-blue-200' }
];

export const MOCK_CLASS_SESSIONS: ClassSession[] = [
  { id: 'cs1', classTypeId: 'ct1', startTime: '2023-10-28T10:00:00', durationMinutes: 60, instructorId: 'u2', capacity: 8, status: 'Scheduled' },
  { id: 'cs2', classTypeId: 'ct2', startTime: '2023-10-28T11:30:00', durationMinutes: 60, instructorId: 'u2', capacity: 6, status: 'Scheduled' }
];

export const MOCK_CLASS_ENROLLMENTS: ClassEnrollment[] = [
  { id: 'ce1', sessionId: 'cs1', petId: 'p5', ownerId: 'o4', status: 'Enrolled', paymentMethod: 'Unpaid', checkedIn: false }
];

export const MOCK_CHANNELS: InternalChannel[] = [
  { id: 'c1', name: 'general', type: 'public', description: 'Team announcements and general chatter', unreadCount: 0, members: ['u1', 'u2', 'u3'] },
  { id: 'c2', name: 'front-desk', type: 'public', description: 'Check-ins, phones, and client issues', unreadCount: 2, members: ['u1', 'u2'] },
  { id: 'c3', name: 'kennel-staff', type: 'private', description: 'Back of house coordination', unreadCount: 0, members: ['u1', 'u3'] },
  { id: 'dm1', name: 'Sarah Smith', type: 'dm', unreadCount: 1, members: ['u1', 'u2'] }
];

export const MOCK_INTERNAL_MESSAGES: InternalMessage[] = [
  { id: 'im1', channelId: 'c1', senderId: 'u2', content: 'Has anyone seen the keys to Suite 4?', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), reactions: {'👀': 2} },
  { id: 'im2', channelId: 'c1', senderId: 'u3', content: 'I think they are on the hook in the break room.', timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(), reactions: {'👍': 1} }
];

export const MOCK_CARE_TASKS: CareTask[] = [
  { id: 'ct1', petId: 'p1', unit: 'K101', type: 'Feeding', shift: 'AM', status: 'Prepared', description: '2 cups Dry Kibble', instructions: 'Mix with wet food on Sundays.' },
  { id: 'ct2', petId: 'p1', unit: 'K101', type: 'Medication', shift: 'AM', status: 'Pending', description: 'Apoquel 16mg', instructions: 'Give with breakfast', warning: true },
  { id: 'ct3', petId: 'p2', unit: 'K102', type: 'Feeding', shift: 'AM', status: 'Completed', description: '1.5 cups', completedAt: new Date().toISOString() },
  { id: 'ct4', petId: 'p3', unit: 'Playgroup A', type: 'Feeding', shift: 'AM', status: 'Pending', description: '1 cup AM', instructions: 'Watch for aggression' }
];

export const MOCK_CAMPAIGNS: MarketingCampaign[] = [
  { id: 'mc1', name: 'October Newsletter', type: 'Email', status: 'Sent', sentCount: 425, openRate: 0.45, clickRate: 0.12, createdAt: '2023-10-01', audience: 'All Owners' },
  { id: 'mc2', name: 'Holiday Booking Reminder', type: 'SMS', status: 'Scheduled', sentCount: 0, scheduledFor: '2023-11-01', createdAt: '2023-10-25', audience: 'VIP Clients' }
];

export const MOCK_CALL_LOGS: CallLog[] = [
  { id: 'cl1', direction: 'Inbound', from: '555-0101', to: 'Main Line', durationSeconds: 145, timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), status: 'Answered', relatedOwnerId: 'o1', recordingUrl: '#' },
  { id: 'cl2', direction: 'Outbound', from: 'Main Line', to: '555-9999', durationSeconds: 0, timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: 'Voicemail', relatedOwnerId: 'o1' }
];

export const MOCK_CONNECTORS: MarketingConnector[] = [
  { id: 'conn1', provider: 'Twilio', type: 'SMS', status: 'Connected', apiKeyMasked: 'sk_live_...4829' },
  { id: 'conn2', provider: 'SendGrid', type: 'Email', status: 'Connected', apiKeyMasked: 'SG.928...' },
  { id: 'conn3', provider: 'Mailgun', type: 'Email', status: 'Disconnected', apiKeyMasked: 'key-...' }
];

export const ALL_REPORTS_CONFIG: ReportDefinition[] = [
  { id: 'fin_eod', category: 'Financial', name: 'End of Day Summary', description: 'Daily revenue breakdown by payment method.', columns: ['Date', 'Payment Method', 'Amount', 'Transaction ID', 'Cashier'] },
  { id: 'ani_vax', category: 'Animals', name: 'Expired Vaccines', description: 'List of pets with expired or expiring vaccinations.', columns: ['Pet Name', 'Owner Name', 'Vaccine', 'Expiry Date', 'Status'] },
  { id: 'ops_occ', category: 'Operations', name: 'Occupancy Forecast', description: 'Future occupancy projections by unit type.', columns: ['Date', 'Unit Type', 'Occupancy %', 'Total Guests'] }
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