
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FacilityConfig, Role, TimeClockConfig, Permission, PricingRule, TaxRate, FormTemplate, InvoiceSettings, ServiceQuota, ServiceType, PortalSettings } from '../types';
import { MOCK_PRICING_RULES, MOCK_TAX_RATES } from '../constants';

// --- Default Data ---

const DEFAULT_FACILITY: FacilityConfig = {
  name: 'Partners Dogs',
  phone: '(555) 123-4567',
  email: 'info@partnersdogs.com',
  website: 'www.partnersdogs.com',
  taxId: '12-3456789',
  address: {
    street: '123 Canine Lane',
    city: 'Phoenix',
    state: 'AZ',
    zip: '85001'
  },
  hours: {
    'Monday': { open: '07:00', close: '19:00', closed: false },
    'Tuesday': { open: '07:00', close: '19:00', closed: false },
    'Wednesday': { open: '07:00', close: '19:00', closed: false },
    'Thursday': { open: '07:00', close: '19:00', closed: false },
    'Friday': { open: '07:00', close: '19:00', closed: false },
    'Saturday': { open: '08:00', close: '17:00', closed: false },
    'Sunday': { open: '09:00', close: '16:00', closed: false },
  }
};

const DEFAULT_ROLES: Role[] = [
  { 
    id: 'admin', 
    name: 'Administrator', 
    description: 'Full system access with no restrictions.', 
    permissions: ['view_financials', 'manage_financials', 'manage_users', 'manage_settings', 'view_reports', 'manage_reservations', 'delete_records', 'manage_marketing', 'export_data'],
    usersCount: 2,
    isSystem: true
  },
  { 
    id: 'manager', 
    name: 'Facility Manager', 
    description: 'Day-to-day operations leader. Can manage staff but not system settings.', 
    permissions: ['view_financials', 'view_reports', 'manage_reservations', 'manage_marketing'],
    usersCount: 3,
    isSystem: false
  },
  { 
    id: 'staff', 
    name: 'Staff', 
    description: 'General access for kennel attendants and front desk.', 
    permissions: ['manage_reservations'],
    usersCount: 12,
    isSystem: false
  },
];

const DEFAULT_TIME_CLOCK: TimeClockConfig = {
  enabled: true,
  allowMobile: false,
  geoFencing: true,
  geoRadiusMeters: 500,
  autoClockOutHours: 14,
  overtimeThresholdWeekly: 40
};

// Mock Initial Data for new features
const DEFAULT_FORMS: FormTemplate[] = [
  {
    id: 'f1', name: 'New Client Intake', description: 'Standard form for new owners.', category: 'Intake', isActive: true, lastUpdated: '2023-10-01',
    fields: [
      { id: '1', label: 'How did you hear about us?', type: 'select', required: true, options: ['Google', 'Referral', 'Social Media'] },
      { id: '2', label: 'Emergency Contact Name', type: 'text', required: true },
      { id: '3', label: 'Emergency Contact Phone', type: 'text', required: true }
    ]
  },
  {
    id: 'f2', name: 'Liability Waiver 2024', description: 'Legal release for services.', category: 'Agreement', isActive: true, lastUpdated: '2023-11-15',
    fields: [
      { id: '1', label: 'I agree to the terms of service', type: 'checkbox', required: true },
      { id: '2', label: 'Owner Signature', type: 'signature', required: true }
    ]
  }
];

const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  prefix: 'INV-',
  nextNumber: 1024,
  terms: 'Payment is due upon receipt of services. Late fees may apply after 30 days.',
  footerNote: 'Thank you for trusting us with your pet!',
  dueDays: 0, // Due on receipt
  taxLabel: 'Sales Tax'
};

const DEFAULT_QUOTAS: ServiceQuota[] = [
  { serviceType: ServiceType.Boarding, maxDailyCapacity: 50, onlineBookingLimit: 45, overbookingBuffer: 2, warningThreshold: 48 },
  { serviceType: ServiceType.Daycare, maxDailyCapacity: 60, onlineBookingLimit: 55, overbookingBuffer: 5, warningThreshold: 55 },
  { serviceType: ServiceType.Grooming, maxDailyCapacity: 15, onlineBookingLimit: 12, overbookingBuffer: 0, warningThreshold: 14 },
  { serviceType: ServiceType.Training, maxDailyCapacity: 10, onlineBookingLimit: 10, overbookingBuffer: 0, warningThreshold: 9 },
];

const DEFAULT_PORTAL_SETTINGS: PortalSettings = {
  enabled: true,
  allowOnlineBooking: true,
  allowPayments: true,
  showPhotos: true,
  requireWaiver: true,
  announcement: 'Welcome to our new customer portal! Please update your pet\'s vaccination records.',
  bookingWindowDays: 60
};

// --- Context Definition ---

interface SystemContextType {
  facilityInfo: FacilityConfig;
  updateFacilityInfo: (updates: Partial<FacilityConfig>) => void;
  
  roles: Role[];
  addRole: (role: Role) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  
  timeClockSettings: TimeClockConfig;
  updateTimeClockSettings: (updates: Partial<TimeClockConfig>) => void;

  // New Features
  pricingRules: PricingRule[];
  addPricingRule: (rule: PricingRule) => void;
  updatePricingRule: (id: string, updates: Partial<PricingRule>) => void;
  deletePricingRule: (id: string) => void;

  taxRates: TaxRate[];
  addTaxRate: (rate: TaxRate) => void;
  updateTaxRate: (id: string, updates: Partial<TaxRate>) => void;
  deleteTaxRate: (id: string) => void;

  forms: FormTemplate[];
  addForm: (form: FormTemplate) => void;
  updateForm: (id: string, updates: Partial<FormTemplate>) => void;
  deleteForm: (id: string) => void;

  invoiceSettings: InvoiceSettings;
  updateInvoiceSettings: (updates: Partial<InvoiceSettings>) => void;

  quotas: ServiceQuota[];
  updateQuota: (serviceType: ServiceType, updates: Partial<ServiceQuota>) => void;

  portalSettings: PortalSettings;
  updatePortalSettings: (updates: Partial<PortalSettings>) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};

export const SystemProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [facilityInfo, setFacilityInfo] = useState<FacilityConfig>(DEFAULT_FACILITY);
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [timeClockSettings, setTimeClockSettings] = useState<TimeClockConfig>(DEFAULT_TIME_CLOCK);
  
  // New States
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(MOCK_PRICING_RULES);
  const [taxRates, setTaxRates] = useState<TaxRate[]>(MOCK_TAX_RATES);
  const [forms, setForms] = useState<FormTemplate[]>(DEFAULT_FORMS);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(DEFAULT_INVOICE_SETTINGS);
  const [quotas, setQuotas] = useState<ServiceQuota[]>(DEFAULT_QUOTAS);
  const [portalSettings, setPortalSettings] = useState<PortalSettings>(DEFAULT_PORTAL_SETTINGS);

  // Existing updaters...
  const updateFacilityInfo = (updates: Partial<FacilityConfig>) => {
    setFacilityInfo(prev => ({ ...prev, ...updates }));
  };

  const addRole = (role: Role) => {
    setRoles(prev => [...prev, role]);
  };

  const updateRole = (id: string, updates: Partial<Role>) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  const updateTimeClockSettings = (updates: Partial<TimeClockConfig>) => {
    setTimeClockSettings(prev => ({ ...prev, ...updates }));
  };

  // New Updaters
  const addPricingRule = (rule: PricingRule) => setPricingRules(prev => [...prev, rule]);
  const updatePricingRule = (id: string, updates: Partial<PricingRule>) => setPricingRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  const deletePricingRule = (id: string) => setPricingRules(prev => prev.filter(r => r.id !== id));

  const addTaxRate = (rate: TaxRate) => setTaxRates(prev => [...prev, rate]);
  const updateTaxRate = (id: string, updates: Partial<TaxRate>) => setTaxRates(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  const deleteTaxRate = (id: string) => setTaxRates(prev => prev.filter(r => r.id !== id));

  const addForm = (form: FormTemplate) => setForms(prev => [...prev, form]);
  const updateForm = (id: string, updates: Partial<FormTemplate>) => setForms(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  const deleteForm = (id: string) => setForms(prev => prev.filter(f => f.id !== id));

  const updateInvoiceSettings = (updates: Partial<InvoiceSettings>) => setInvoiceSettings(prev => ({ ...prev, ...updates }));

  const updateQuota = (serviceType: ServiceType, updates: Partial<ServiceQuota>) => setQuotas(prev => prev.map(q => q.serviceType === serviceType ? { ...q, ...updates } : q));

  const updatePortalSettings = (updates: Partial<PortalSettings>) => setPortalSettings(prev => ({ ...prev, ...updates }));

  return (
    <SystemContext.Provider value={{
      facilityInfo, updateFacilityInfo,
      roles, addRole, updateRole, deleteRole,
      timeClockSettings, updateTimeClockSettings,
      pricingRules, addPricingRule, updatePricingRule, deletePricingRule,
      taxRates, addTaxRate, updateTaxRate, deleteTaxRate,
      forms, addForm, updateForm, deleteForm,
      invoiceSettings, updateInvoiceSettings,
      quotas, updateQuota,
      portalSettings, updatePortalSettings
    }}>
      {children}
    </SystemContext.Provider>
  );
};
