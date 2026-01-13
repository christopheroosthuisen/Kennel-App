
import { ID, ISODate, MoneyCents } from './crm';

export type ProductCategory = 'FOOD' | 'SERVICE' | 'GROOMING' | 'RETAIL' | 'MEDICATION' | 'MEMBERSHIP' | 'PACKAGE';

export interface Product {
  id: ID;
  sku: string;
  barcode?: string;
  name: string;
  price: MoneyCents; // Cents
  category: ProductCategory;
  trackInventory: boolean;
  stockLevel: number;
  lowStockThreshold: number;
  imageUrl?: string;
}

export interface CartItem extends Product {
  cartId: string; // Unique ID for this specific line item in cart
  quantity: number;
  discount: MoneyCents;
  note?: string;
  assignedPetId?: ID; // CRITICAL: Links service to specific pet
  
  // Loyalty Integration
  appliedBenefitId?: string; // ID of the MembershipBenefit applied
  redeemedCreditId?: string; // ID of the CreditBalance used
  isRedemption: boolean; // If true, price should be effectively 0 (or covered)
}

export interface PaymentMethod {
  type: 'CASH' | 'CARD' | 'CHECK' | 'ACCOUNT_CREDIT';
  amount: MoneyCents;
  reference?: string; // Auth code or Check #
}

export interface Order {
  id: ID;
  createdAt: ISODate;
  customerName?: string;
  customerId?: ID;
  items: CartItem[];
  subtotal: MoneyCents;
  tax: MoneyCents;
  total: MoneyCents;
  payments: PaymentMethod[];
  status: 'COMPLETED' | 'PARKED' | 'REFUNDED' | 'VOID';
  shiftId: ID;
}

export interface Shift {
  id: ID;
  staffId: ID;
  openedAt: ISODate;
  closedAt?: ISODate;
  startingCash: MoneyCents;
  endingCash?: MoneyCents; // Actual count
  expectedCash?: MoneyCents; // System calculated
  discrepancy?: MoneyCents;
  notes?: string;
  status: 'OPEN' | 'CLOSED';
}
