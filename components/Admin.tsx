
import React, { useState } from 'react';
import { 
  Settings, Shield, CreditCard, Bell, Database, Search, 
  ChevronRight, Sparkles, Building2, CalendarRange, 
  Users, FileText, Dog, Mail, DollarSign, Clock, LayoutGrid,
  CheckCircle, AlertCircle, Trash2, Edit2, Plus, GripVertical, Activity,
  Package as PackageIcon, Crown, Check, Save, Calculator, MessageSquare, Phone
} from 'lucide-react';
import { Card, Button, Input, Switch, Select, Label, Textarea, cn, Badge, Tabs, Modal } from './Common';
import { 
  MOCK_SERVICE_CONFIGS, MOCK_PRICING_RULES, MOCK_EMAIL_TEMPLATES, 
  MOCK_UNITS, MOCK_TAX_RATES, MOCK_USERS, MOCK_AUTOMATIONS, MOCK_AUDIT_LOGS,
  MOCK_PACKAGES, MOCK_MEMBERSHIPS
} from '../constants';
import { ServiceType, Package, Membership, MembershipBenefit, CommunicationTemplate } from '../types';

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

// --- Staff Ratios View ---

interface StaffRatio {
  serviceType: string;
  ratio: number;
  currentCount: number;
}

const StaffRatiosView = () => {
  const [ratios, setRatios] = useState<StaffRatio[]>([
    { serviceType: 'Daycare', ratio: 15, currentCount: 42 },
    { serviceType: 'Boarding', ratio: 20, currentCount: 28 },
    { serviceType: 'Training', ratio: 8, currentCount: 12 },
  ]);

  const handleRatioChange = (index: number, val: string) => {
    const newRatios = [...ratios];
    newRatios[index].ratio = parseInt(val) || 1;
    setRatios(newRatios);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader 
        title="Staffing Ratios & Capacity" 
        description="Define safety standards for staff-to-dog ratios to drive scheduling requirements."
        action={<Button onClick={() => alert('Settings Saved')} className="gap-2"><Save size={16}/> Save Configuration</Button>}
      />

      <div className="grid grid-cols-1 gap-6">
        {ratios.map((ratio, index) => {
           const recommendedStaff = Math.ceil(ratio.currentCount / ratio.ratio);
           return (
            <Card key={index} className="p-6 border-l-4 border-l-primary-500">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    {ratio.serviceType}
                    <Badge variant="outline" className="text-xs font-normal">Active</Badge>
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Current Occupancy: <strong>{ratio.currentCount} dogs</strong>
                  </p>
                </div>
                <div className="flex flex-col items-end text-right">
                   <span className="text-3xl font-bold text-slate-900">{recommendedStaff}</span>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Staff Required</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-2">
                  <Label>Max Dogs Per Staff Member</Label>
                  <div className="flex gap-2 items-center">
                    <Input 
                      type="number" 
                      value={ratio.ratio} 
                      onChange={(e) => handleRatioChange(index, e.target.value)} 
                      className="w-24 text-lg font-bold text-center"
                    />
                    <span className="text-sm text-slate-500">dogs / person</span>
                  </div>
                  <p className="text-xs text-slate-400">Lowering this number increases safety but requires more staff.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                   <div className="flex items-start gap-3">
                      <div className="bg-white p-2 rounded-full border border-slate-200 shadow-sm text-primary-600">
                        <Calculator size={18}/>
                      </div>
                      <div className="text-sm text-slate-600">
                        <p className="font-medium text-slate-900 mb-1">Impact Analysis</p>
                        With <strong>{ratio.currentCount}</strong> dogs, a ratio of <strong>1:{ratio.ratio}</strong> requires <strong>{recommendedStaff}</strong> staff members on the floor.
                      </div>
                   </div>
                </div>
              </div>
            </Card>
           );
        })}
      </div>
    </div>
  );
};

// --- Packages & Memberships Modals ---

const PackageModal = ({ isOpen, onClose, pkg }: { isOpen: boolean, onClose: () => void, pkg?: Package | null }) => {
  const [activeTab, setActiveTab] = useState('details');
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={pkg ? "Edit Package" : "Create Package"} size="lg">
      <div className="flex flex-col h-[500px]">
        <div className="px-6 -mx-6 border-b border-slate-200 mb-6">
           <Tabs 
              activeTab={activeTab} 
              onChange={setActiveTab}
              tabs={[
                 { id: 'details', label: 'Details' },
                 { id: 'credits', label: 'Credits' },
                 { id: 'financial', label: 'Financial' }
              ]}
           />
        </div>

        <div className="flex-1 overflow-y-auto">
           {activeTab === 'details' && (
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div><Label>Package Name</Label><Input defaultValue={pkg?.name} placeholder="e.g. 5 Day Daycare Pass" /></div>
                    <div><Label>Internal Name</Label><Input defaultValue={pkg?.internalName} placeholder="Daycare 5-Pack" /></div>
                 </div>
                 <div><Label>Description</Label><Textarea defaultValue={pkg?.description} placeholder="Description visible to customers..." /></div>
                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded border border-slate-200">
                    <div>
                       <div className="font-bold text-slate-800">Status</div>
                       <div className="text-xs text-slate-500">Available for purchase</div>
                    </div>
                    <Switch checked={pkg?.active ?? true} onCheckedChange={()=>{}} />
                 </div>
              </div>
           )}

           {activeTab === 'credits' && (
              <div className="space-y-6">
                 <div className="bg-blue-50 p-4 rounded border border-blue-100">
                    <h4 className="font-bold text-blue-900 text-sm mb-1">Credit Configuration</h4>
                    <p className="text-xs text-blue-700">Define what service this package grants access to and how many units.</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <Label>Target Service</Label>
                       <Select defaultValue={pkg?.serviceTypeTarget}>
                          {Object.values(ServiceType).map(t => <option key={t}>{t}</option>)}
                       </Select>
                    </div>
                    <div>
                       <Label>Quantity (Credits)</Label>
                       <Input type="number" defaultValue={pkg?.creditQuantity} placeholder="e.g. 5" />
                    </div>
                 </div>
                 <div>
                    <Label>Expiration</Label>
                    <div className="flex gap-2 items-center">
                       <Input type="number" defaultValue={pkg?.expiryDays} placeholder="Days" className="w-32" />
                       <span className="text-sm text-slate-500">days after purchase</span>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'financial' && (
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div><Label>Price ($)</Label><Input type="number" defaultValue={pkg?.price} prefix="$" /></div>
                    <div><Label>Tax Code</Label><Select><option>Standard Service Tax</option><option>Tax Exempt</option></Select></div>
                 </div>
                 <div className="border-t border-slate-100 pt-4">
                    <Label>Cost Allocation</Label>
                    <p className="text-xs text-slate-500 mb-2">How should revenue be recognized per redeemed credit?</p>
                    <div className="p-3 bg-slate-50 rounded text-sm font-mono flex justify-between items-center">
                       <span>Per Credit Value:</span>
                       <span className="font-bold">${((pkg?.price || 0) / (pkg?.creditQuantity || 1)).toFixed(2)}</span>
                    </div>
                 </div>
              </div>
           )}
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-between mt-4">
           {pkg && <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 size={16}/> Delete</Button>}
           <div className="flex gap-2 ml-auto">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={onClose}>Save Package</Button>
           </div>
        </div>
      </div>
    </Modal>
  );
};

const MembershipModal = ({ isOpen, onClose, mem }: { isOpen: boolean, onClose: () => void, mem?: Membership | null }) => {
   const [activeTab, setActiveTab] = useState('details');
   const [benefits, setBenefits] = useState<MembershipBenefit[]>(mem?.benefits || []);

   const addBenefit = () => {
      setBenefits([...benefits, { id: `new-${Date.now()}`, type: 'Discount', targetService: ServiceType.Boarding, value: 10 }]);
   };

   const removeBenefit = (id: string) => {
      setBenefits(benefits.filter(b => b.id !== id));
   };

   return (
      <Modal isOpen={isOpen} onClose={onClose} title={mem ? "Edit Membership" : "Create Membership"} size="lg">
         <div className="flex flex-col h-[600px]">
            <div className="px-6 -mx-6 border-b border-slate-200 mb-6">
               <Tabs 
                  activeTab={activeTab} 
                  onChange={setActiveTab}
                  tabs={[
                     { id: 'details', label: 'Details' },
                     { id: 'benefits', label: 'Benefits & Credits' },
                     { id: 'financial', label: 'Financial' }
                  ]}
               />
            </div>

            <div className="flex-1 overflow-y-auto">
               {activeTab === 'details' && (
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div><Label>Membership Name</Label><Input defaultValue={mem?.name} placeholder="e.g. VIP Club" /></div>
                        <div><Label>Billing Frequency</Label><Select defaultValue={mem?.billingFrequency}><option>Monthly</option><option>Yearly</option></Select></div>
                     </div>
                     <div><Label>Description</Label><Textarea defaultValue={mem?.description} className="h-24" /></div>
                     
                     <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-4">
                        <h4 className="font-bold text-slate-800 text-sm">Portal Settings</h4>
                        <div className="flex justify-between items-center">
                           <span className="text-sm text-slate-600">Enabled on Pet Parent Portal</span>
                           <Switch checked={true} onCheckedChange={()=>{}} />
                        </div>
                        <div>
                           <Label>Terms & Conditions (PDF)</Label>
                           <div className="border-2 border-dashed border-slate-300 rounded p-4 text-center text-xs text-slate-500 cursor-pointer hover:bg-white transition-colors">
                              Click to upload agreement PDF
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeTab === 'benefits' && (
                  <div className="space-y-4">
                     <div className="flex justify-between items-center mb-2">
                        <Label>Membership Benefits</Label>
                        <Button size="sm" variant="outline" onClick={addBenefit} className="gap-2"><Plus size={14}/> Add Benefit</Button>
                     </div>
                     
                     <div className="space-y-3">
                        {benefits.map((benefit, i) => (
                           <div key={benefit.id} className="p-3 border border-slate-200 rounded-lg flex items-center gap-3 bg-slate-50 animate-in fade-in slide-in-from-left-4">
                              <div className="bg-white p-2 rounded border border-slate-200 shrink-0">
                                 {benefit.type === 'Discount' ? <PercentIcon size={16} className="text-green-600"/> : <TicketIcon size={16} className="text-blue-600"/>}
                              </div>
                              <div className="grid grid-cols-3 gap-2 flex-1">
                                 <Select className="h-8 text-xs" defaultValue={benefit.type}>
                                    <option value="Discount">Discount (%)</option>
                                    <option value="Credit">Free Credit (Qty)</option>
                                 </Select>
                                 <Select className="h-8 text-xs" defaultValue={benefit.targetService}>
                                    <option value="All">All Services</option>
                                    {Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
                                    <option value="Retail">Retail</option>
                                 </Select>
                                 <div className="relative">
                                    <Input 
                                       type="number" 
                                       className="h-8 text-xs pr-8" 
                                       defaultValue={benefit.value} 
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                       {benefit.type === 'Discount' ? '%' : 'qty'}
                                    </span>
                                 </div>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeBenefit(benefit.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></Button>
                           </div>
                        ))}
                        {benefits.length === 0 && <div className="text-center p-8 text-slate-400 italic border-2 border-dashed border-slate-100 rounded-lg">No benefits configured. Add discounts or credits.</div>}
                     </div>
                  </div>
               )}

               {activeTab === 'financial' && (
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div><Label>Recurring Price ($)</Label><Input type="number" defaultValue={mem?.price} prefix="$" /></div>
                        <div><Label>Billing Day</Label><Select><option>Date of Sale</option><option>1st of Month</option></Select></div>
                     </div>
                     <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" id="taxable" className="rounded border-slate-300" defaultChecked />
                        <label htmlFor="taxable" className="text-sm text-slate-700">Membership Fee is Taxable</label>
                     </div>
                  </div>
               )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between mt-4">
               {mem && <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 size={16}/> Delete</Button>}
               <div className="flex gap-2 ml-auto">
                  <Button variant="ghost" onClick={onClose}>Cancel</Button>
                  <Button onClick={onClose}>Save Membership</Button>
               </div>
            </div>
         </div>
      </Modal>
   );
};

// --- Icons for internal use ---
const PercentIcon = ({ size, className }: { size: number, className?: string }) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>
);
const TicketIcon = ({ size, className }: { size: number, className?: string }) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>
);

// --- Sub-Components for Admin Views ---

const PackagesMembershipsView = () => {
   const [activeTab, setActiveTab] = useState('packages');
   const [editPackage, setEditPackage] = useState<Package | null | undefined>(undefined); // undefined = closed, null = create
   const [editMembership, setEditMembership] = useState<Membership | null | undefined>(undefined);

   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <SectionHeader 
            title="Packages & Memberships" 
            description="Manage prepaid credits and recurring subscription plans." 
            action={
               <div className="flex gap-2">
                  <Button onClick={() => activeTab === 'packages' ? setEditPackage(null) : setEditMembership(null)} className="gap-2">
                     <Plus size={16}/> New {activeTab === 'packages' ? 'Package' : 'Membership'}
                  </Button>
               </div>
            }
         />

         <div className="bg-slate-100 p-1 rounded-lg inline-flex mb-4">
            <button 
               onClick={() => setActiveTab('packages')} 
               className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2", activeTab === 'packages' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}
            >
               <PackageIcon size={16}/> Packages (Prepaid)
            </button>
            <button 
               onClick={() => setActiveTab('memberships')} 
               className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2", activeTab === 'memberships' ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}
            >
               <Crown size={16}/> Memberships (Recurring)
            </button>
         </div>

         {activeTab === 'packages' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {MOCK_PACKAGES.map(pkg => (
                  <Card key={pkg.id} className="flex flex-col overflow-hidden hover:shadow-md transition-all cursor-pointer group" onClick={() => setEditPackage(pkg)}>
                     <div className="p-4 flex-1">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{pkg.name}</h3>
                           <Badge variant={pkg.active ? 'success' : 'default'}>{pkg.active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-4">{pkg.description}</p>
                        <div className="bg-slate-50 rounded p-2 text-xs border border-slate-100 space-y-1">
                           <div className="flex justify-between"><span>Credits:</span> <strong>{pkg.creditQuantity} x {pkg.serviceTypeTarget}</strong></div>
                           <div className="flex justify-between"><span>Expires:</span> <span>{pkg.expiryDays ? `${pkg.expiryDays} days` : 'Never'}</span></div>
                        </div>
                     </div>
                     <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                        <span className="font-bold text-lg text-slate-800">${pkg.price}</span>
                        <Button size="sm" variant="ghost" className="h-6 text-xs">Edit</Button>
                     </div>
                  </Card>
               ))}
            </div>
         )}

         {activeTab === 'memberships' && (
            <div className="space-y-4">
               {MOCK_MEMBERSHIPS.map(mem => (
                  <Card key={mem.id} className="p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group" onClick={() => setEditMembership(mem)}>
                     <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                           <Crown size={24}/>
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary-600 transition-colors flex items-center gap-2">
                              {mem.name}
                              {!mem.active && <Badge>Inactive</Badge>}
                           </h3>
                           <div className="text-sm text-slate-500 mt-1 flex items-center gap-3">
                              <span className="flex items-center gap-1"><Clock size={14}/> {mem.billingFrequency}</span>
                              <span>•</span>
                              <span>{mem.benefits.length} Benefits Configured</span>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-6">
                        <div className="text-right">
                           <div className="text-2xl font-bold text-slate-900">${mem.price}</div>
                           <div className="text-xs text-slate-400">per {mem.billingFrequency === 'Monthly' ? 'month' : 'year'}</div>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-600"/>
                     </div>
                  </Card>
               ))}
            </div>
         )}

         {/* Modals */}
         {editPackage !== undefined && (
            <PackageModal 
               isOpen={true} 
               onClose={() => setEditPackage(undefined)} 
               pkg={editPackage} 
            />
         )}
         {editMembership !== undefined && (
            <MembershipModal
               isOpen={true}
               onClose={() => setEditMembership(undefined)}
               mem={editMembership}
            />
         )}
      </div>
   );
};

const AuditLogView = () => (
   <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader title="Audit Logs" description="Track system changes and sensitive actions." />
      <Card className="overflow-hidden">
         <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
               <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Actor</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Target</th>
                  <th className="px-6 py-3">Details</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {MOCK_AUDIT_LOGS.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                     <td className="px-6 py-4 text-slate-500 font-mono text-xs">{log.timestamp}</td>
                     <td className="px-6 py-4 font-medium">{log.actor}</td>
                     <td className="px-6 py-4"><Badge variant="outline">{log.action}</Badge></td>
                     <td className="px-6 py-4 text-slate-700">{log.target}</td>
                     <td className="px-6 py-4 text-slate-500">{log.details}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </Card>
   </div>
);

const UsageQuotasView = () => (
   <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader title="Usage & Quotas" description="Monitor platform resource consumption." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Workflow Runs</h3>
            <div className="text-2xl font-bold text-slate-900">4,123 <span className="text-sm font-normal text-slate-400">/ 10,000</span></div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
               <div className="bg-blue-500 h-full w-[41%]"></div>
            </div>
         </Card>
         <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">SMS Messages</h3>
            <div className="text-2xl font-bold text-slate-900">850 <span className="text-sm font-normal text-slate-400">/ 1,000</span></div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
               <div className="bg-yellow-500 h-full w-[85%]"></div>
            </div>
         </Card>
         <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Storage</h3>
            <div className="text-2xl font-bold text-slate-900">2.1 GB <span className="text-sm font-normal text-slate-400">/ 5 GB</span></div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
               <div className="bg-green-500 h-full w-[42%]"></div>
            </div>
         </Card>
      </div>
   </div>
);

const ReservationTypesView = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
       <SectionHeader 
         title="Reservation Types & Services" 
         description="Configure standard boarding, daycare, and grooming options."
         action={<Button className="gap-2"><Plus size={16}/> New Service</Button>}
       />

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_SERVICE_CONFIGS.map(service => (
             <Card key={service.id} className="overflow-hidden border-t-4" style={{ borderTopColor: service.color }}>
                <div className="p-4">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800">{service.name}</h3>
                      <Switch checked={service.enabled} onCheckedChange={() => {}} />
                   </div>
                   <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-bold text-slate-900">${service.baseRate}</span>
                      <span className="text-slate-500 text-sm">/ {service.unitType.toLowerCase()}</span>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-xs uppercase text-slate-400">Settings</Label>
                      <div className="flex gap-2">
                         <Badge variant="outline" className="bg-slate-50">Business Hours Only</Badge>
                         <Badge variant="outline" className="bg-slate-50">Online Booking</Badge>
                      </div>
                   </div>
                </div>
                <div className="bg-slate-50 p-3 border-t border-slate-100 flex justify-between items-center">
                   <Button variant="ghost" size="sm" className="text-xs">Edit Rules</Button>
                   <Button variant="secondary" size="sm" className="text-xs">Configure Rates</Button>
                </div>
             </Card>
          ))}
       </div>
    </div>
  );
};

const LodgingUnitsView = () => {
   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <SectionHeader 
            title="Lodging & Units" 
            description="Manage physical assets, kennels, suites, and capacity."
            action={<Button className="gap-2"><Plus size={16}/> Add Unit</Button>}
         />
         
         <Card className="overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                     <th className="px-6 py-3">Unit Name</th>
                     <th className="px-6 py-3">Type</th>
                     <th className="px-6 py-3">Size</th>
                     <th className="px-6 py-3">Status</th>
                     <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {MOCK_UNITS.map(unit => (
                     <tr key={unit.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-medium text-slate-800">{unit.name}</td>
                        <td className="px-6 py-4"><Badge variant="outline">{unit.type}</Badge></td>
                        <td className="px-6 py-4 text-slate-600">{unit.size}</td>
                        <td className="px-6 py-4">
                           <Badge variant={unit.status === 'Active' ? 'success' : 'warning'}>{unit.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <Button variant="ghost" size="icon"><Edit2 size={16} className="text-slate-400"/></Button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Card>
      </div>
   );
};

const AddonsRetailView = () => {
   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <SectionHeader 
            title="Add-ons & Retail" 
            description="Manage inventory, pricing, and service add-ons."
            action={<Button className="gap-2"><Plus size={16}/> New Item</Button>}
         />

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CreditCard size={18}/> Retail Inventory</h3>
               <ul className="space-y-3">
                  {[
                     { name: 'Premium Kibble 5lb', price: 24.99, stock: 12 },
                     { name: 'Squeaky Toy', price: 8.50, stock: 45 },
                     { name: 'Training Treats', price: 12.00, stock: 8 },
                  ].map((item, i) => (
                     <li key={i} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100">
                        <div>
                           <div className="font-medium text-slate-800">{item.name}</div>
                           <div className="text-xs text-slate-500">{item.stock} in stock</div>
                        </div>
                        <div className="font-bold text-slate-700">${item.price.toFixed(2)}</div>
                     </li>
                  ))}
               </ul>
            </Card>
             <Card className="p-4">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Sparkles size={18}/> Service Add-ons</h3>
               <ul className="space-y-3">
                  {[
                     { name: 'Exit Bath', price: 30.00, duration: '30m' },
                     { name: 'Nail Trim', price: 15.00, duration: '15m' },
                     { name: 'Nature Walk', price: 20.00, duration: '20m' },
                     { name: 'Treat Puzzle', price: 10.00, duration: '10m' },
                  ].map((item, i) => (
                     <li key={i} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100">
                        <div>
                           <div className="font-medium text-slate-800">{item.name}</div>
                           <div className="text-xs text-slate-500">{item.duration} duration</div>
                        </div>
                        <div className="font-bold text-slate-700">${item.price.toFixed(2)}</div>
                     </li>
                  ))}
               </ul>
            </Card>
         </div>
      </div>
   );
};

const PricingRulesView = () => {
   return (
    <div className="space-y-6 animate-in fade-in duration-300">
       <SectionHeader 
         title="Pricing Rules" 
         description="Manage automated surcharges, discounts, and holiday rates."
         action={
            <div className="flex gap-2">
               <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"><Sparkles size={16}/> Suggest Rule</Button>
               <Button className="gap-2"><Plus size={16}/> New Rule</Button>
            </div>
         }
       />

       <Card className="overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                   <th className="px-6 py-3">Rule Name</th>
                   <th className="px-6 py-3">Type</th>
                   <th className="px-6 py-3">Trigger</th>
                   <th className="px-6 py-3">Amount</th>
                   <th className="px-6 py-3 text-right">Status</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {MOCK_PRICING_RULES.map(rule => (
                   <tr key={rule.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-800">{rule.name}</td>
                      <td className="px-6 py-4"><Badge variant="outline">{rule.type}</Badge></td>
                      <td className="px-6 py-4 text-sm text-slate-600">{rule.triggerCondition}</td>
                      <td className="px-6 py-4 font-mono font-medium">
                         {rule.isPercentage ? `${rule.amount}%` : `$${rule.amount.toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <Switch checked={rule.enabled} onCheckedChange={() => {}} />
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       </Card>
    </div>
   );
};

const TaxSettingsView = () => {
   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <SectionHeader 
            title="Tax Configuration" 
            description="Manage tax rates for services and retail products."
            action={<Button className="gap-2"><Plus size={16}/> Add Tax Rate</Button>}
         />
         
         <div className="grid grid-cols-1 gap-4">
            {MOCK_TAX_RATES.map(rate => (
               <Card key={rate.id} className="p-4 flex items-center justify-between">
                  <div>
                     <div className="flex items-center gap-3">
                        <h3 className="font-bold text-slate-900">{rate.name}</h3>
                        <Badge variant="info">{rate.rate}%</Badge>
                     </div>
                     <div className="text-sm text-slate-500 mt-1">
                        Applies to: {rate.appliesToServices && 'Services'} {rate.appliesToProducts && 'Products'}
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <Switch checked={true} onCheckedChange={() => {}} />
                     <Button variant="ghost" size="icon"><Trash2 size={16} className="text-red-400"/></Button>
                  </div>
               </Card>
            ))}
         </div>
      </div>
   );
};

const InvoiceConfigView = () => {
   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <SectionHeader title="Invoice Settings" description="Configure invoice appearance and terms." />
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
               <h3 className="font-bold text-slate-800">General Settings</h3>
               <div>
                  <Label>Invoice Number Prefix</Label>
                  <Input defaultValue="INV-" className="font-mono"/>
               </div>
               <div>
                  <Label>Default Due Date</Label>
                  <Select>
                     <option>Due on Receipt</option>
                     <option>Net 15</option>
                     <option>Net 30</option>
                  </Select>
               </div>
               <div>
                  <Label>Footer Text / Memo</Label>
                  <Textarea defaultValue="Thank you for your business! Please pay within 30 days." />
               </div>
            </Card>
            <Card className="p-6 space-y-4 bg-slate-50">
               <h3 className="font-bold text-slate-800">Preview</h3>
               <div className="bg-white border border-slate-200 p-8 shadow-sm text-xs space-y-4">
                  <div className="flex justify-between">
                     <div className="font-bold text-xl">INVOICE</div>
                     <div className="text-slate-500">#INV-1023</div>
                  </div>
                  <div className="border-b border-slate-100 pb-2">
                     <div className="font-bold">Partners Dog Training</div>
                     <div>123 Dogwood Lane</div>
                  </div>
                  <div className="py-4 text-center text-slate-400 italic">Line items will appear here</div>
                  <div className="border-t border-slate-100 pt-2 text-slate-500">
                     Thank you for your business! Please pay within 30 days.
                  </div>
               </div>
            </Card>
         </div>
      </div>
   );
};

const CommunicationsView = () => {
   const [activeTab, setActiveTab] = useState<'Reservation' | 'Financial' | 'Health' | 'Operations' | 'Marketing'>('Reservation');
   const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);

   const categories = ['Reservation', 'Financial', 'Health', 'Operations', 'Marketing'];
   const filteredTemplates = MOCK_EMAIL_TEMPLATES.filter(t => t.category === activeTab);

   return (
    <div className="space-y-6 animate-in fade-in duration-300">
       <SectionHeader title="Email & SMS Templates" description="Customize automated notifications sent to customers." />

       <div className="bg-slate-100 p-1 rounded-lg inline-flex mb-4">
          {categories.map(cat => (
             <button
               key={cat}
               onClick={() => { setActiveTab(cat as any); setSelectedTemplate(null); }}
               className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all", activeTab === cat ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700")}
             >
                {cat}
             </button>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 p-0 flex flex-col h-[500px] overflow-hidden">
             <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Templates</h3>
             </div>
             <div className="flex-1 overflow-y-auto">
                {filteredTemplates.map(template => (
                   <div 
                     key={template.id} 
                     onClick={() => setSelectedTemplate(template)}
                     className={cn(
                        "p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors",
                        selectedTemplate?.id === template.id ? "bg-blue-50 border-l-4 border-l-blue-500" : "border-l-4 border-l-transparent"
                     )}
                   >
                      <div className="flex justify-between items-start mb-1">
                         <div className="font-medium text-slate-900 text-sm">{template.name}</div>
                         {template.type === 'SMS' ? <MessageSquare size={14} className="text-green-600"/> : <Mail size={14} className="text-blue-600"/>}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                         <Sparkles size={10} className="text-indigo-500"/> {template.trigger}
                      </div>
                   </div>
                ))}
             </div>
             <div className="p-3 border-t border-slate-100">
               <Button variant="ghost" className="w-full justify-center text-slate-500 gap-2"><Plus size={14}/> Add Template</Button>
             </div>
          </Card>

          <Card className="lg:col-span-2 p-6 flex flex-col h-[500px]">
             {selectedTemplate ? (
                <>
                   <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                      <div>
                         <h3 className="font-bold text-slate-800 text-lg">{selectedTemplate.name}</h3>
                         <div className="text-xs text-slate-500 mt-1">Trigger: {selectedTemplate.trigger}</div>
                      </div>
                      <div className="flex gap-2">
                         <Switch checked={selectedTemplate.active} onCheckedChange={() => {}} />
                         <span className="text-sm text-slate-600">Active</span>
                         <div className="w-px h-6 bg-slate-200 mx-2"></div>
                         <Button size="sm">Save Changes</Button>
                      </div>
                   </div>
                   
                   <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                      {selectedTemplate.type === 'Email' && (
                         <div>
                            <Label>Subject Line</Label>
                            <div className="flex gap-2">
                               <Input defaultValue={selectedTemplate.subject} />
                               <Button variant="outline" size="icon" title="Ask AI to rewrite"><Sparkles size={16} className="text-indigo-600"/></Button>
                            </div>
                         </div>
                      )}
                      <div>
                         <Label>{selectedTemplate.type} Body</Label>
                         <Textarea className="h-64 font-mono text-sm" defaultValue={selectedTemplate.body} />
                         {selectedTemplate.type === 'SMS' && <div className="text-xs text-slate-400 mt-1 text-right">~{selectedTemplate.body.length} characters</div>}
                      </div>
                      <div className="bg-slate-50 p-3 rounded text-xs text-slate-500 space-y-1 border border-slate-100">
                         <p className="font-bold text-slate-700">Available Variables:</p>
                         <div className="flex gap-2 flex-wrap">
                            {['{owner_name}', '{pet_name}', '{check_in_date}', '{check_out_date}', '{total_price}', '{invoice_link}', '{service_type}'].map(v => (
                               <code key={v} className="bg-white px-1 py-0.5 rounded border border-slate-200 text-indigo-600 cursor-pointer hover:bg-indigo-50">{v}</code>
                            ))}
                         </div>
                      </div>
                   </div>
                </>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                   <Mail size={48} className="opacity-20 mb-4"/>
                   <p>Select a template to edit</p>
                </div>
             )}
          </Card>
       </div>
    </div>
   );
};

const AutomationsView = () => {
   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <SectionHeader 
            title="Automations" 
            description="Set up automatic triggers for communications and tasks." 
            action={<Button className="gap-2"><Plus size={16}/> New Automation</Button>}
         />
         
         <div className="grid grid-cols-1 gap-4">
            {MOCK_AUTOMATIONS.map(rule => (
               <Card key={rule.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className={cn("p-2 rounded-full", rule.enabled ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400")}>
                        <Clock size={20}/>
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-900">{rule.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                           <Badge variant="outline" className="bg-slate-50">When: {rule.trigger}</Badge>
                           <span>→</span>
                           <Badge variant="outline" className="bg-slate-50">Do: {rule.action}</Badge>
                        </div>
                     </div>
                  </div>
                  <Switch checked={rule.enabled} onCheckedChange={() => {}} />
               </Card>
            ))}
         </div>
      </div>
   );
};

const UserAccountsView = () => {
   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <SectionHeader 
            title="User Accounts" 
            description="Manage staff access and profiles."
            action={<Button className="gap-2"><Plus size={16}/> Invite User</Button>}
         />

         <Card className="overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                     <th className="px-6 py-3">Name</th>
                     <th className="px-6 py-3">Role</th>
                     <th className="px-6 py-3">Status</th>
                     <th className="px-6 py-3">Last Login</th>
                     <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {MOCK_USERS.map(user => (
                     <tr key={user.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                 {user.name.split(' ').map(n=>n[0]).join('')}
                              </div>
                              <div>
                                 <div className="font-medium text-slate-900">{user.name}</div>
                                 <div className="text-xs text-slate-500">{user.email}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4"><Badge variant="outline">{user.role}</Badge></td>
                        <td className="px-6 py-4"><Badge variant={user.status === 'Active' ? 'success' : 'default'}>{user.status}</Badge></td>
                        <td className="px-6 py-4 text-sm text-slate-500">{user.lastLogin}</td>
                        <td className="px-6 py-4 text-right">
                           <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Card>
      </div>
   );
};

const PermissionsView = () => {
   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <SectionHeader title="Role Permissions" description="Configure what each role can see and do." />
         
         <Card className="overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                     <th className="px-6 py-3">Permission Area</th>
                     <th className="px-6 py-3 text-center">Admin</th>
                     <th className="px-6 py-3 text-center">Manager</th>
                     <th className="px-6 py-3 text-center">Staff</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {[
                     'View Financial Reports', 'Manage User Accounts', 'Delete Reservations', 
                     'Override Pricing', 'Edit Settings', 'View Client Contact Info'
                  ].map((perm, i) => (
                     <tr key={i}>
                        <td className="px-6 py-4 font-medium text-slate-700">{perm}</td>
                        <td className="px-6 py-4 text-center"><CheckCircle size={18} className="text-green-500 mx-auto"/></td>
                        <td className="px-6 py-4 text-center">
                           <Switch checked={[0,2,3,5].includes(i)} onCheckedChange={()=>{}} />
                        </td>
                        <td className="px-6 py-4 text-center">
                           <Switch checked={[5].includes(i)} onCheckedChange={()=>{}} />
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Card>
      </div>
   );
};

const FacilityView = () => {
   return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-300">
        <SectionHeader title="Facility Information" description="General settings for location, hours, and capacity." />

        <Card className="p-6 space-y-6">
           <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Location Details</h3>
           <div className="grid grid-cols-2 gap-4">
              <div><Label>Facility Name</Label><Input defaultValue="Partners Dog Training"/></div>
              <div><Label>Timezone</Label><Select><option>Arizona (UTC-7)</option></Select></div>
              <div className="col-span-2"><Label>Address</Label><Input defaultValue="123 Dogwood Lane, Phoenix, AZ 85001"/></div>
              <div><Label>Phone</Label><Input defaultValue="(555) 123-4567"/></div>
              <div><Label>Email</Label><Input defaultValue="info@partnersdogs.com"/></div>
              <div><Label>Website</Label><Input defaultValue="www.partnersdogs.com"/></div>
           </div>
        </Card>

        <Card className="p-6 space-y-6">
           <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">Operating Hours</h3>
           <div className="space-y-4">
              {['Monday - Friday', 'Saturday', 'Sunday'].map(day => (
                 <div key={day} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 w-32">{day}</span>
                    <div className="flex gap-2 items-center">
                       <Input type="time" defaultValue="07:00" className="w-32"/>
                       <span className="text-slate-400">-</span>
                       <Input type="time" defaultValue="19:00" className="w-32"/>
                    </div>
                    <Switch checked={true} onCheckedChange={()=>{}} />
                 </div>
              ))}
           </div>
        </Card>
    </div>
   );
};

const IntakeFormsView = () => {
   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <SectionHeader 
            title="Field Configuration" 
            description="Customize the fields and data collection for profiles." 
            action={<Button className="gap-2"><Plus size={16}/> New Field</Button>}
         />
         
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
               <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-800">Pet Profile Fields</h3>
                  <Badge>Active</Badge>
               </div>
               
               <div className="space-y-3">
                  {[
                     { label: 'Veterinarian Name', type: 'Text', req: true, ai: false },
                     { label: 'Feeding Instructions', type: 'Long Text', req: true, ai: true },
                     { label: 'Medications', type: 'List', req: false, ai: false },
                     { label: 'Behavioral Issues', type: 'Select', req: true, ai: true },
                     { label: 'Vaccination Records', type: 'File Upload', req: true, ai: false },
                  ].map((field, i) => (
                     <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-white group hover:border-primary-200 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                           <div className="text-slate-300 cursor-move"><GripVertical size={16}/></div>
                           <div>
                              <div className="font-medium text-slate-800">{field.label}</div>
                              <div className="text-xs text-slate-500 flex gap-2 items-center">
                                 <span className="bg-slate-100 px-1 rounded">{field.type}</span>
                                 {field.req && <span className="text-red-500 font-medium">• Required</span>}
                                 {field.ai && <span className="text-indigo-500 flex items-center gap-0.5"><Sparkles size={10}/> AI Enabled</span>}
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Switch checked={true} onCheckedChange={()=>{}} />
                           <Button variant="ghost" size="icon"><Edit2 size={16}/></Button>
                        </div>
                     </div>
                  ))}
               </div>
            </Card>

            <Card className="p-6 space-y-4">
               <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-800">Owner Profile Fields</h3>
                  <Badge>Active</Badge>
               </div>
               
               <div className="space-y-3">
                   {[
                     { label: 'Emergency Contact', type: 'Group', req: true, ai: false },
                     { label: 'Authorized Pickups', type: 'List', req: true, ai: false },
                     { label: 'Marketing Source', type: 'Select', req: false, ai: false },
                     { label: 'Agreements / Waivers', type: 'Signature', req: true, ai: false },
                  ].map((field, i) => (
                     <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-white group hover:border-primary-200 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                           <div className="text-slate-300 cursor-move"><GripVertical size={16}/></div>
                           <div>
                              <div className="font-medium text-slate-800">{field.label}</div>
                               <div className="text-xs text-slate-500 flex gap-2 items-center">
                                 <span className="bg-slate-100 px-1 rounded">{field.type}</span>
                                 {field.req && <span className="text-red-500 font-medium">• Required</span>}
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Switch checked={true} onCheckedChange={()=>{}} />
                           <Button variant="ghost" size="icon"><Edit2 size={16}/></Button>
                        </div>
                     </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>
   );
};

// --- Main Admin Layout ---

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
      id: 'comm', 
      label: 'Communications', 
      icon: Mail,
      items: [
         { id: 'templates', label: 'Email/SMS Templates', view: <CommunicationsView /> },
         { id: 'auto', label: 'Automations', view: <AutomationsView /> },
         { id: 'portal', label: 'Customer Portal', view: <EmptyState title="Portal Customization" message="Settings for branding and portal features." /> },
      ]
   },
   { 
      id: 'staff', 
      label: 'Team', 
      icon: Users,
      items: [
         { id: 'users', label: 'User Accounts', view: <UserAccountsView /> },
         { id: 'roles', label: 'Permissions', view: <PermissionsView /> },
         { id: 'ratios', label: 'Staff Ratios & Capacity', view: <StaffRatiosView /> },
         { id: 'audit', label: 'Audit Logs', view: <AuditLogView /> },
         { id: 'time', label: 'Time Clock', view: <EmptyState title="Time Clock" message="Shift scheduling and time tracking settings." /> },
      ]
   },
   { 
      id: 'system', 
      label: 'System', 
      icon: Settings,
      items: [
         { id: 'facility', label: 'Facility Info', view: <FacilityView /> },
         { id: 'forms', label: 'Field Configuration', view: <IntakeFormsView /> },
         { id: 'data', label: 'Data Import/Export', view: <EmptyState title="Data Tools" message="Import/Export functionality coming soon." /> },
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
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <Input 
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
