
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
import { Card, Button, Input, Switch, Select, Label, Textarea, cn, Badge, Tabs, Modal, SortableHeader } from './Common';
import { 
  MOCK_SERVICE_CONFIGS, MOCK_EMAIL_TEMPLATES, 
  MOCK_UNITS, MOCK_USERS, MOCK_AUTOMATIONS, MOCK_AUDIT_LOGS,
  MOCK_PACKAGES, MOCK_MEMBERSHIPS, MOCK_VET_CLINICS, MOCK_VETERINARIANS,
  MOCK_OWNERS, MOCK_PETS
} from '../constants';
import { ServiceType, Package, Membership, Role, Permission, PricingRule, TaxRate, FormTemplate, InvoiceSettings, ServiceQuota, PortalSettings } from '../types';
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

// --- New Feature Views ---

const PortalSettingsView = () => {
  const { portalSettings, updatePortalSettings, facilityInfo } = useSystem();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader 
        title="Customer Portal Settings" 
        description="Configure the client-facing experience."
        action={
          <Button variant="outline" className="gap-2" onClick={() => window.open('#', '_blank')}>
            <ExternalLink size={16}/> View Live Portal
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Enable Portal</h3>
                <p className="text-xs text-slate-500">Allow clients to log in and manage their account.</p>
              </div>
              <Switch checked={portalSettings.enabled} onCheckedChange={(c) => updatePortalSettings({ enabled: c })} />
            </div>
            
            <div className="h-px bg-slate-100"></div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Online Booking</h3>
                <p className="text-xs text-slate-500">Allow clients to request reservations.</p>
              </div>
              <Switch checked={portalSettings.allowOnlineBooking} onCheckedChange={(c) => updatePortalSettings({ allowOnlineBooking: c })} />
            </div>

            <div className="h-px bg-slate-100"></div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Online Payments</h3>
                <p className="text-xs text-slate-500">Allow clients to pay invoices securely.</p>
              </div>
              <Switch checked={portalSettings.allowPayments} onCheckedChange={(c) => updatePortalSettings({ allowPayments: c })} />
            </div>

            <div className="h-px bg-slate-100"></div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Require Waiver</h3>
                <p className="text-xs text-slate-500">Must sign liability waiver before booking.</p>
              </div>
              <Switch checked={portalSettings.requireWaiver} onCheckedChange={(c) => updatePortalSettings({ requireWaiver: c })} />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Megaphone size={16}/> Portal Announcement</h3>
            <div>
              <Label>Banner Message</Label>
              <Textarea 
                value={portalSettings.announcement} 
                onChange={(e) => updatePortalSettings({ announcement: e.target.value })}
                placeholder="Important news for your clients..."
                className="h-24"
              />
              <p className="text-xs text-slate-400 mt-1">This message will appear at the top of the portal dashboard.</p>
            </div>
          </Card>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4 text-slate-500 uppercase text-xs font-bold tracking-wider">
             <Monitor size={14}/> Portal Preview
          </div>
          <div className="bg-slate-100 border border-slate-200 shadow-lg rounded-xl overflow-hidden min-h-[600px] flex flex-col relative">
             {/* Mock Browser Bar */}
             <div className="h-8 bg-slate-200 border-b border-slate-300 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-white h-5 rounded mx-4 text-[10px] text-slate-400 flex items-center px-2 truncate">
                   portal.partnersdogs.com
                </div>
             </div>

             {/* Portal Content */}
             <div className="flex-1 bg-white p-6 flex flex-col font-sans">
                <div className="flex justify-between items-center mb-8">
                   <div className="flex items-center gap-2 text-primary-600 font-bold text-lg">
                      <Dog size={24}/> {facilityInfo.name}
                   </div>
                   <div className="flex gap-3 text-sm font-medium text-slate-600">
                      <span>Book Now</span>
                      <span>My Pets</span>
                      <span>Invoices</span>
                      <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                   </div>
                </div>

                {portalSettings.announcement && (
                   <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-lg mb-6 text-sm flex gap-3">
                      <Info size={18} className="shrink-0"/>
                      {portalSettings.announcement}
                   </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center hover:bg-slate-100 transition-colors cursor-pointer">
                      <Calendar size={32} className="mx-auto mb-3 text-primary-500"/>
                      <h3 className="font-bold text-slate-800">New Reservation</h3>
                      <p className="text-xs text-slate-500 mt-1">Boarding, Daycare, Grooming</p>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center hover:bg-slate-100 transition-colors cursor-pointer">
                      <Camera size={32} className="mx-auto mb-3 text-pink-500"/>
                      <h3 className="font-bold text-slate-800">Photo Gallery</h3>
                      <p className="text-xs text-slate-500 mt-1">See today's fun!</p>
                   </div>
                </div>

                <div className="mt-auto border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
                   &copy; {new Date().getFullYear()} {facilityInfo.name}
                </div>
             </div>
             
             {!portalSettings.enabled && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-white z-10 flex-col">
                   <Lock size={48} className="mb-4 opacity-50"/>
                   <h3 className="text-xl font-bold">Portal is Disabled</h3>
                   <p className="text-sm opacity-70 mt-2">Clients cannot access this page currently.</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StaffRatiosView = () => {
  const [ratios, setRatios] = useState([
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

const BrandingView = () => {
  const { theme, updateTheme, resetTheme, presets } = useTheme();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
       <SectionHeader 
          title="White Label & Branding" 
          description="Customize the look and feel of the platform to match your business identity."
          action={<Button variant="outline" onClick={resetTheme} className="gap-2"><RefreshCw size={14}/> Reset to Default</Button>} 
       />

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
             
             {/* Presets */}
             <Card className="p-5">
                <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2"><Palette size={16}/> Quick Themes</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                   {presets.map((preset, i) => (
                      <button
                         key={i}
                         onClick={() => updateTheme(preset)}
                         className={cn(
                            "h-12 w-12 rounded-full border-2 flex items-center justify-center transition-all shadow-sm",
                            theme.primaryColor === preset.primaryColor ? "border-slate-900 ring-2 ring-slate-200" : "border-slate-200 hover:border-slate-400"
                         )}
                         style={{ background: `linear-gradient(135deg, ${preset.primaryColor} 50%, ${preset.secondaryColor} 50%)` }}
                         title={`Theme ${i + 1}`}
                      >
                         {theme.primaryColor === preset.primaryColor && <Check size={16} className="text-white drop-shadow-md"/>}
                      </button>
                   ))}
                </div>
             </Card>

             {/* Colors */}
             <Card className="p-5 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Sparkles size={16}/> Brand Colors</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                      <Label>Primary Brand Color</Label>
                      <div className="flex items-center gap-2 mt-1">
                         <input 
                           type="color" 
                           value={theme.primaryColor} 
                           onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                           className="h-10 w-16 p-1 rounded cursor-pointer border border-slate-300"
                         />
                         <Input 
                           value={theme.primaryColor} 
                           onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                           className="uppercase font-mono"
                         />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Buttons, active states, highlights.</p>
                   </div>

                   <div>
                      <Label>Sidebar / Dark Mode</Label>
                      <div className="flex items-center gap-2 mt-1">
                         <input 
                           type="color" 
                           value={theme.secondaryColor} 
                           onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                           className="h-10 w-16 p-1 rounded cursor-pointer border border-slate-300"
                         />
                         <Input 
                           value={theme.secondaryColor} 
                           onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                           className="uppercase font-mono"
                         />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Navigation sidebar background.</p>
                   </div>
                </div>
             </Card>

             {/* Typography & Shape */}
             <Card className="p-5 space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Type size={16}/> Typography & Shape</h3>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <Label>Font Family</Label>
                      <Select 
                        value={theme.fontFamily} 
                        onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                      >
                         <option value="Inter">Inter (Default)</option>
                         <option value="Roboto">Roboto (Modern)</option>
                         <option value="Lato">Lato (Friendly)</option>
                         <option value="Playfair Display">Playfair (Elegant)</option>
                      </Select>
                   </div>
                   
                   <div>
                      <Label>Border Radius</Label>
                      <Select 
                        value={theme.borderRadius} 
                        onChange={(e) => updateTheme({ borderRadius: e.target.value })}
                      >
                         <option value="0px">Square (0px)</option>
                         <option value="0.25rem">Small (4px)</option>
                         <option value="0.5rem">Medium (8px)</option>
                         <option value="0.75rem">Large (12px)</option>
                         <option value="1rem">Rounded (16px)</option>
                      </Select>
                   </div>
                </div>
             </Card>
          </div>

          {/* Live Preview */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
             <div className="flex items-center gap-2 mb-4 text-slate-500 uppercase text-xs font-bold tracking-wider">
                <Monitor size={14}/> Live Preview
             </div>

             {/* Preview Component Container */}
             <div className="bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden flex flex-col h-[500px]">
                {/* Mock Header */}
                <div className="h-14 border-b flex items-center px-4 justify-between" style={{ borderColor: '#e2e8f0' }}>
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: theme.primaryColor }}>
                         P
                      </div>
                      <span className="font-bold text-slate-800">Preview App</span>
                   </div>
                   <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                   </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                   {/* Mock Sidebar */}
                   <div className="w-48 text-white p-4 flex flex-col gap-2" style={{ backgroundColor: theme.secondaryColor }}>
                      <div className="opacity-50 text-[10px] uppercase font-bold mb-2">Menu</div>
                      {[1, 2, 3].map(i => (
                         <div key={i} className="h-8 rounded w-full flex items-center px-2 opacity-80 bg-white/10">
                            <div className="w-4 h-4 rounded-full bg-white/20 mr-2"></div>
                            <div className="w-16 h-2 rounded bg-white/20"></div>
                         </div>
                      ))}
                      <div className="mt-auto h-12 rounded bg-white/10 flex items-center px-3 gap-2">
                         <div className="w-8 h-8 rounded bg-white/20"></div>
                         <div className="w-12 h-2 rounded bg-white/20"></div>
                      </div>
                   </div>

                   {/* Mock Content */}
                   <div className="flex-1 p-6 bg-slate-50 overflow-y-auto">
                      <div className="flex justify-between items-center mb-6">
                         <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                         <Button>Primary Action</Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                         {[1, 2].map(i => (
                            <Card key={i} className="p-4 border-l-4" style={{ borderLeftColor: theme.primaryColor }}>
                               <div className="text-slate-500 text-xs uppercase font-bold mb-1">Statistic</div>
                               <div className="text-2xl font-bold text-slate-900">1,234</div>
                            </Card>
                         ))}
                      </div>

                      <Card className="p-0 overflow-hidden">
                         <div className="p-3 border-b bg-slate-50 flex items-center justify-between">
                            <span className="font-bold text-slate-700 text-sm">Recent Activity</span>
                            <Badge>New</Badge>
                         </div>
                         <div className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                  <User size={14} className="text-slate-400"/>
                               </div>
                               <div className="flex-1">
                                  <div className="h-3 w-32 bg-slate-200 rounded mb-1"></div>
                                  <div className="h-2 w-20 bg-slate-100 rounded"></div>
                               </div>
                               <Button size="sm" variant="outline">Details</Button>
                            </div>
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: theme.primaryColor }}>
                                  JD
                                </div>
                               <div className="flex-1">
                                  <div className="h-3 w-24 bg-slate-200 rounded mb-1"></div>
                                  <div className="h-2 w-16 bg-slate-100 rounded"></div>
                               </div>
                               <Button size="sm" variant="ghost">Edit</Button>
                            </div>
                         </div>
                      </Card>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

const DataToolsView = () => {
  const [importType, setImportType] = useState('Owners');
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleImport = () => {
     setIsImporting(true);
     setProgress(0);
     const interval = setInterval(() => {
        setProgress(prev => {
           if (prev >= 100) {
              clearInterval(interval);
              setIsImporting(false);
              alert("Import Complete!");
              return 100;
           }
           return prev + 10;
        });
     }, 200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
       <SectionHeader 
          title="Data Management" 
          description="Import records from legacy systems or export your data for backups."
       />

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Import */}
          <Card className="p-6 space-y-4 border-l-4 border-l-blue-500">
             <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><UploadCloud size={20}/> Import Data</h3>
                <Badge>CSV / JSON</Badge>
             </div>
             
             <div>
                <Label>Data Type</Label>
                <Select value={importType} onChange={(e) => setImportType(e.target.value)}>
                   <option>Owners</option>
                   <option>Pets</option>
                   <option>Reservations</option>
                   <option>Vaccinations</option>
                </Select>
             </div>

             <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer bg-slate-50/50">
                <FileJson size={32} className="mb-2 opacity-50"/>
                <p className="text-sm font-medium text-slate-600">Drag file here</p>
                <p className="text-xs">or click to browse</p>
             </div>

             {isImporting ? (
                <div className="space-y-2">
                   <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Importing {importType}...</span>
                      <span>{progress}%</span>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${progress}%` }}></div>
                   </div>
                </div>
             ) : (
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleImport}>Start Import</Button>
             )}
          </Card>

          {/* Export */}
          <Card className="p-6 space-y-4 border-l-4 border-l-green-500">
             <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Download size={20}/> Export Data</h3>
                <Badge variant="success">All Time</Badge>
             </div>
             
             <p className="text-sm text-slate-600">Download system records in standard CSV format for reporting or backup purposes.</p>

             <div className="space-y-3">
                {[
                   { label: 'Client Database', count: MOCK_OWNERS.length, type: 'owners' },
                   { label: 'Pet Records', count: MOCK_PETS.length, type: 'pets' },
                   { label: 'Financial Transactions', count: 1240, type: 'finance' },
                ].map(item => (
                   <div key={item.type} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
                      <div>
                         <div className="font-bold text-slate-800 text-sm">{item.label}</div>
                         <div className="text-xs text-slate-500">{item.count} records</div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2"><Download size={14}/> CSV</Button>
                   </div>
                ))}
             </div>

             <div className="pt-4 border-t border-slate-100">
                <Button variant="outline" className="w-full gap-2 border-slate-300 text-slate-700"><Database size={16}/> Full System Backup (SQL)</Button>
             </div>
          </Card>
       </div>
    </div>
  );
};

const HealthSettingsView = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <SectionHeader 
      title="Health Requirements" 
      description="Configure required vaccinations and health checks."
      action={<Button className="gap-2"><Plus size={16}/> Add Requirement</Button>}
    />
    <div className="grid grid-cols-1 gap-4">
      {[
         { name: 'Rabies', type: 'Core', duration: '1 or 3 Years', grace: '0 Days', requiredFor: 'All Services' },
         { name: 'Bordetella', type: 'Core', duration: '6 Months or 1 Year', grace: '0 Days', requiredFor: 'All Services' },
         { name: 'DHPP / DA2PP', type: 'Core', duration: '1 or 3 Years', grace: '0 Days', requiredFor: 'All Services' },
         { name: 'Canine Influenza', type: 'Optional', duration: '1 Year', grace: '0 Days', requiredFor: 'Boarding Only' }
      ].map((vax, i) => (
         <Card key={i} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Syringe size={20}/>
               </div>
               <div>
                  <div className="flex items-center gap-2">
                     <h3 className="font-bold text-slate-900">{vax.name}</h3>
                     <Badge variant={vax.type === 'Core' ? 'danger' : 'default'}>{vax.type}</Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                     Required for: {vax.requiredFor} • Valid for: {vax.duration}
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <Switch checked={true} onCheckedChange={()=>{}} />
               <Button variant="ghost" size="icon"><Edit2 size={16} className="text-slate-400"/></Button>
            </div>
         </Card>
      ))}
    </div>
  </div>
);

const IntakeFormsView = () => {
  const { forms, addForm, updateForm, deleteForm } = useSystem();
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [newFormName, setNewFormName] = useState('');

  const activeForm = forms.find(f => f.id === selectedFormId);

  const handleAddField = () => {
    if (!activeForm) return;
    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: 'New Question',
      type: 'text',
      required: false,
      placeholder: ''
    };
    updateForm(activeForm.id, { fields: [...activeForm.fields, newField] });
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    if (!activeForm) return;
    const updatedFields = activeForm.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f);
    updateForm(activeForm.id, { fields: updatedFields });
  };

  const removeField = (fieldId: string) => {
    if (!activeForm) return;
    updateForm(activeForm.id, { fields: activeForm.fields.filter(f => f.id !== fieldId) });
  };

  const createNewForm = () => {
    if (!newFormName.trim()) return;
    const newForm: FormTemplate = {
      id: `form-${Date.now()}`,
      name: newFormName,
      description: 'Custom form',
      category: 'Intake',
      fields: [],
      isActive: true,
      lastUpdated: new Date().toISOString()
    };
    addForm(newForm);
    setSelectedFormId(newForm.id);
    setIsEditingForm(false);
    setNewFormName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-[calc(100vh-200px)] flex flex-col">
      <SectionHeader 
        title="Form Builder" 
        description="Create and manage custom intake forms and waivers."
        action={<Button className="gap-2" onClick={() => setIsEditingForm(true)}><Plus size={16}/> New Form</Button>}
      />

      <div className="flex h-full gap-6">
        {/* Form List */}
        <Card className="w-64 flex flex-col overflow-hidden shrink-0">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-500 uppercase">Available Forms</div>
          <div className="flex-1 overflow-y-auto">
            {forms.map(form => (
              <div 
                key={form.id} 
                onClick={() => setSelectedFormId(form.id)}
                className={cn(
                  "p-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors flex justify-between items-center group",
                  selectedFormId === form.id ? "bg-blue-50 border-l-4 border-l-blue-500" : "border-l-4 border-transparent"
                )}
              >
                <div>
                  <div className="font-bold text-sm text-slate-800">{form.name}</div>
                  <div className="text-[10px] text-slate-500">{form.fields.length} Fields • {form.category}</div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); deleteForm(form.id); if(selectedFormId === form.id) setSelectedFormId(null); }}>
                  <Trash2 size={12} className="text-red-400 hover:text-red-600"/>
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {activeForm ? (
            <>
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900">{activeForm.name}</h3>
                  <p className="text-xs text-slate-500">{activeForm.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Active</span>
                    <Switch checked={activeForm.isActive} onCheckedChange={(c) => updateForm(activeForm.id, { isActive: c })} />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2"><Eye size={14}/> Preview</Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-100/50">
                {activeForm.fields.length === 0 && (
                  <div className="text-center p-8 border-2 border-dashed border-slate-300 rounded-lg text-slate-400">
                    No fields yet. Click "Add Field" to start building.
                  </div>
                )}
                {activeForm.fields.map((field, idx) => (
                  <Card key={field.id} className="p-4 flex gap-4 items-start group hover:border-blue-300 transition-colors">
                    <div className="mt-2 text-slate-300 cursor-grab active:cursor-grabbing"><GripVertical size={16}/></div>
                    <div className="flex-1 grid grid-cols-12 gap-4">
                      <div className="col-span-6">
                        <Label>Field Label</Label>
                        <Input value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} />
                      </div>
                      <div className="col-span-3">
                        <Label>Type</Label>
                        <Select value={field.type} onChange={(e) => updateField(field.id, { type: e.target.value as any })}>
                          <option value="text">Short Text</option>
                          <option value="textarea">Long Text</option>
                          <option value="number">Number</option>
                          <option value="select">Dropdown</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="date">Date</option>
                          <option value="header">Section Header</option>
                          <option value="signature">Signature</option>
                        </Select>
                      </div>
                      <div className="col-span-3 flex items-center gap-4 mt-6">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })} className="rounded border-slate-300"/>
                          Required
                        </label>
                      </div>
                      
                      {/* Conditional Options for Select */}
                      {field.type === 'select' && (
                        <div className="col-span-12 bg-slate-50 p-3 rounded border border-slate-200">
                          <Label>Options (comma separated)</Label>
                          <Input 
                            value={field.options?.join(', ')} 
                            onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })} 
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500 mt-1" onClick={() => removeField(field.id)}>
                      <Trash2 size={16}/>
                    </Button>
                  </Card>
                ))}
                
                <Button variant="outline" className="w-full border-dashed gap-2 py-4 text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50" onClick={handleAddField}>
                  <Plus size={16}/> Add Form Field
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <FileText size={48} className="opacity-20 mb-4"/>
              <p>Select a form to edit or create a new one.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isEditingForm} onClose={() => setIsEditingForm(false)} title="Create New Form" size="sm">
        <div className="space-y-4">
          <div><Label>Form Name</Label><Input autoFocus value={newFormName} onChange={e => setNewFormName(e.target.value)} placeholder="e.g. Grooming Consent"/></div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setIsEditingForm(false)}>Cancel</Button>
            <Button onClick={createNewForm} disabled={!newFormName}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const PricingRulesView = () => {
  const { pricingRules, addPricingRule, updatePricingRule, deletePricingRule } = useSystem();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<PricingRule>>({});

  const handleSave = () => {
    if (editingRule.id) {
      updatePricingRule(editingRule.id, editingRule);
    } else {
      addPricingRule({ ...editingRule, id: `pr-${Date.now()}`, enabled: true } as PricingRule);
    }
    setIsModalOpen(false);
    setEditingRule({});
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader 
        title="Pricing Rules" 
        description="Configure dynamic pricing modifiers, fees, and discounts."
        action={<Button className="gap-2" onClick={() => { setEditingRule({}); setIsModalOpen(true); }}><Plus size={16}/> Add Rule</Button>}
      />

      <div className="grid grid-cols-1 gap-4">
        {pricingRules.map(rule => (
          <Card key={rule.id} className="p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div className={cn("p-2 rounded-lg", rule.amount < 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")}>
                <DollarSign size={20}/>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{rule.name}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Badge variant="outline">{rule.type}</Badge>
                  <span>Trigger: {rule.triggerCondition}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="font-bold text-lg text-slate-800">
                  {rule.amount > 0 ? '+' : ''}{rule.amount}{rule.isPercentage ? '%' : ''}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Adjustment</div>
              </div>
              <Switch checked={rule.enabled} onCheckedChange={(c) => updatePricingRule(rule.id, { enabled: c })} />
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => { setEditingRule(rule); setIsModalOpen(true); }}><Edit2 size={16}/></Button>
                <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600" onClick={() => deletePricingRule(rule.id)}><Trash2 size={16}/></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRule.id ? "Edit Pricing Rule" : "New Pricing Rule"}>
        <div className="space-y-4">
          <div><Label>Rule Name</Label><Input value={editingRule.name || ''} onChange={e => setEditingRule({...editingRule, name: e.target.value})} placeholder="e.g. Holiday Surcharge"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={editingRule.type || 'LateCheckOut'} onChange={e => setEditingRule({...editingRule, type: e.target.value as any})}>
                <option value="LateCheckOut">Late Check Out</option>
                <option value="Holiday">Holiday</option>
                <option value="MultiPet">Multi-Pet</option>
                <option value="ExtendedStay">Extended Stay</option>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <div className="flex gap-2">
                <Input type="number" value={editingRule.amount || ''} onChange={e => setEditingRule({...editingRule, amount: parseFloat(e.target.value)})} className="flex-1" />
                <div className="flex items-center gap-2 border rounded px-2 bg-slate-50">
                  <label className="text-xs flex items-center gap-1 cursor-pointer"><input type="radio" checked={!editingRule.isPercentage} onChange={() => setEditingRule({...editingRule, isPercentage: false})} /> $</label>
                  <label className="text-xs flex items-center gap-1 cursor-pointer"><input type="radio" checked={editingRule.isPercentage} onChange={() => setEditingRule({...editingRule, isPercentage: true})} /> %</label>
                </div>
              </div>
            </div>
          </div>
          <div><Label>Trigger Condition</Label><Input value={editingRule.triggerCondition || ''} onChange={e => setEditingRule({...editingRule, triggerCondition: e.target.value})} placeholder="e.g. After 12:00 PM"/></div>
          <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Rule</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const TaxSettingsView = () => {
  const { taxRates, addTaxRate, updateTaxRate, deleteTaxRate } = useSystem();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<Partial<TaxRate>>({});

  const handleSave = () => {
    if (editingRate.id) {
      updateTaxRate(editingRate.id, editingRate);
    } else {
      addTaxRate({ ...editingRate, id: `tr-${Date.now()}` } as TaxRate);
    }
    setIsModalOpen(false);
    setEditingRate({});
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader 
        title="Tax Settings" 
        description="Configure tax rates for services and products."
        action={<Button className="gap-2" onClick={() => { setEditingRate({ appliesToServices: true, appliesToProducts: true }); setIsModalOpen(true); }}><Plus size={16}/> Add Tax Rate</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {taxRates.map(rate => (
          <Card key={rate.id} className="p-5 flex flex-col justify-between group hover:border-primary-300 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{rate.name}</h3>
                <div className="text-3xl font-bold text-slate-800 mt-2">{rate.rate}%</div>
              </div>
              <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                <Calculator size={20}/>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                {rate.appliesToServices ? <CheckCircle size={14} className="text-green-500"/> : <X size={14} className="text-slate-300"/>}
                Services
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                {rate.appliesToProducts ? <CheckCircle size={14} className="text-green-500"/> : <X size={14} className="text-slate-300"/>}
                Products / Retail
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" onClick={() => { setEditingRate(rate); setIsModalOpen(true); }}>Edit</Button>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => deleteTaxRate(rate.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRate.id ? "Edit Tax Rate" : "New Tax Rate"} size="sm">
        <div className="space-y-4">
          <div><Label>Name</Label><Input value={editingRate.name || ''} onChange={e => setEditingRate({...editingRate, name: e.target.value})} placeholder="e.g. State Sales Tax"/></div>
          <div>
            <Label>Rate (%)</Label>
            <Input type="number" value={editingRate.rate || ''} onChange={e => setEditingRate({...editingRate, rate: parseFloat(e.target.value)})} />
          </div>
          <div className="space-y-2 pt-2">
            <Label>Applies To</Label>
            <label className="flex items-center gap-2 border p-3 rounded hover:bg-slate-50 cursor-pointer">
              <input type="checkbox" checked={editingRate.appliesToServices} onChange={e => setEditingRate({...editingRate, appliesToServices: e.target.checked})} className="rounded border-slate-300"/>
              Services (Boarding, Grooming, etc.)
            </label>
            <label className="flex items-center gap-2 border p-3 rounded hover:bg-slate-50 cursor-pointer">
              <input type="checkbox" checked={editingRate.appliesToProducts} onChange={e => setEditingRate({...editingRate, appliesToProducts: e.target.checked})} className="rounded border-slate-300"/>
              Products (Retail, Food, etc.)
            </label>
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Rate</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const InvoiceConfigView = () => {
  const { invoiceSettings, updateInvoiceSettings, facilityInfo } = useSystem();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader 
        title="Invoice Configuration" 
        description="Customize the appearance and default settings for your invoices."
        action={<Button onClick={() => alert('Settings Saved')} className="gap-2"><Save size={16}/> Save Changes</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Form */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Settings size={16}/> General Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Invoice Prefix</Label><Input value={invoiceSettings.prefix} onChange={e => updateInvoiceSettings({ prefix: e.target.value })}/></div>
              <div><Label>Next Number</Label><Input type="number" value={invoiceSettings.nextNumber} onChange={e => updateInvoiceSettings({ nextNumber: parseInt(e.target.value) })}/></div>
            </div>
            <div>
              <Label>Payment Due</Label>
              <Select value={invoiceSettings.dueDays} onChange={e => updateInvoiceSettings({ dueDays: parseInt(e.target.value) })}>
                <option value={0}>Due on Receipt</option>
                <option value={15}>Net 15</option>
                <option value={30}>Net 30</option>
              </Select>
            </div>
            <div><Label>Tax Label</Label><Input value={invoiceSettings.taxLabel} onChange={e => updateInvoiceSettings({ taxLabel: e.target.value })}/></div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Type size={16}/> Content & Footer</h3>
            <div>
              <Label>Default Terms & Conditions</Label>
              <Textarea className="h-24" value={invoiceSettings.terms} onChange={e => updateInvoiceSettings({ terms: e.target.value })}/>
            </div>
            <div>
              <Label>Footer Note</Label>
              <Input value={invoiceSettings.footerNote} onChange={e => updateInvoiceSettings({ footerNote: e.target.value })}/>
            </div>
          </Card>
        </div>

        {/* Live Preview */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-slate-500 uppercase text-xs font-bold tracking-wider">
             <Monitor size={14}/> Live Preview
          </div>
          <div className="bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden min-h-[600px] text-xs flex flex-col">
             {/* Invoice Header */}
             <div className="p-8 border-b border-slate-100 flex justify-between">
                <div>
                   <div className="h-10 w-10 bg-slate-900 rounded mb-4 flex items-center justify-center text-white font-bold">LOGO</div>
                   <div className="font-bold text-slate-800 text-lg">{facilityInfo.name}</div>
                   <div className="text-slate-500">{facilityInfo.address.street}</div>
                   <div className="text-slate-500">{facilityInfo.address.city}, {facilityInfo.address.state} {facilityInfo.address.zip}</div>
                </div>
                <div className="text-right">
                   <div className="text-3xl font-light text-slate-300 uppercase mb-2">Invoice</div>
                   <div className="font-bold text-slate-700">{invoiceSettings.prefix}{invoiceSettings.nextNumber}</div>
                   <div className="text-slate-500 mt-1">Date: {new Date().toLocaleDateString()}</div>
                   <div className="text-slate-500">Due: {invoiceSettings.dueDays === 0 ? 'On Receipt' : `In ${invoiceSettings.dueDays} Days`}</div>
                </div>
             </div>

             {/* Invoice Body (Mock) */}
             <div className="p-8 flex-1">
                <div className="mb-8">
                   <div className="text-slate-400 font-bold uppercase mb-1">Bill To:</div>
                   <div className="font-bold text-slate-800">John Doe</div>
                   <div className="text-slate-500">123 Maple St, Phoenix, AZ</div>
                </div>

                <table className="w-full text-left mb-8">
                   <thead className="border-b-2 border-slate-100 text-slate-500 font-bold uppercase">
                      <tr>
                         <th className="py-2">Description</th>
                         <th className="py-2 text-center">Qty</th>
                         <th className="py-2 text-right">Price</th>
                         <th className="py-2 text-right">Total</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      <tr><td className="py-3">5 Nights Boarding</td><td className="text-center">5</td><td className="text-right">$55.00</td><td className="text-right">$275.00</td></tr>
                      <tr><td className="py-3">Exit Bath</td><td className="text-center">1</td><td className="text-right">$30.00</td><td className="text-right">$30.00</td></tr>
                   </tbody>
                </table>

                <div className="flex justify-end">
                   <div className="w-48 space-y-2">
                      <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>$305.00</span></div>
                      <div className="flex justify-between text-slate-500"><span>{invoiceSettings.taxLabel} (8%)</span><span>$24.40</span></div>
                      <div className="flex justify-between font-bold text-slate-900 text-lg border-t border-slate-200 pt-2"><span>Total</span><span>$329.40</span></div>
                   </div>
                </div>
             </div>

             {/* Invoice Footer */}
             <div className="p-8 bg-slate-50 border-t border-slate-200 text-center">
                <p className="font-bold text-slate-700 mb-1">Terms & Conditions</p>
                <p className="text-slate-500 mb-4">{invoiceSettings.terms}</p>
                <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">{invoiceSettings.footerNote}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UsageQuotasView = () => {
  const { quotas, updateQuota } = useSystem();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader 
        title="Usage & Capacity Quotas" 
        description="Set capacity limits and buffer thresholds for different services."
        action={<Button onClick={() => alert('Settings Saved')} className="gap-2"><Save size={16}/> Save Quotas</Button>}
      />

      <div className="grid grid-cols-1 gap-6">
        {quotas.map(quota => (
          <Card key={quota.serviceType} className="p-6 border-l-4" style={{ borderLeftColor: quota.serviceType === ServiceType.Boarding ? '#3b82f6' : quota.serviceType === ServiceType.Daycare ? '#22c55e' : '#a855f7' }}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                {quota.serviceType}
                <Badge variant="outline">Capacity Management</Badge>
              </h3>
              <div className="bg-slate-100 p-2 rounded text-slate-600 font-mono font-bold text-sm">
                Max: {quota.maxDailyCapacity}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <Label>Max Daily Capacity</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={quota.maxDailyCapacity} 
                    onChange={(e) => updateQuota(quota.serviceType, { maxDailyCapacity: parseInt(e.target.value) })}
                    className="font-bold text-lg"
                  />
                  <span className="text-sm text-slate-500">slots</span>
                </div>
                <p className="text-xs text-slate-400">Total physical availability.</p>
              </div>

              <div className="space-y-2">
                <Label>Online Booking Limit</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={quota.onlineBookingLimit} 
                    onChange={(e) => updateQuota(quota.serviceType, { onlineBookingLimit: parseInt(e.target.value) })}
                  />
                  <span className="text-sm text-slate-500">slots</span>
                </div>
                <p className="text-xs text-slate-400">Reserve remainder for phone bookings.</p>
              </div>

              <div className="space-y-2">
                <Label>Overbooking Buffer</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={quota.overbookingBuffer} 
                    onChange={(e) => updateQuota(quota.serviceType, { overbookingBuffer: parseInt(e.target.value) })}
                  />
                  <span className="text-sm text-slate-500">slots</span>
                </div>
                <p className="text-xs text-slate-400">Allow slight overbook for cancellations.</p>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="mt-6 pt-4 border-t border-slate-100">
               <div className="flex justify-between text-xs font-bold text-slate-400 uppercase mb-1">
                  <span>Online Limit</span>
                  <span>Total Capacity</span>
               </div>
               <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-blue-500" style={{ width: `${(quota.onlineBookingLimit / quota.maxDailyCapacity) * 100}%` }}></div>
                  <div className="h-full bg-slate-200" style={{ width: `${((quota.maxDailyCapacity - quota.onlineBookingLimit) / quota.maxDailyCapacity) * 100}%` }}></div>
                  {quota.overbookingBuffer > 0 && (
                     <div className="h-full bg-amber-400 w-4 striped-bg" title="Buffer"></div>
                  )}
               </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// --- Added Missing Views ---

const ReservationTypesView = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <SectionHeader
      title="Reservation Types"
      description="Configure service types, base rates, and colors."
      action={<Button className="gap-2"><Plus size={16}/> Add Type</Button>}
    />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MOCK_SERVICE_CONFIGS.map(config => (
        <Card key={config.id} className="p-4 flex items-center justify-between border-l-4" style={{ borderLeftColor: config.color }}>
          <div>
            <h3 className="font-bold text-slate-900">{config.name}</h3>
            <p className="text-xs text-slate-500">{config.type} • Charged per {config.unitType}</p>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg">${config.baseRate}</div>
            <Badge variant={config.enabled ? 'success' : 'default'}>{config.enabled ? 'Active' : 'Disabled'}</Badge>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const LodgingUnitsView = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <SectionHeader
      title="Lodging Units"
      description="Manage kennels, suites, and runs."
      action={<Button className="gap-2"><Plus size={16}/> Add Unit</Button>}
    />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {MOCK_UNITS.map(unit => (
        <Card key={unit.id} className="p-3">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-slate-900">{unit.name}</h3>
            <Badge variant="outline">{unit.size}</Badge>
          </div>
          <div className="text-xs text-slate-500 mb-2">{unit.type}</div>
          <Badge variant={unit.status === 'Active' ? 'success' : 'warning'} className="w-full justify-center">{unit.status}</Badge>
        </Card>
      ))}
    </div>
  </div>
);

const AddonsRetailView = () => <EmptyState title="Add-ons & Retail" message="Configuration for service add-ons and retail products." />;

const PackagesMembershipsView = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <SectionHeader title="Packages" description="Pre-paid service bundles." action={<Button size="sm"><Plus size={14}/> Add</Button>} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {MOCK_PACKAGES.map(pkg => (
        <Card key={pkg.id} className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-slate-900">{pkg.name}</h3>
            <div className="font-bold">${pkg.price}</div>
          </div>
          <p className="text-xs text-slate-500 mt-1">{pkg.description}</p>
        </Card>
      ))}
    </div>
    <SectionHeader title="Memberships" description="Recurring subscription plans." action={<Button size="sm"><Plus size={14}/> Add</Button>} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MOCK_MEMBERSHIPS.map(mem => (
        <Card key={mem.id} className="p-4 border-t-4 border-t-purple-500">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-slate-900">{mem.name}</h3>
            <div className="font-bold">${mem.price}<span className="text-xs text-slate-400 font-normal">/mo</span></div>
          </div>
          <p className="text-xs text-slate-500 mt-1">{mem.description}</p>
        </Card>
      ))}
    </div>
  </div>
);

const VetHospitalSettingsView = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <SectionHeader title="Veterinary Hospitals" description="Manage local clinics and vets." action={<Button className="gap-2"><Plus size={16}/> Add Clinic</Button>} />
    <div className="space-y-3">
      {MOCK_VET_CLINICS.map(clinic => (
        <Card key={clinic.id} className="p-4 flex justify-between items-center">
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-2">
              {clinic.name}
              {clinic.emergency && <Badge variant="danger">Emergency</Badge>}
            </div>
            <div className="text-xs text-slate-500">{clinic.phone} • {clinic.address}</div>
          </div>
          <Button variant="ghost" size="sm">Edit</Button>
        </Card>
      ))}
    </div>
  </div>
);

const CommunicationsView = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <SectionHeader title="Communication Templates" description="Email and SMS templates." action={<Button className="gap-2"><Plus size={16}/> Add Template</Button>} />
    <div className="grid grid-cols-1 gap-4">
      {MOCK_EMAIL_TEMPLATES.map(t => (
        <Card key={t.id} className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-slate-900">{t.name}</h3>
            <Badge variant="outline">{t.type}</Badge>
          </div>
          <div className="text-xs text-slate-500">Trigger: {t.trigger}</div>
          <div className="mt-2 text-xs bg-slate-50 p-2 rounded border border-slate-100 font-mono truncate">
            {t.subject || t.body}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const AutomationsView = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <SectionHeader title="Automation Rules" description="Event-based triggers and actions." />
    {MOCK_AUTOMATIONS.map(auto => (
      <Card key={auto.id} className="p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900">{auto.name}</h3>
          <div className="text-xs text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">If</span> {auto.trigger} <span className="font-semibold text-slate-700">Then</span> {auto.action}
          </div>
        </div>
        <Switch checked={auto.enabled} onCheckedChange={()=>{}} />
      </Card>
    ))}
  </div>
);

const UserAccountsView = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <SectionHeader title="User Accounts" description="Manage staff access and roles." action={<Button className="gap-2"><Plus size={16}/> Add User</Button>} />
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
      </thead>
      <tbody>
        {MOCK_USERS.map(user => (
          <tr key={user.id} className="border-b border-slate-50">
            <td className="p-3 font-medium">{user.name}<div className="text-xs text-slate-500">{user.email}</div></td>
            <td className="p-3"><Badge variant="outline">{user.role}</Badge></td>
            <td className="p-3"><Badge variant={user.status === 'Active' ? 'success' : 'default'}>{user.status}</Badge></td>
            <td className="p-3 text-right"><Button variant="ghost" size="sm">Edit</Button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PermissionsView = () => {
  const { roles } = useSystem();
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader title="Roles & Permissions" description="Define access levels for different staff groups." />
      <div className="space-y-4">
        {roles.map(role => (
          <Card key={role.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-slate-900">{role.name}</h3>
              <div className="text-xs text-slate-500">{role.usersCount} users</div>
            </div>
            <p className="text-sm text-slate-600 mb-3">{role.description}</p>
            <div className="flex flex-wrap gap-1">
              {role.permissions.slice(0, 5).map(p => (
                <Badge key={p} variant="outline" className="text-[10px] bg-slate-50">{p.replace(/_/g, ' ')}</Badge>
              ))}
              {role.permissions.length > 5 && <Badge variant="outline" className="text-[10px] bg-slate-50">+{role.permissions.length - 5} more</Badge>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const AuditLogView = () => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <SectionHeader title="Audit Log" description="System activity and security events." />
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {MOCK_AUDIT_LOGS.map(log => (
        <div key={log.id} className="p-3 border-b border-slate-100 text-sm flex justify-between items-center bg-white hover:bg-slate-50">
          <div>
            <div className="font-bold text-slate-700">{log.action} <span className="font-normal text-slate-500">by {log.actor}</span></div>
            <div className="text-xs text-slate-400">{log.details} • {log.target}</div>
          </div>
          <div className="text-xs text-slate-400">{log.timestamp}</div>
        </div>
      ))}
    </div>
  </div>
);

const TimeClockSettingsView = () => {
  const { timeClockSettings, updateTimeClockSettings } = useSystem();
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader title="Time Clock Settings" description="Configure shifts, overtime, and geo-fencing." />
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label>Enable Time Clock</Label>
            <p className="text-xs text-slate-500">Allow staff to clock in/out.</p>
          </div>
          <Switch checked={timeClockSettings.enabled} onCheckedChange={c => updateTimeClockSettings({ enabled: c })} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Geo-Fencing</Label>
            <p className="text-xs text-slate-500">Require staff to be on-site.</p>
          </div>
          <Switch checked={timeClockSettings.geoFencing} onCheckedChange={c => updateTimeClockSettings({ geoFencing: c })} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Auto-Clock Out (Hours)</Label><Input type="number" value={timeClockSettings.autoClockOutHours} onChange={e => updateTimeClockSettings({ autoClockOutHours: parseInt(e.target.value) })}/></div>
          <div><Label>Overtime Threshold (Weekly)</Label><Input type="number" value={timeClockSettings.overtimeThresholdWeekly} onChange={e => updateTimeClockSettings({ overtimeThresholdWeekly: parseInt(e.target.value) })}/></div>
        </div>
      </Card>
    </div>
  );
};

const FacilityView = () => {
  const { facilityInfo, updateFacilityInfo } = useSystem();
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader title="Facility Information" description="Business details shown on invoices and emails." action={<Button className="gap-2"><Save size={16}/> Save</Button>} />
      <Card className="p-6 grid grid-cols-2 gap-6">
        <div><Label>Facility Name</Label><Input value={facilityInfo.name} onChange={e => updateFacilityInfo({ name: e.target.value })}/></div>
        <div><Label>Tax ID</Label><Input value={facilityInfo.taxId} onChange={e => updateFacilityInfo({ taxId: e.target.value })}/></div>
        <div><Label>Email</Label><Input value={facilityInfo.email} onChange={e => updateFacilityInfo({ email: e.target.value })}/></div>
        <div><Label>Phone</Label><Input value={facilityInfo.phone} onChange={e => updateFacilityInfo({ phone: e.target.value })}/></div>
        <div className="col-span-2"><Label>Address</Label><Input value={`${facilityInfo.address.street}, ${facilityInfo.address.city}, ${facilityInfo.address.state} ${facilityInfo.address.zip}`} readOnly /></div>
        <div className="col-span-2"><Label>Website</Label><Input value={facilityInfo.website} onChange={e => updateFacilityInfo({ website: e.target.value })}/></div>
      </Card>
    </div>
  );
};

// --- Updated Admin Layout to include new views ---

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
