
import { ID, ISODate, MoneyCents } from './crm';
import { ProductCategory } from './retail';

// --- Configuration Types ---

export interface PackageCreditRule {
  serviceCategory: ProductCategory; // e.g., 'SERVICE' (Daycare) or 'GROOMING'
  specificSku?: string; // Optional: restricts credit to specific item
  quantity: number;
  isHourly: boolean; // If true, quantity is hours, else units (days/instances)
}

export interface PackageDefinition {
  id: ID;
  name: string;
  price: MoneyCents;
  description: string;
  credits: PackageCreditRule[];
  expirationDays: number;
  isActive: boolean;
}

export type BenefitType = 'DISCOUNT_PERCENT' | 'DISCOUNT_FIXED' | 'CREDIT_DROP';

export interface MembershipBenefit {
  id: ID;
  type: BenefitType;
  value: number; // e.g., 10 for 10% or 500 for $5.00 off
  targetCategory: ProductCategory | 'ALL';
  description: string;
}

export interface MembershipDefinition {
  id: ID;
  name: string;
  price: MoneyCents;
  billingFrequency: 'MONTHLY' | 'ANNUALLY';
  benefits: MembershipBenefit[];
  contractUrl?: string; // Empty template PDF
  requiresSignature: boolean;
  isActive: boolean;
  colorHex: string; // For UI card styling
}

// --- User Ledger Types ---

export interface CreditBalance {
  id: ID;
  ownerId: ID;
  packageDefinitionId: ID;
  serviceCategory: ProductCategory;
  remaining: number; // Hours or Units
  isHourly: boolean;
  expiresAt: ISODate;
}

export interface UserMembership {
  id: ID;
  ownerId: ID;
  membershipDefinitionId: ID;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  startedAt: ISODate;
  nextBillDate: ISODate;
  signedContractUrl?: string;
  signatureTimestamp?: ISODate;
}

export interface UserLedger {
  ownerId: ID;
  credits: CreditBalance[];
  activeMembership?: UserMembership;
}
