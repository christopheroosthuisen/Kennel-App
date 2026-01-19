
import { Owner, Pet, Reservation, ReservationStatus, ServiceType, Notification, Invoice, ReportCard, KennelUnit, ServiceConfig, PricingRule, CommunicationTemplate, TaxRate, UserAccount, AutomationRule, Workflow, WorkflowRun, WorkflowTemplate, WorkflowVariable, AuditLogEntry, ApprovalRequest, Package, Membership, Message, ClassType, ClassSession, ClassEnrollment, InternalChannel, InternalMessage, CareTask, MarketingCampaign, CallLog, MarketingConnector, ReportDefinition, ServiceTask, AiAgent } from './types';
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
    alerts: ['Meds'], vaccineStatus: 'Valid', photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop', vet: 'Dr. Treat', 
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
    alerts: [], vaccineStatus: 'Expiring', photoUrl: 'https://images.unsplash.com/photo-1591769225440-811ad7d6eca6?w=200&h=200&fit=crop', vet: 'Dr. Treat', feedingInstructions: '1.5 cups AM/PM',
    vaccines: [
      { id: 'v4', name: 'Rabies', dateAdministered: '2021-01-01', dateExpires: '2024-01-01', status: 'Expiring' }
    ],
    activeProgram: 'Weight Management'
  },
  { id: 'p3', ownerId: 'o2', name: 'Charlie', breed: 'Beagle', weight: 25, dob: '2021-01-20', gender: 'M', fixed: false, alerts: ['Aggressive'], vaccineStatus: 'Valid', photoUrl: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=200&h=200&fit=crop', vet: 'City Vet', feedingInstructions: '1 cup AM', activeProgram: 'Obedience Level 1' },
  { id: 'p4', ownerId: 'o3', name: 'Luna', breed: 'Poodle', weight: 40, dob: '2018-11-05', gender: 'F', fixed: true, alerts: [], vaccineStatus: 'Expired', photoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200&h=200&fit=crop', vet: 'City Vet', feedingInstructions: 'Free feed' },
  { id: 'p5', ownerId: 'o4', name: 'Max', breed: 'German Shepherd', weight: 85, dob: '2022-03-10', gender: 'M', fixed: true, alerts: ['Separation Anxiety'], vaccineStatus: 'Valid', photoUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=200&h=200&fit=crop', vet: 'Dr. Treat', feedingInstructions: '3 cups PM', activeProgram: 'Puppy Jump Start' },
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
  // --- Reservations ---
  { 
    id: 'et1', name: 'Reservation Confirmation', type: 'Email', category: 'Reservation', active: true, trigger: 'ReservationConfirmed', 
    subject: 'Booking Confirmed: {pet_name} at Partners Dogs', 
    body: 'Hi {owner_name},\n\nWe are excited to confirm {pet_name}\'s reservation for {service_type}.\n\nCheck-in: {start_date} at {start_time}\nCheck-out: {end_date}\n\nPlease ensure vaccinations are up to date before arrival.\n\nSee you soon,\nThe Partners Team' 
  },
  { 
    id: 'sms1', name: 'Res Reminder (SMS)', type: 'SMS', category: 'Reservation', active: true, trigger: '24hBeforeCheckIn', 
    body: 'Reminder: {pet_name} is booked for {service_type} starting tomorrow at {start_time}. Reply C to confirm or call us with questions. - Partners Dogs' 
  },
  { 
    id: 'et2', name: 'Waitlist Opening', type: 'Email', category: 'Reservation', active: true, trigger: 'WaitlistSpotAvailable', 
    subject: 'Good News! A spot opened up for {pet_name}', 
    body: 'Hi {owner_name},\n\nA spot has become available for your waitlisted request on {start_date}. Please click here {link} to claim this spot within 24 hours.' 
  },
  { 
    id: 'et3', name: 'Cancellation Notice', type: 'Email', category: 'Reservation', active: true, trigger: 'ReservationCancelled', 
    subject: 'Cancellation Confirmed: {pet_name}', 
    body: 'Hi {owner_name},\n\nThis email confirms that the reservation for {pet_name} on {start_date} has been cancelled. We hope to see you again soon!' 
  },

  // --- Financial ---
  { 
    id: 'et4', name: 'Invoice Ready', type: 'Email', category: 'Financial', active: true, trigger: 'InvoiceCreated', 
    subject: 'Invoice #{invoice_number} from Partners Dogs', 
    body: 'Hi {owner_name},\n\nYour invoice for {pet_name}\'s recent stay is ready. Total due: ${total_due}.\n\nView and pay online: {invoice_link}' 
  },
  { 
    id: 'et5', name: 'Payment Receipt', type: 'Email', category: 'Financial', active: true, trigger: 'PaymentReceived', 
    subject: 'Payment Receipt', 
    body: 'Thank you for your payment of ${amount_paid}. Your transaction ID is {transaction_id}.' 
  },
  { 
    id: 'et6', name: 'Deposit Request', type: 'Email', category: 'Financial', active: true, trigger: 'DepositRequired', 
    subject: 'Action Required: Deposit for Holiday Booking', 
    body: 'Hi {owner_name},\n\nTo secure {pet_name}\'s holiday reservation, a 50% deposit of ${deposit_amount} is required by {due_date}. Please pay here: {link}' 
  },

  // --- Health ---
  { 
    id: 'et7', name: 'Vaccine Reminder (30 Days)', type: 'Email', category: 'Health', active: true, trigger: 'VaccineExpiring30', 
    subject: 'Vaccination Reminder for {pet_name}', 
    body: 'Hi {owner_name},\n\nOur records show that {pet_name}\'s {vaccine_list} will expire on {expiry_date}. Please send us updated records before your next visit!' 
  },
  { 
    id: 'sms2', name: 'Vaccine Overdue (SMS)', type: 'SMS', category: 'Health', active: true, trigger: 'VaccineExpired', 
    body: 'Alert: {pet_name}\'s {vaccine_name} is now expired. We cannot accept check-ins until updated. Please upload records to your portal. - Partners Dogs' 
  },

  // --- Operations ---
  { 
    id: 'sms3', name: 'Ready for Pickup', type: 'SMS', category: 'Operations', active: true, trigger: 'ServiceCompleted', 
    body: 'Great news! {pet_name} is all done with their {service_name} and ready to be picked up. See you soon!' 
  },
  { 
    id: 'et8', name: 'Report Card Sent', type: 'Email', category: 'Operations', active: true, trigger: 'ReportCardPublished', 
    subject: 'You have a new Report Card for {pet_name}!', 
    body: 'Hi {owner_name},\n\nCheck out what {pet_name} did today! We\'ve uploaded photos and notes to their report card.\n\nView Report: {report_link}' 
  },
  { 
    id: 'sms4', name: 'Check-in Notification', type: 'SMS', category: 'Operations', active: true, trigger: 'CheckedIn', 
    body: '{pet_name} has been successfully checked in for {service_type}. We\'ll take great care of them!' 
  },

  // --- Marketing ---
  { 
    id: 'et9', name: 'Happy Birthday', type: 'Email', category: 'Marketing', active: true, trigger: 'PetBirthday', 
    subject: 'Happy Birthday {pet_name}! 🎂', 
    body: 'Happy Birthday to our favorite furry friend, {pet_name}! Come in anytime this week for a free birthday treat or 10% off a grooming service.' 
  },
  { 
    id: 'et10', name: 'Review Request', type: 'Email', category: 'Marketing', active: true, trigger: 'PostCheckout24h', 
    subject: 'How did we do?', 
    body: 'Hi {owner_name},\n\nWe loved having {pet_name} stay with us. Would you mind sharing your experience on Google? It helps us a lot!\n\nReview Link: {google_review_link}' 
  },
  { 
    id: 'et11', name: 'New Client Welcome', type: 'Email', category: 'Marketing', active: true, trigger: 'AccountCreated', 
    subject: 'Welcome to the Partners Dogs Family!', 
    body: 'Hi {owner_name},\n\nThanks for creating an account with us. We can\'t wait to meet {pet_name}. Please complete your profile and upload vaccination records to get started.' 
  },
  { 
    id: 'sms5', name: 'We Miss You', type: 'SMS', category: 'Marketing', active: false, trigger: 'NoVisit90Days', 
    body: 'Hi {owner_name}, we haven\'t seen {pet_name} in a while! Book a daycare day this week and get a free nail trim. Use code MISSYOU.' 
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
    id: 'wf1', name: 'New Client Onboarding', description: 'Send welcome email, create task for staff to verify vaccines.', 
    environment: 'production', isEnabled: true, 
    trigger: { type: 'Event', details: 'Owner Created' },
    stats: { runsLast24h: 3, successRate: 100 }, lastEdited: '2 days ago',
    steps: [
      { id: 's1', type: 'Action', name: 'Send Email: Welcome', config: {} },
      { id: 's2', type: 'Delay', name: 'Wait 1 Day', config: {} },
      { id: 's3', type: 'Action', name: 'Create Task: Verify Vax', config: {} }
    ]
  },
  { 
    id: 'wf2', name: 'Refund Approval Flow', description: 'Require manager approval for refunds over $50.', 
    environment: 'staging', isEnabled: true, 
    trigger: { type: 'Event', details: 'Refund Requested' },
    stats: { runsLast24h: 0, successRate: 0 }, lastEdited: '1 hour ago',
    steps: [
      { id: 's1', type: 'Condition', name: 'If > $50', config: {} },
      { id: 's2', type: 'Approval', name: 'Manager Approval', config: { role: 'Manager' } },
      { id: 's3', type: 'Action', name: 'Process Refund', config: {} }
    ]
  }
];

export const MOCK_WORKFLOW_RUNS: WorkflowRun[] = [
  { id: 'run1', workflowId: 'wf1', workflowName: 'New Client Onboarding', status: 'Completed', startedAt: '2 hours ago' },
  { id: 'run2', workflowId: 'wf2', workflowName: 'Refund Approval Flow', status: 'Waiting for Approval', startedAt: '10 mins ago', currentStep: 'Manager Approval' },
  { id: 'run3', workflowId: 'wf1', workflowName: 'New Client Onboarding', status: 'Failed', startedAt: 'Yesterday', currentStep: 'Send Email: Welcome' },
];

export const MOCK_TEMPLATES: WorkflowTemplate[] = [
  { id: 't1', name: 'Birthday Discount', description: 'Send a coupon 7 days before pet birthday.', category: 'Messaging', difficulty: 'Beginner', stepsCount: 2 },
  { id: 't2', name: 'Vaccine Expiry Chase', description: 'Series of 3 reminders for expiring vaccines.', category: 'Operations', difficulty: 'Advanced', stepsCount: 5 },
  { id: 't3', name: 'Post-Stay Review', description: 'Request Google review after checkout.', category: 'Messaging', difficulty: 'Beginner', stepsCount: 2 },
];

export const MOCK_VARIABLES: WorkflowVariable[] = [
  { id: 'v1', key: 'support_email', value: 'help@partnersdogs.com', type: 'String', isEncrypted: false },
  { id: 'v2', key: 'stripe_api_key', value: '****************', type: 'Secret', isEncrypted: true },
  { id: 'v3', key: 'tax_rate_phx', value: '8.6', type: 'Number', isEncrypted: false },
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'al1', actor: 'John Doe', action: 'Published Workflow', target: 'New Client Onboarding', timestamp: '2 hours ago', details: 'Promoted from Staging to Production' },
  { id: 'al2', actor: 'Sarah Smith', action: 'Approved Refund', target: 'Run #4821', timestamp: '4 hours ago', details: 'Refund for $120 approved' },
  { id: 'al3', actor: 'System', action: 'Rate Limit Hit', target: 'SMS Gateway', timestamp: '5 hours ago', details: 'Paused outbound SMS for 5 mins' },
];

export const MOCK_APPROVALS: ApprovalRequest[] = [
  { id: 'ap1', workflowRunId: 'run2', workflowName: 'Refund Approval Flow', requestedAt: '10 mins ago', description: 'Refund $65.00 for Rex (Owner: Alice)', status: 'Pending', dataPayload: { amount: 65, reason: 'Early Checkout' } }
];

export const MOCK_PACKAGES: Package[] = [
  { id: 'pkg1', name: '5 Day Daycare Pack', internalName: 'Daycare 5-Pack', description: 'Prepaid 5 full days of daycare.', price: 165.00, serviceTypeTarget: ServiceType.Daycare, creditQuantity: 5, expiryDays: 90, active: true },
  { id: 'pkg2', name: '10 Day Daycare Pack', internalName: 'Daycare 10-Pack', description: 'Prepaid 10 full days. Best value.', price: 315.00, serviceTypeTarget: ServiceType.Daycare, creditQuantity: 10, expiryDays: 120, active: true },
  { id: 'pkg3', name: '3 Night Boarding', internalName: 'Boarding 3-Night', description: 'Prepaid boarding nights.', price: 150.00, serviceTypeTarget: ServiceType.Boarding, creditQuantity: 3, expiryDays: 365, active: true },
];

export const MOCK_MEMBERSHIPS: Membership[] = [
  { 
    id: 'mem1', name: 'Partners VIP', price: 49.99, billingFrequency: 'Monthly', description: 'Ultimate care package for VIPs.', active: true,
    benefits: [
      { id: 'b1', type: 'Discount', targetService: ServiceType.Boarding, value: 10 },
      { id: 'b2', type: 'Credit', targetService: ServiceType.Grooming, value: 1, period: 'Per Month' }
    ]
  },
  { 
    id: 'mem2', name: 'Unlimited Daycare', price: 500.00, billingFrequency: 'Monthly', description: 'Unlimited daycare access.', active: true,
    benefits: [
      { id: 'b3', type: 'Credit', targetService: ServiceType.Daycare, value: 999, period: 'Unlimited' } // Mocking unlimited with high number or logic
    ]
  }
];

export const MOCK_MESSAGES: Message[] = [
  { id: 'm1', ownerId: 'o1', direction: 'Inbound', type: 'SMS', body: 'Can you please double check if I packed Rex\'s blue blanket?', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), status: 'Read', sender: 'Alice Johnson' },
  { id: 'm2', ownerId: 'o1', direction: 'Outbound', type: 'SMS', body: 'Hi Alice! Yes, we found the blue blanket. It\'s safe in his cubby.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), status: 'Delivered', sender: 'Staff' },
  { id: 'm3', ownerId: 'o2', direction: 'Outbound', type: 'Email', subject: 'Invoice #INV-2023-001', body: 'Hi Bob, please find attached your invoice for Charlie\'s stay.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'Sent', sender: 'Billing System' },
];

export const MOCK_CLASS_TYPES: ClassType[] = [
  { id: 'ct1', name: 'Puppy Kindergarten', description: 'Socialization and basic obedience for puppies under 6 months.', defaultCapacity: 8, defaultPrice: 25.00, creditCost: 1, color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'ct2', name: 'Obedience Lvl 1', description: 'Sit, Stay, Down, and Loose Leash Walking foundations.', defaultCapacity: 6, defaultPrice: 35.00, creditCost: 1, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'ct3', name: 'Agility Intro', description: 'Fun introduction to agility equipment.', defaultCapacity: 5, defaultPrice: 40.00, creditCost: 1, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'ct4', name: 'Open Play', description: 'Supervised indoor play time.', defaultCapacity: 15, defaultPrice: 15.00, creditCost: 0.5, color: 'bg-green-100 text-green-700 border-green-200' },
];

export const MOCK_CLASS_SESSIONS: ClassSession[] = [
  { id: 'cs1', classTypeId: 'ct1', startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(), durationMinutes: 60, instructorId: 'u2', capacity: 8, status: 'Scheduled' },
  { id: 'cs2', classTypeId: 'ct2', startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(), durationMinutes: 60, instructorId: 'u1', capacity: 6, status: 'Scheduled' },
  { id: 'cs3', classTypeId: 'ct1', startTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), durationMinutes: 60, instructorId: 'u2', capacity: 8, status: 'Scheduled' },
  { id: 'cs4', classTypeId: 'ct3', startTime: new Date(new Date().setHours(17, 30, 0, 0)).toISOString(), durationMinutes: 90, instructorId: 'u3', capacity: 5, status: 'Scheduled' },
];

export const MOCK_CLASS_ENROLLMENTS: ClassEnrollment[] = [
  { id: 'ce1', sessionId: 'cs1', petId: 'p1', ownerId: 'o1', status: 'Enrolled', paymentMethod: 'Package Credit', checkedIn: true },
  { id: 'ce2', sessionId: 'cs1', petId: 'p2', ownerId: 'o1', status: 'Enrolled', paymentMethod: 'Drop-In', checkedIn: false },
  { id: 'ce3', sessionId: 'cs2', petId: 'p5', ownerId: 'o4', status: 'Waitlist', paymentMethod: 'Unpaid', checkedIn: false },
];

export const MOCK_CHANNELS: InternalChannel[] = [
  { id: 'c1', name: 'general', type: 'public', description: 'Company-wide announcements and chatter', unreadCount: 0, members: ['u1', 'u2', 'u3'] },
  { id: 'c2', name: 'kennel-staff', type: 'public', description: 'Coordination for kennel techs', unreadCount: 2, members: ['u2', 'u3'] },
  { id: 'c3', name: 'front-desk', type: 'public', description: 'Reception and client handling', unreadCount: 0, members: ['u1', 'u2'] },
  { id: 'c4', name: 'managers-only', type: 'private', description: 'Management discussions', unreadCount: 0, members: ['u1', 'u2'] },
  { id: 'dm1', name: 'Sarah Smith', type: 'dm', unreadCount: 1, members: ['u1', 'u2'] },
];

export const MOCK_INTERNAL_MESSAGES: InternalMessage[] = [
  { id: 'm1', channelId: 'c1', senderId: 'u2', content: 'Has anyone seen the key to Suite 4?', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), reactions: { '🤔': 1 } },
  { id: 'm2', channelId: 'c1', senderId: 'u3', content: 'I think it was left on the break room table.', timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(), reactions: { '👍': 1 } },
  { id: 'm3', channelId: 'c2', senderId: 'u2', content: 'Rex had a bit of an upset stomach after lunch, please monitor him.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), reactions: {} },
  { id: 'm4', channelId: 'dm1', senderId: 'u2', content: 'Hey, can you approve my time off request for next Friday?', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), reactions: {} },
];

export const MOCK_CARE_TASKS: CareTask[] = [
  { id: 'ct1', petId: 'p1', unit: 'K101', type: 'Feeding', shift: 'AM', status: 'Pending', description: '2 cups Dry Kibble', instructions: 'Mix in wet food' },
  { id: 'ct2', petId: 'p1', unit: 'K101', type: 'Medication', shift: 'AM', status: 'Pending', description: 'Apoquel 16mg', warning: true },
  { id: 'ct3', petId: 'p2', unit: 'K102', type: 'Feeding', shift: 'AM', status: 'Prepared', description: '1.5 cups Dry Kibble' },
  { id: 'ct4', petId: 'p3', unit: 'Playgroup A', type: 'Feeding', shift: 'AM', status: 'Completed', description: '1 cup Dry', completedAt: new Date().toISOString() },
  { id: 'ct5', petId: 'p5', unit: 'K103', type: 'Feeding', shift: 'PM', status: 'Pending', description: '3 cups Dry', instructions: 'Wait for cool down' },
  { id: 'ct6', petId: 'p5', unit: 'K103', type: 'Medication', shift: 'PM', status: 'Pending', description: 'Joint Supplement', warning: false },
  { id: 'ct7', petId: 'p1', unit: 'K101', type: 'Feeding', shift: 'PM', status: 'Pending', description: '2 cups Dry Kibble' },
];

// --- Marketing Mocks ---

export const MOCK_CAMPAIGNS: MarketingCampaign[] = [
  { id: 'cmp1', name: 'Spring Boarding Promo', type: 'Email', status: 'Sent', sentCount: 450, openRate: 0.42, clickRate: 0.12, createdAt: '2023-09-15', audience: 'All Owners' },
  { id: 'cmp2', name: 'Vaccine Reminder Blast', type: 'SMS', status: 'Sent', sentCount: 120, clickRate: 0.05, createdAt: '2023-10-01', audience: 'Expired Vax' },
  { id: 'cmp3', name: 'Holiday Early Bird', type: 'Email', status: 'Draft', sentCount: 0, createdAt: '2023-10-20', audience: 'VIP' },
  { id: 'cmp4', name: 'Weather Alert', type: 'SMS', status: 'Scheduled', sentCount: 0, scheduledFor: '2023-10-28T09:00:00', createdAt: '2023-10-27', audience: 'Current Reservations' },
];

export const MOCK_CALL_LOGS: CallLog[] = [
  { id: 'call1', direction: 'Inbound', from: '555-0101', to: 'Business Line', durationSeconds: 145, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'Answered', relatedOwnerId: 'o1', recordingUrl: '#' },
  { id: 'call2', direction: 'Inbound', from: '555-9999', to: 'Business Line', durationSeconds: 0, timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: 'Missed' },
  { id: 'call3', direction: 'Outbound', from: 'Staff', to: '555-0102', durationSeconds: 65, timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), status: 'Answered', relatedOwnerId: 'o2' },
];

export const MOCK_CONNECTORS: MarketingConnector[] = [
  { id: 'conn1', provider: 'Twilio', type: 'SMS', status: 'Connected', apiKeyMasked: 'AC34...8a2f', phoneNumber: '(555) 123-4567' },
  { id: 'conn2', provider: 'SendGrid', type: 'Email', status: 'Connected', apiKeyMasked: 'SG.92...x91z' },
  { id: 'conn3', provider: 'Twilio', type: 'Voice', status: 'Connected', apiKeyMasked: 'AC34...8a2f', phoneNumber: '(555) 123-4567' },
];

// ... (Existing ALL_REPORTS_CONFIG remains at bottom) ...
export const ALL_REPORTS_CONFIG: ReportDefinition[] = [
  // --- FINANCIAL ---
  { id: 'fin_goals', category: 'Financial', name: 'Appointment Goal Tracker Report', description: 'Track revenue goals against actuals.', columns: ['Date', 'Service Type', 'Goal', 'Actual', 'Variance'] },
  // ... (rest of report config) ...
  { id: 'emp_time', category: 'Employees', name: 'Time Clock', description: 'Hours worked.', columns: ['Staff Member', 'Date', 'Clock In', 'Clock Out', 'Total Hours'] },
];

// --- AI AGENTS ---
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
