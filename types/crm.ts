
// Primitive Types for Architecture Clarity
export type ID = string;
export type ISODate = string; // ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
export type URL = string;
export type Currency = number; // Represents monetary value
export type MoneyCents = number; // Integer representation of currency

// --- Enums ---

export enum OwnerStatus {
  ACTIVE = 'ACTIVE',
  LEAD = 'LEAD',
  BANNED = 'BANNED',
  VIP = 'VIP',
}

export enum PetSex {
  MALE = 'M',
  FEMALE = 'F',
}

export enum VaccinationStatus {
  VALID = 'Valid',
  EXPIRING = 'Expiring', // Expiring within 30 days
  EXPIRED = 'Expired',
}

export enum ServiceType {
  BOARDING = 'Boarding',
  DAYCARE = 'Daycare',
  GROOMING = 'Grooming',
  TRAINING = 'Training',
  SPA = 'Spa Treatment',
}

export enum ReservationStatus {
  REQUESTED = 'Requested',
  CONFIRMED = 'Confirmed',
  CHECKED_IN = 'Checked In',
  CHECKED_OUT = 'Checked Out',
  CANCELLED = 'Cancelled',
}

export enum InteractionType {
  CALL = 'CALL',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  NOTE = 'NOTE',
}

export enum InteractionDirection {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
}

export enum Sentiment {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  NEGATIVE = 'Negative',
}

// --- 1. Owner Entity ---

export interface ContactInfo {
  phone: string;
  email: string;
  secondaryPhone?: string;
  secondaryEmail?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  gateCode?: string;
  notes?: string;
}

export interface OwnerStats {
  lastVisit: ISODate | null;
  lifetimeValue: Currency;
  outstandingBalance: Currency;
  totalReservations: number;
  cancellationRate: number; // Percentage 0-100
}

export interface Owner {
  id: ID;
  firstName: string;
  lastName: string;
  contactInfo: ContactInfo;
  address: Address;
  status: OwnerStatus;
  tags: string[];
  preferences: Record<string, any>; // Flexible JSON for AI/Custom preferences
  stats: OwnerStats;
  
  // Hydrated Relations (Optional for listing, present in detailed view)
  pets?: Pet[];
  agreements?: Agreement[];
  interactions?: Interaction[];
  reservations?: Reservation[];
  packages?: Package[];
}

// --- 2. Pet Entity ---

export interface Pet {
  id: ID;
  ownerId: ID;
  name: string;
  breed: string;
  dob: ISODate;
  weight: number; // lbs
  sex: PetSex;
  fixed: boolean;
  vetClinic: string;
  avatarUrl?: URL;
  
  // Operational Intelligence
  behaviorFlags: string[]; // e.g., "Aggressive", "Jumper", "Escape Artist"
  medicalNotes: string[];
  dietaryRestrictions?: string;
  
  // Relations
  vaccinations?: Vaccination[];
}

// --- 3. Compliance Entities ---

export interface Vaccination {
  id: ID;
  petId: ID;
  name: string; // e.g., "Rabies", "Bordetella"
  expiryDate: ISODate;
  verifiedAt: ISODate;
  status: VaccinationStatus;
  scanUrl?: URL; // Proof of vaccination
}

export interface Agreement {
  id: ID;
  ownerId: ID;
  name: string; // e.g., "Liability Waiver 2024"
  signedAt: ISODate;
  pdfUrl: URL;
  isCurrent: boolean;
}

// --- 4. Business Entities ---

export interface EstimateItem {
  description: string;
  quantity: number;
  unitPrice: Currency;
  total: Currency;
}

export interface Estimate {
  id: ID;
  reservationId?: ID;
  items: EstimateItem[];
  total: Currency;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
  validUntil: ISODate;
}

export interface Package {
  id: ID;
  ownerId: ID;
  name: string; // e.g., "20 Daycare Days"
  serviceType: ServiceType;
  creditsTotal: number;
  creditsUsed: number;
  purchaseDate: ISODate;
  expiryDate?: ISODate;
}

export interface Reservation {
  id: ID;
  ownerId: ID;
  petIds: ID[];
  serviceType: ServiceType;
  startDate: ISODate;
  endDate: ISODate;
  status: ReservationStatus;
  totalCost: Currency;
  notes?: string;
  depositPaid?: boolean;
}

// --- 5. Interaction Entity ---

export interface Interaction {
  id: ID;
  ownerId: ID;
  type: InteractionType;
  direction: InteractionDirection;
  content: string;
  sentiment: Sentiment;
  timestamp: ISODate;
  staffMemberId: ID; // Who handled the interaction
}

// ==========================================
// MOCK DATA EXPORT
// ==========================================

export const mockOwners: Owner[] = [
  {
    id: 'own_001',
    firstName: 'Victoria',
    lastName: 'Sterling',
    status: OwnerStatus.VIP,
    tags: ['High Spender', 'Picky Eater', 'Referral Source'],
    contactInfo: {
      phone: '+1 (555) 019-2834',
      email: 'victoria.sterling@example.com',
      emergencyContact: {
        name: 'Richard Sterling',
        phone: '+1 (555) 019-9999',
        relation: 'Husband',
      },
    },
    address: {
      street: '4500 Highland Park Dr',
      city: 'Dallas',
      state: 'TX',
      zipCode: '75205',
      gateCode: '#1234',
      notes: 'Please park in the circular drive.',
    },
    stats: {
      lastVisit: '2023-10-15T14:00:00Z',
      lifetimeValue: 12500.00,
      outstandingBalance: 0.00,
      totalReservations: 42,
      cancellationRate: 2.5,
    },
    preferences: {
      preferredCommunication: 'SMS',
      coffeePreference: 'Oat Milk Latte', // CRM personalization
      giftGiving: true,
    },
    pets: [
      {
        id: 'pet_001',
        ownerId: 'own_001',
        name: 'Duchess',
        breed: 'Standard Poodle',
        dob: '2020-05-12T00:00:00Z',
        weight: 45,
        sex: PetSex.FEMALE,
        fixed: true,
        vetClinic: 'Highland Park Animal Hospital',
        avatarUrl: 'https://i.pravatar.cc/150?u=Duchess',
        behaviorFlags: ['Separation Anxiety'],
        medicalNotes: ['Allergic to chicken', 'Sensitive stomach'],
        vaccinations: [
          { id: 'vax_1', petId: 'pet_001', name: 'Rabies', expiryDate: '2025-05-12T00:00:00Z', verifiedAt: '2023-05-12T00:00:00Z', status: VaccinationStatus.VALID },
          { id: 'vax_2', petId: 'pet_001', name: 'Bordetella', expiryDate: '2023-11-20T00:00:00Z', verifiedAt: '2023-05-20T00:00:00Z', status: VaccinationStatus.EXPIRING },
        ]
      }
    ],
    reservations: [
      {
        id: 'res_101',
        ownerId: 'own_001',
        petIds: ['pet_001'],
        serviceType: ServiceType.SPA,
        startDate: '2023-11-01T09:00:00Z',
        endDate: '2023-11-01T13:00:00Z',
        status: ReservationStatus.CONFIRMED,
        totalCost: 185.00,
        notes: 'Full groom with blueberry facial.'
      }
    ],
    interactions: [
      {
        id: 'int_50',
        ownerId: 'own_001',
        type: InteractionType.CALL,
        direction: InteractionDirection.INBOUND,
        content: 'Called to confirm the blueberry facial is available for the upcoming grooming.',
        sentiment: Sentiment.POSITIVE,
        timestamp: '2023-10-25T10:30:00Z',
        staffMemberId: 'staff_01'
      }
    ]
  },
  {
    id: 'own_002',
    firstName: 'Marcus',
    lastName: 'Chen',
    status: OwnerStatus.VIP,
    tags: ['Frequent Traveler', 'Tech Industry', 'Multi-Pet'],
    contactInfo: {
      phone: '+1 (415) 555-8821',
      email: 'm.chen@techventures.io',
    },
    address: {
      street: '888 Innovation Way, Penthouse B',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94107',
    },
    stats: {
      lastVisit: '2023-10-20T08:00:00Z',
      lifetimeValue: 28400.00,
      outstandingBalance: 450.00,
      totalReservations: 18,
      cancellationRate: 0,
    },
    preferences: {
      invoiceMethod: 'Auto-Pay',
      dailyPhotos: true,
    },
    packages: [
      {
        id: 'pkg_99',
        ownerId: 'own_002',
        name: '50 Day Boarding Pass',
        serviceType: ServiceType.BOARDING,
        creditsTotal: 50,
        creditsUsed: 32,
        purchaseDate: '2023-01-15T00:00:00Z'
      }
    ],
    pets: [
      {
        id: 'pet_002',
        ownerId: 'own_002',
        name: 'Apollo',
        breed: 'French Bulldog',
        dob: '2021-08-01T00:00:00Z',
        weight: 28,
        sex: PetSex.MALE,
        fixed: true,
        vetClinic: 'Golden Gate Vet',
        behaviorFlags: ['Resource Guarding (Toys)'],
        medicalNotes: ['History of IVDD - monitor back'],
        vaccinations: [
          { id: 'vax_3', petId: 'pet_002', name: 'Rabies', expiryDate: '2024-08-01T00:00:00Z', verifiedAt: '2023-08-01T00:00:00Z', status: VaccinationStatus.VALID },
        ]
      },
      {
        id: 'pet_003',
        ownerId: 'own_002',
        name: 'Zeus',
        breed: 'Doberman Pinscher',
        dob: '2019-02-14T00:00:00Z',
        weight: 85,
        sex: PetSex.MALE,
        fixed: true,
        vetClinic: 'Golden Gate Vet',
        behaviorFlags: ['High Energy', 'Jumper'],
        medicalNotes: [],
        vaccinations: [
          { id: 'vax_4', petId: 'pet_003', name: 'Rabies', expiryDate: '2024-02-14T00:00:00Z', verifiedAt: '2023-02-14T00:00:00Z', status: VaccinationStatus.VALID },
        ]
      }
    ],
    interactions: [
      {
        id: 'int_51',
        ownerId: 'own_002',
        type: InteractionType.EMAIL,
        direction: InteractionDirection.OUTBOUND,
        content: 'Sent invoice #9921 for upcoming holiday boarding deposit.',
        sentiment: Sentiment.NEUTRAL,
        timestamp: '2023-10-26T09:00:00Z',
        staffMemberId: 'system'
      }
    ]
  },
  {
    id: 'own_003',
    firstName: 'Elena',
    lastName: 'Moretti',
    status: OwnerStatus.VIP,
    tags: ['Summer Resident', 'Influencer'],
    contactInfo: {
      phone: '+1 (305) 555-1212',
      email: 'elena@morettistyle.com',
      secondaryEmail: 'assistant@morettistyle.com'
    },
    address: {
      street: '12 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      zipCode: '33139',
    },
    stats: {
      lastVisit: '2023-09-01T10:00:00Z',
      lifetimeValue: 8900.00,
      outstandingBalance: 0.00,
      totalReservations: 12,
      cancellationRate: 15.0,
    },
    preferences: {
      socialMediaConsent: true, // Key for influencer clients
      photoFilter: 'Bright',
    },
    pets: [
      {
        id: 'pet_004',
        ownerId: 'own_003',
        name: 'Coco',
        breed: 'Pomeranian',
        dob: '2022-01-10T00:00:00Z',
        weight: 6,
        sex: PetSex.FEMALE,
        fixed: false,
        vetClinic: 'South Beach Vets',
        behaviorFlags: [],
        medicalNotes: ['Hypoglycemia risk - frequent snacks'],
        avatarUrl: 'https://i.pravatar.cc/150?u=Coco',
        vaccinations: [
          { id: 'vax_5', petId: 'pet_004', name: 'Rabies', expiryDate: '2022-12-01T00:00:00Z', verifiedAt: '2022-01-10T00:00:00Z', status: VaccinationStatus.EXPIRED },
        ]
      }
    ],
    interactions: [
      {
        id: 'int_52',
        ownerId: 'own_003',
        type: InteractionType.SMS,
        direction: InteractionDirection.INBOUND,
        content: 'Is my driver allowed to pick up Coco today?',
        sentiment: Sentiment.NEUTRAL,
        timestamp: '2023-09-01T14:00:00Z',
        staffMemberId: 'staff_02'
      },
      {
        id: 'int_53',
        ownerId: 'own_003',
        type: InteractionType.NOTE,
        direction: InteractionDirection.OUTBOUND,
        content: 'Reminder: Vaccination records are expired. Must update before next booking.',
        sentiment: Sentiment.NEGATIVE,
        timestamp: '2023-10-27T11:00:00Z',
        staffMemberId: 'staff_01'
      }
    ]
  }
];
