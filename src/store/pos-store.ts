
import { create } from 'zustand';
import { Product, CartItem, Order, Shift, PaymentMethod } from '../types/retail';
import { Owner, Pet } from '../types/crm';
import { UserLedger, MembershipDefinition, PackageDefinition, CreditBalance } from '../types/loyalty';
import { generateId } from '../shared/utils';

// --- Mock Data ---
const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', sku: 'KIB-001', name: 'Premium Kibble (5lb)', price: 2499, category: 'FOOD', trackInventory: true, stockLevel: 15, lowStockThreshold: 5 },
  { id: 'p2', sku: 'SRV-DAY', name: 'Full Day Daycare', price: 3500, category: 'SERVICE', trackInventory: false, stockLevel: 0, lowStockThreshold: 0 },
  { id: 'p3', sku: 'TOY-009', name: 'Squeaky Bone', price: 850, category: 'RETAIL', trackInventory: true, stockLevel: 3, lowStockThreshold: 5 },
  { id: 'p4', sku: 'SRV-WASH', name: 'Exit Bath', price: 3000, category: 'GROOMING', trackInventory: false, stockLevel: 0, lowStockThreshold: 0 },
  { id: 'pkg1', sku: 'PKG-10DAY', name: '10 Day Play Pass', price: 31500, category: 'PACKAGE', trackInventory: false, stockLevel: 0, lowStockThreshold: 0 },
  { id: 'mem1', sku: 'MEM-GOLD', name: 'Gold Membership', price: 4900, category: 'MEMBERSHIP', trackInventory: false, stockLevel: 0, lowStockThreshold: 0 },
];

const MOCK_MEMBERSHIPS: MembershipDefinition[] = [
  { 
    id: 'md_gold', name: 'Gold Member', price: 4900, billingFrequency: 'MONTHLY', isActive: true, requiresSignature: true, colorHex: '#eab308',
    benefits: [
      { id: 'ben1', type: 'DISCOUNT_PERCENT', value: 10, targetCategory: 'RETAIL', description: '10% off Retail' },
      { id: 'ben2', type: 'DISCOUNT_PERCENT', value: 5, targetCategory: 'GROOMING', description: '5% off Grooming' }
    ]
  }
];

// Mock Ledger for demo purposes
const MOCK_USER_LEDGERS: Record<string, UserLedger> = {
  'own_001': {
    ownerId: 'own_001',
    credits: [
      { id: 'cred_1', ownerId: 'own_001', packageDefinitionId: 'pkg_10', serviceCategory: 'SERVICE', remaining: 3, isHourly: false, expiresAt: '2024-12-31' }
    ],
    activeMembership: {
      id: 'um_1', ownerId: 'own_001', membershipDefinitionId: 'md_gold', status: 'ACTIVE', startedAt: '2023-01-01', nextBillDate: '2023-11-01'
    }
  }
};

interface PosState {
  // Data
  products: Product[];
  currentShift: Shift | null;
  memberships: MembershipDefinition[];
  
  // Cart State
  cart: CartItem[];
  activeCustomer: Owner | null;
  customerLedger: UserLedger | null; // Loaded when customer is set
  parkedOrders: Order[];
  
  // Actions
  openShift: (amount: number) => void;
  closeShift: (actualAmount: number, notes?: string) => void;
  setCustomer: (customer: Owner | null) => void;
  addToCart: (product: Product) => void;
  updateCartItem: (cartId: string, updates: Partial<CartItem>) => void;
  removeFromCart: (cartId: string) => void;
  redeemCredit: (cartId: string, creditId: string | null) => void; // Toggle redemption
  clearCart: () => void;
  parkOrder: () => void;
  getTotals: () => { subtotal: number; tax: number; total: number };
}

export const usePosStore = create<PosState>((set, get) => ({
  products: MOCK_PRODUCTS,
  currentShift: null,
  memberships: MOCK_MEMBERSHIPS,
  cart: [],
  activeCustomer: null,
  customerLedger: null,
  parkedOrders: [],

  openShift: (amount) => set({
    currentShift: { id: generateId('sh'), staffId: 'current-user', openedAt: new Date().toISOString(), startingCash: amount, status: 'OPEN' }
  }),

  closeShift: (actualAmount, notes) => set((state) => ({
    currentShift: state.currentShift ? { ...state.currentShift, status: 'CLOSED', endingCash: actualAmount, notes } : null
  })),

  setCustomer: (customer) => {
    // In real app, fetch ledger from API
    const ledger = customer ? MOCK_USER_LEDGERS[customer.id] || { ownerId: customer.id, credits: [] } : null;
    
    // When customer changes, re-evaluate all prices in cart
    const currentCart = get().cart;
    const reCalcCart = currentCart.map(item => calculateSmartPrice(item, ledger, get().memberships));

    set({ activeCustomer: customer, customerLedger: ledger, cart: reCalcCart });
  },

  addToCart: (product) => set((state) => {
    const newItem: CartItem = {
      ...product,
      cartId: generateId('ci'),
      quantity: 1,
      discount: 0,
      isRedemption: false
    };
    
    // Apply Membership Discounts Immediately
    const smartItem = calculateSmartPrice(newItem, state.customerLedger, state.memberships);
    
    return { cart: [...state.cart, smartItem] };
  }),

  updateCartItem: (cartId, updates) => set((state) => ({
    cart: state.cart.map(item => item.cartId === cartId ? { ...item, ...updates } : item)
  })),

  removeFromCart: (cartId) => set((state) => ({
    cart: state.cart.filter(item => item.cartId !== cartId)
  })),

  redeemCredit: (cartId, creditId) => set((state) => {
    const cart = state.cart.map(item => {
      if (item.cartId !== cartId) return item;

      // If untoggling
      if (!creditId) {
        const resetItem = { ...item, redeemedCreditId: undefined, isRedemption: false };
        return calculateSmartPrice(resetItem, state.customerLedger, state.memberships);
      }

      // If applying credit
      return {
        ...item,
        redeemedCreditId: creditId,
        isRedemption: true,
        price: 0, // Visual price becomes 0
        discount: 0, // Clear discounts as credit covers it
        appliedBenefitId: undefined
      };
    });
    return { cart };
  }),

  clearCart: () => set({ cart: [], activeCustomer: null, customerLedger: null }),

  parkOrder: () => set((state) => ({ /* ... same as before ... */ })),

  getTotals: () => {
    const { cart } = get();
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity) - item.discount, 0);
    const tax = Math.round(subtotal * 0.08);
    return { subtotal, tax, total: subtotal + tax };
  }
}));

// --- Helper Logic ---

function calculateSmartPrice(item: CartItem, ledger: UserLedger | null, definitions: MembershipDefinition[]): CartItem {
  // If already redeeming a credit, skip pricing logic
  if (item.isRedemption) return item;

  let finalDiscount = 0;
  let benefitId: string | undefined = undefined;

  // Check Membership Benefits
  if (ledger?.activeMembership && ledger.activeMembership.status === 'ACTIVE') {
    const def = definitions.find(d => d.id === ledger.activeMembership!.membershipDefinitionId);
    if (def) {
      // Find best applicable rule
      const rule = def.benefits.find(b => b.targetCategory === 'ALL' || b.targetCategory === item.category);
      if (rule) {
        if (rule.type === 'DISCOUNT_PERCENT') {
          finalDiscount = Math.round(item.price * (rule.value / 100));
        } else if (rule.type === 'DISCOUNT_FIXED') {
          finalDiscount = rule.value;
        }
        benefitId = rule.id;
      }
    }
  }

  return {
    ...item,
    discount: finalDiscount,
    appliedBenefitId: benefitId
  };
}
