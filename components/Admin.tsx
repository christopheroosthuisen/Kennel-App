import React, { useState } from 'react';
import { 
  Settings, Shield, CreditCard, Bell, Database, Search, 
  ChevronRight, Sparkles, Building2, CalendarRange, 
  Users, FileText, Dog, Mail, DollarSign, Clock, LayoutGrid,
  CheckCircle, AlertCircle, Trash2, Edit2, Plus, GripVertical, Activity,
  Package as PackageIcon, Crown, Check, Save, Calculator, MessageSquare, Phone,
  Stethoscope, Syringe, MapPin, Palette, Type, MousePointer, Monitor,
  RefreshCw, Percent, Ticket, User, Lock, UploadCloud, Download, FileJson, 
  Map, Smartphone, ShieldCheck, ChevronUp, ChevronDown, Eye, List, Type as TypeIcon,
  AlignLeft, CheckSquare, Calendar, Hash, PenTool, Layout, X, Globe, Link as LinkIcon, ExternalLink,
  Megaphone, Info, Camera
} from 'lucide-react';
import { Card, Button, Input, Switch, Select, Label, Textarea, cn, Badge, Tabs, Modal, SortableHeader, SearchInput } from './Common';
import { 
  MOCK_SERVICE_CONFIGS, MOCK_EMAIL_TEMPLATES, 
  MOCK_UNITS, MOCK_USERS, MOCK_AUTOMATIONS, MOCK_AUDIT_LOGS,
  MOCK_PACKAGES, MOCK_MEMBERSHIPS, MOCK_VET_CLINICS, MOCK_VETERINARIANS,
  MOCK_OWNERS, MOCK_PETS, MOCK_PRICING_RULES, MOCK_TAX_RATES
} from '../constants';
import { ServiceType, Package, Membership, Role, Permission, PricingRule, TaxRate, FormTemplate, InvoiceSettings, ServiceQuota, PortalSettings, FormField } from '../types';
import { useTheme } from './ThemeContext';
import { useSystem } from './SystemContext';

// --- Helper Components ---
const SectionHeader = ({ title, description, action }: { title: string, description: string, action?: React.ReactNode }) => (
  <div className="flex justify-between items-center mb-6">
    <div>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <p className="text-slate-500 text-sm">{description}</p>
    </div>
    {action}
  </div>
);

const EmptyState = ({ title, message }: { title: string, message: string }) => (
  <div className="flex flex-col items-center justify-center h-48 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
     <div className="bg-slate-100 p-3 rounded-full mb-3">
        <Database size={24} className="opacity-50" />
     </div>
     <h3 className="text-sm font-medium text-slate-600">{title}</h3>
     <p className="text-xs">{message}</p>
  </div>
);

// --- View Implementations ---

const ReservationTypesView = () => (
  <div>
    <SectionHeader title="Reservation Types" description="Configure service types, base rates, and colors." action={<Button className="gap-2"><Plus size={16}/> Add Type</Button>} />
    <div className="space-y-4">
      {MOCK_SERVICE_CONFIGS.map(svc => (
        <Card key={svc.id} className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: svc.color }}></div>
            <div>
              <div className="font-bold text-slate-800">{svc.name}</div>
              <div className="text-xs text-slate-500">{svc.type} • Per {svc.unitType}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="font-mono font-medium">${svc.baseRate.toFixed(2)}</div>
            <Switch checked={svc.enabled} onCheckedChange={()=>{}} />
            <Button variant="ghost" size="icon"><Edit2 size={16} /></Button>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const LodgingUnitsView = () => (
  <div>
    <SectionHeader title="Lodging Units" description="Manage kennels, suites, and cages." action={<Button className="gap-2"><Plus size={16}/> Add Unit</Button>} />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {MOCK_UNITS.map(unit => (
        <Card key={unit.id} className="p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline">{unit.type}</Badge>
            <Badge variant={unit.status === 'Active' ? 'success' : 'warning'}>{unit.status}</Badge>
          </div>
          <div className="font-bold text-lg text-slate-800">{unit.name}</div>
          <div className="text-xs text-slate-500 mt-1">Size: {unit.size}</div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const AddonsRetailView = () => (
  <div>
    <SectionHeader title="Add-ons & Retail" description="Manage extra services and retail products." action={<Button className="gap-2"><Plus size={16}/> Add Item</Button>} />
    <Card className="overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {[
            { name: 'Nail Trim', cat: 'Grooming', price: 15 },
            { name: 'Exit Bath', cat: 'Grooming', price: 30 },
            { name: 'Nature Walk', cat: 'Exercise', price: 20 },
            { name: 'Kibble Bag', cat: 'Retail', price: 24.99 },
          ].map((item, i) => (
            <tr key={i}>
              <td className="px-4 py-3 font-medium">{item.name}</td>
              <td className="px-4 py-3 text-slate-500">{item.cat}</td>
              <td className="px-4 py-3 font-mono">${item.price.toFixed(2)}</td>
              <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm">Edit</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

const PackagesMembershipsView = () => (
  <div className="space-y-8">
    <div>
      <SectionHeader title="Packages" description="Prepaid service credits." action={<Button size="sm"><Plus size={14}/> Add Package</Button>} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_PACKAGES.map(pkg => (
          <Card key={pkg.id} className="p-4">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-slate-800">{pkg.name}</h4>
              <span className="font-mono font-bold text-primary-600">${pkg.price}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{pkg.description}</p>
            <div className="mt-3 text-xs flex gap-2">
              <Badge variant="outline">{pkg.creditQuantity} Credits</Badge>
              <Badge variant="info">{pkg.serviceTypeTarget}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
    <div>
      <SectionHeader title="Memberships" description="Recurring subscriptions." action={<Button size="sm"><Plus size={14}/> Add Membership</Button>} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_MEMBERSHIPS.map(mem => (
          <Card key={mem.id} className="p-4 border-l-4 border-l-purple-500">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-slate-800">{mem.name}</h4>
              <span className="font-mono font-bold text-purple-600">${mem.price}/{mem.billingFrequency === 'Monthly' ? 'mo' : 'yr'}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{mem.description}</p>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const PricingRulesView = () => (
  <div>
    <SectionHeader title="Pricing Rules" description="Dynamic pricing adjustments and triggers." action={<Button className="gap-2"><Plus size={16}/> Add Rule</Button>} />
    <div className="space-y-3">
      {MOCK_PRICING_RULES.map(rule => (
        <Card key={rule.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded text-slate-600"><DollarSign size={16}/></div>
            <div>
              <div className="font-bold text-slate-800">{rule.name}</div>
              <div className="text-xs text-slate-500">{rule.triggerCondition}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              {rule.isPercentage ? `${rule.amount}%` : `$${rule.amount}`} {rule.amount > 0 ? 'Increase' : 'Discount'}
            </Badge>
            <Switch checked={rule.enabled} onCheckedChange={()=>{}} />
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const TaxSettingsView = () => (
  <div>
    <SectionHeader title="Tax Settings" description="Configure sales and service tax rates." action={<Button className="gap-2"><Plus size={16}/> Add Tax Rate</Button>} />
    <div className="space-y-3">
      {MOCK_TAX_RATES.map(tax => (
        <Card key={tax.id} className="p-4 flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-800">{tax.name}</div>
            <div className="text-xs text-slate-500">
              Applies to: {[tax.appliesToServices && 'Services', tax.appliesToProducts && 'Products'].filter(Boolean).join(', ')}
            </div>
          </div>
          <div className="font-mono font-bold text-lg">{tax.rate}%</div>
        </Card>
      ))}
    </div>
  </div>
);

const InvoiceConfigView = () => (
  <div className="max-w-xl">
    <SectionHeader title="Invoice Configuration" description="Settings for invoice generation and terms." />
    <Card className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Invoice Prefix</Label><Input defaultValue="INV-" /></div>
        <div><Label>Next Number</Label><Input defaultValue="1024" type="number" /></div>
      </div>
      <div><Label>Tax Label</Label><Input defaultValue="Sales Tax" /></div>
      <div><Label>Default Terms</Label><Textarea defaultValue="Due on receipt." /></div>
      <div><Label>Footer Note</Label><Textarea defaultValue="Thank you for your business!" /></div>
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <Button>Save Settings</Button>
      </div>
    </Card>
  </div>
);

const UsageQuotasView = () => (
  <div>
    <SectionHeader title="Usage & Quotas" description="Set capacity limits for services." />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {['Boarding', 'Daycare', 'Grooming', 'Training'].map(svc => (
        <Card key={svc} className="p-4">
          <h4 className="font-bold text-slate-800 mb-3">{svc} Capacity</h4>
          <div className="space-y-3">
            <div><Label>Max Daily Capacity</Label><Input type="number" defaultValue="50" /></div>
            <div><Label>Online Booking Limit</Label><Input type="number" defaultValue="45" /></div>
            <div className="flex items-center gap-2 mt-2">
              <Switch checked={true} onCheckedChange={()=>{}} />
              <span className="text-sm">Allow Overbooking</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const HealthSettingsView = () => (
  <div>
    <SectionHeader title="Health Requirements" description="Manage required vaccinations and health checks." action={<Button className="gap-2"><Plus size={16}/> Add Requirement</Button>} />
    <div className="space-y-3">
      {['Rabies', 'Bordetella', 'DHPP'].map(vax => (
        <Card key={vax} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Syringe size={18} className="text-slate-400" />
            <span className="font-bold text-slate-800">{vax}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>Expires: 1-3 Years</span>
            <Badge variant="outline">Required</Badge>
            <Button variant="ghost" size="icon"><Edit2 size={16}/></Button>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const VetHospitalSettingsView = () => (
  <div>
    <SectionHeader title="Veterinary Hospitals" description="Manage local vet clinics directory." action={<Button className="gap-2"><Plus size={16}/> Add Clinic</Button>} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MOCK_VET_CLINICS.map(clinic => (
        <Card key={clinic.id} className="p-4">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-slate-800">{clinic.name}</h4>
            {clinic.emergency && <Badge variant="danger">Emergency</Badge>}
          </div>
          <div className="text-sm text-slate-600 mt-2 space-y-1">
            <div className="flex items-center gap-2"><Phone size={14}/> {clinic.phone}</div>
            <div className="flex items-center gap-2"><MapPin size={14}/> {clinic.address}</div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const CommunicationsView = () => (
  <div>
    <SectionHeader title="Communication Templates" description="Edit email and SMS templates." action={<Button className="gap-2"><Plus size={16}/> Add Template</Button>} />
    <div className="space-y-3">
      {MOCK_EMAIL_TEMPLATES.map(tmpl => (
        <Card key={tmpl.id} className="p-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{tmpl.name}</span>
              <Badge variant="outline">{tmpl.type}</Badge>
            </div>
            <div className="text-xs text-slate-500 mt-1">Trigger: {tmpl.trigger}</div>
          </div>
          <Button variant="ghost" size="sm">Edit</Button>
        </Card>
      ))}
    </div>
  </div>
);

const AutomationsView = () => (
  <div>
    <SectionHeader title="Automations" description="Manage active workflows." />
    <div className="space-y-3">
      {MOCK_AUTOMATIONS.map(auto => (
        <Card key={auto.id} className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded text-slate-600"><Activity size={16}/></div>
            <div>
              <div className="font-bold text-slate-800">{auto.name}</div>
              <div className="text-xs text-slate-500">{auto.trigger} → {auto.action}</div>
            </div>
          </div>
          <Switch checked={auto.enabled} onCheckedChange={()=>{}} />
        </Card>
      ))}
    </div>
  </div>
);

const PortalSettingsView = () => (
  <div className="max-w-2xl">
    <SectionHeader title="Customer Portal" description="Configure what clients can see and do." />
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">Online Booking</h4>
          <p className="text-sm text-slate-500">Allow clients to request reservations.</p>
        </div>
        <Switch checked={true} onCheckedChange={()=>{}} />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">Online Payments</h4>
          <p className="text-sm text-slate-500">Accept credit card payments via portal.</p>
        </div>
        <Switch checked={true} onCheckedChange={()=>{}} />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">Photo Gallery</h4>
          <p className="text-sm text-slate-500">Show pet photos to owners.</p>
        </div>
        <Switch checked={true} onCheckedChange={()=>{}} />
      </div>
      <div>
        <Label>Portal Announcement</Label>
        <Textarea defaultValue="Welcome to our new portal!" />
      </div>
      <div className="pt-4 flex justify-end">
        <Button>Save Settings</Button>
      </div>
    </Card>
  </div>
);

const UserAccountsView = () => (
  <div>
    <SectionHeader title="User Accounts" description="Manage staff access." action={<Button className="gap-2"><Plus size={16}/> Add User</Button>} />
    <Card className="overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Last Login</th>
            <th className="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {MOCK_USERS.map(user => (
            <tr key={user.id}>
              <td className="px-6 py-4 font-medium">{user.name}</td>
              <td className="px-6 py-4"><Badge variant="outline">{user.role}</Badge></td>
              <td className="px-6 py-4"><Badge variant={user.status === 'Active' ? 'success' : 'default'}>{user.status}</Badge></td>
              <td className="px-6 py-4 text-slate-500">{user.lastLogin}</td>
              <td className="px-6 py-4 text-right"><Button variant="ghost" size="sm">Edit</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

const PermissionsView = () => (
  <div>
    <SectionHeader title="Roles & Permissions" description="Configure access levels." />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {['Admin', 'Manager', 'Staff'].map(role => (
        <Card key={role} className="p-4">
          <h4 className="font-bold text-slate-800 mb-2">{role}</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2"><Check size={14} className="text-green-500"/> <span className="text-sm">View Dashboard</span></div>
            <div className="flex items-center gap-2"><Check size={14} className="text-green-500"/> <span className="text-sm">Manage Reservations</span></div>
            {role !== 'Staff' && <div className="flex items-center gap-2"><Check size={14} className="text-green-500"/> <span className="text-sm">View Financials</span></div>}
            {role === 'Admin' && <div className="flex items-center gap-2"><Check size={14} className="text-green-500"/> <span className="text-sm">System Settings</span></div>}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4">Edit Perms</Button>
        </Card>
      ))}
    </div>
  </div>
);

const StaffRatiosView = () => (
  <div className="max-w-2xl">
    <SectionHeader title="Staff Ratios" description="Safety thresholds for scheduling." />
    <Card className="p-6 space-y-4">
      {['Daycare (Dogs per Staff)', 'Boarding (Dogs per Staff)', 'Training (Dogs per Trainer)'].map(setting => (
        <div key={setting} className="flex justify-between items-center">
          <Label className="mb-0">{setting}</Label>
          <Input type="number" defaultValue="15" className="w-24 text-center" />
        </div>
      ))}
      <div className="pt-4 flex justify-end">
        <Button>Save Ratios</Button>
      </div>
    </Card>
  </div>
);

const AuditLogView = () => (
  <div>
    <SectionHeader title="Audit Logs" description="System activity tracking." />
    <Card className="overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3">Time</th>
            <th className="px-6 py-3">User</th>
            <th className="px-6 py-3">Action</th>
            <th className="px-6 py-3">Target</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {MOCK_AUDIT_LOGS.map(log => (
            <tr key={log.id}>
              <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
              <td className="px-6 py-4 font-medium">{log.actor}</td>
              <td className="px-6 py-4">{log.action}</td>
              <td className="px-6 py-4 text-slate-600">{log.target}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

const TimeClockSettingsView = () => (
  <div className="max-w-xl">
    <SectionHeader title="Time Clock" description="Attendance tracking configuration." />
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h4 className="font-bold text-slate-800">Enable Time Clock</h4></div>
        <Switch checked={true} onCheckedChange={()=>{}} />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800">Geofencing</h4>
          <p className="text-sm text-slate-500">Require staff to be on-site.</p>
        </div>
        <Switch checked={true} onCheckedChange={()=>{}} />
      </div>
      <div><Label>Auto-Clock Out (Hours)</Label><Input type="number" defaultValue="12" /></div>
      <div className="pt-4 flex justify-end"><Button>Save Settings</Button></div>
    </Card>
  </div>
);

const FacilityView = () => (
  <div className="max-w-2xl">
    <SectionHeader title="Facility Info" description="Basic business details." />
    <Card className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Business Name</Label><Input defaultValue="Partners Dogs" /></div>
        <div><Label>Phone</Label><Input defaultValue="(555) 123-4567" /></div>
        <div><Label>Email</Label><Input defaultValue="info@partnersdogs.com" /></div>
        <div><Label>Website</Label><Input defaultValue="partnersdogs.com" /></div>
      </div>
      <div><Label>Address</Label><Input defaultValue="123 Canine Lane, Phoenix, AZ 85001" /></div>
      <div className="pt-4 flex justify-end"><Button>Save Info</Button></div>
    </Card>
  </div>
);

const IntakeFormsView = () => (
  <div>
    <SectionHeader title="Form Builder" description="Create and manage digital forms." action={<Button className="gap-2"><Plus size={16}/> New Form</Button>} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {['New Client Intake', 'Liability Waiver', 'Boarding Agreement', 'Incident Report'].map(form => (
        <Card key={form} className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded text-slate-600"><FileText size={16}/></div>
            <span className="font-bold text-slate-800">{form}</span>
          </div>
          <Button variant="ghost" size="sm">Edit</Button>
        </Card>
      ))}
    </div>
  </div>
);

const BrandingView = () => (
  <div className="max-w-xl">
    <SectionHeader title="Branding" description="Customize look and feel." />
    <Card className="p-6 space-y-6">
      <div>
        <Label>Primary Color</Label>
        <div className="flex gap-2">
          {['#0ea5e9', '#7c3aed', '#10b981', '#f43f5e', '#f59e0b'].map(c => (
            <div key={c} className="w-8 h-8 rounded-full cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-slate-300" style={{ backgroundColor: c }}></div>
          ))}
        </div>
      </div>
      <div>
        <Label>Logo</Label>
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-slate-400">
          <UploadCloud size={24} className="mb-2"/>
          <span className="text-xs">Upload Logo</span>
        </div>
      </div>
      <div className="pt-4 flex justify-end"><Button>Save Theme</Button></div>
    </Card>
  </div>
);

const DataToolsView = () => (
  <div className="max-w-xl">
    <SectionHeader title="Data Tools" description="Import/Export system data." />
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-6 text-center hover:bg-slate-50 cursor-pointer">
        <Download size={32} className="mx-auto mb-2 text-slate-400"/>
        <h4 className="font-bold text-slate-800">Export All Data</h4>
        <p className="text-xs text-slate-500 mt-1">JSON / CSV</p>
      </Card>
      <Card className="p-6 text-center hover:bg-slate-50 cursor-pointer">
        <UploadCloud size={32} className="mx-auto mb-2 text-slate-400"/>
        <h4 className="font-bold text-slate-800">Import Data</h4>
        <p className="text-xs text-slate-500 mt-1">Restore from backup</p>
      </Card>
    </div>
  </div>
);

const ADMIN_CATEGORIES = [
   { 
      id: 'ops', 
      label: 'Operations', 
      icon: CalendarRange,
      items: [
         { id: 'services', label: 'Reservation Types', view: <ReservationTypesView /> },
         { id: 'lodging', label: 'Lodging & Units', view: <LodgingUnitsView /> },
         { id: 'addons', label: 'Add-ons & Retail', view: <AddonsRetailView /> },
         { id: 'packages', label: 'Packages & Memberships', view: <PackagesMembershipsView /> },
      ]
   },
   { 
      id: 'finance', 
      label: 'Financials', 
      icon: DollarSign,
      items: [
         { id: 'pricing', label: 'Pricing Rules', view: <PricingRulesView /> },
         { id: 'tax', label: 'Tax Settings', view: <TaxSettingsView /> },
         { id: 'invoices', label: 'Invoice Configuration', view: <InvoiceConfigView /> },
         { id: 'usage', label: 'Usage & Quotas', view: <UsageQuotasView /> },
      ]
   },
   {
      id: 'health',
      label: 'Health & Vet',
      icon: Stethoscope,
      items: [
         { id: 'vaccines', label: 'Vaccination Requirements', view: <HealthSettingsView /> },
         { id: 'hospitals', label: 'Veterinary Hospitals', view: <VetHospitalSettingsView /> },
      ]
   },
   { 
      id: 'comm', 
      label: 'Communications', 
      icon: Mail,
      items: [
         { id: 'templates', label: 'Email/SMS Templates', view: <CommunicationsView /> },
         { id: 'auto', label: 'Automations', view: <AutomationsView /> },
         { id: 'portal', label: 'Customer Portal', view: <PortalSettingsView /> },
      ]
   },
   { 
      id: 'staff', 
      label: 'Team', 
      icon: Users,
      items: [
         { id: 'users', label: 'User Accounts', view: <UserAccountsView /> },
         { id: 'roles', label: 'Group Permissions', view: <PermissionsView /> },
         { id: 'ratios', label: 'Staff Ratios & Capacity', view: <StaffRatiosView /> },
         { id: 'audit', label: 'Audit Logs', view: <AuditLogView /> },
         { id: 'time', label: 'Time Clock Settings', view: <TimeClockSettingsView /> },
      ]
   },
   { 
      id: 'system', 
      label: 'System', 
      icon: Settings,
      items: [
         { id: 'facility', label: 'Facility Info', view: <FacilityView /> },
         { id: 'forms', label: 'Form Builder', view: <IntakeFormsView /> }, 
         { id: 'branding', label: 'Branding & Appearance', view: <BrandingView /> },
         { id: 'data', label: 'Data Import/Export', view: <DataToolsView /> },
      ]
   },
];

export const Admin = () => {
   const [activeCategory, setActiveCategory] = useState('ops');
   const [activePage, setActivePage] = useState('services');
   const [searchTerm, setSearchTerm] = useState('');

   const currentCategory = ADMIN_CATEGORIES.find(c => c.id === activeCategory);
   const currentPage = currentCategory?.items.find(i => i.id === activePage) || currentCategory?.items[0];

   return (
      <div className="flex h-[calc(100vh-100px)] bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
         {/* Admin Sidebar */}
         <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200">
               <div className="relative">
                  <SearchInput 
                     placeholder="Search settings..." 
                     className="pl-8 bg-white" 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto py-2">
               {ADMIN_CATEGORIES.map(cat => (
                  <div key={cat.id} className="mb-2">
                     <div 
                        className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"
                     >
                        <cat.icon size={12} />
                        {cat.label}
                     </div>
                     <div className="space-y-0.5">
                        {cat.items.map(item => (
                           <button
                              key={item.id}
                              onClick={() => {
                                 setActiveCategory(cat.id);
                                 setActivePage(item.id);
                              }}
                              className={cn(
                                 "w-full text-left px-8 py-2 text-sm font-medium border-l-2 transition-colors",
                                 activePage === item.id 
                                    ? "border-primary-500 text-primary-700 bg-primary-50" 
                                    : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              )}
                           >
                              {item.label}
                           </button>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-100">
               <div className="text-xs text-slate-500 text-center">
                  Partner Dogs Ops v2.4.0
               </div>
            </div>
         </div>

         {/* Admin Main Content */}
         <div className="flex-1 overflow-y-auto bg-white flex flex-col">
            {/* Header */}
            <div className="h-16 border-b border-slate-100 flex items-center px-8 shrink-0">
               <nav className="flex items-center text-sm text-slate-500">
                  <span className="hover:text-slate-900 cursor-pointer flex items-center gap-1">
                     <Settings size={14}/> Admin
                  </span>
                  <ChevronRight size={14} className="mx-2" />
                  <span className="hover:text-slate-900 cursor-pointer">{currentCategory?.label}</span>
                  <ChevronRight size={14} className="mx-2" />
                  <span className="font-semibold text-slate-900">{currentPage?.label}</span>
               </nav>
            </div>

            {/* Content Body */}
            <div className="p-8 max-w-6xl">
               {currentPage?.view ? currentPage.view : (
                  <EmptyState title="Configuration Coming Soon" message={`The settings for ${currentPage?.label} are under development.`} />
               )}
            </div>
         </div>
      </div>
   );
};