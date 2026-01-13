
import React, { useState } from 'react';
import { 
  Settings, Shield, CreditCard, Bell, Database, Search, 
  ChevronRight, Sparkles, Building2, CalendarRange, 
  Users, FileText, Dog, Mail, DollarSign, Clock, LayoutGrid,
  CheckCircle, AlertCircle, Trash2, Edit2, Plus, GripVertical, Activity
} from 'lucide-react';
import { Card, Button, Input, Switch, Select, Label, Textarea, cn, Badge, Modal } from './Common';
import { useApiQuery } from '../hooks/useApiQuery';
import { api } from '../api/api';
import { KennelUnit, CatalogItem, UserAccount } from '../../shared/domain';

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

// --- Admin Views ---

const LodgingUnitsView = () => {
   const { data: units = [], refetch } = useApiQuery('units', api.getUnits);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [newUnit, setNewUnit] = useState<Partial<KennelUnit>>({ name: '', type: 'Run', size: 'L' });

   const handleSave = async () => {
      await api.createUnit(newUnit);
      setIsModalOpen(false);
      refetch();
   };

   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <SectionHeader 
            title="Lodging & Units" 
            description="Manage physical assets, kennels, suites, and capacity."
            action={<Button className="gap-2" onClick={() => setIsModalOpen(true)}><Plus size={16}/> Add Unit</Button>}
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
                  {units.map(unit => (
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

         <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Unit">
            <div className="space-y-4">
               <div><Label>Name</Label><Input value={newUnit.name} onChange={e => setNewUnit({...newUnit, name: e.target.value})} /></div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <Label>Type</Label>
                     <Select value={newUnit.type} onChange={e => setNewUnit({...newUnit, type: e.target.value as any})}>
                        {['Run', 'Suite', 'Cage', 'Playroom'].map(t => <option key={t}>{t}</option>)}
                     </Select>
                  </div>
                  <div>
                     <Label>Size</Label>
                     <Select value={newUnit.size} onChange={e => setNewUnit({...newUnit, size: e.target.value as any})}>
                        {['S', 'M', 'L', 'XL'].map(s => <option key={s}>{s}</option>)}
                     </Select>
                  </div>
               </div>
               <Button className="w-full mt-4" onClick={handleSave}>Create Unit</Button>
            </div>
         </Modal>
      </div>
   );
};

const ReservationTypesView = () => {
  const { data: items = [], refetch } = useApiQuery('catalog', api.getCatalog);
  const services = items.filter(i => i.type === 'Service');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({ name: '', basePrice: 0 });

  const handleSave = async () => {
     await api.createCatalogItem({ 
        name: newService.name, 
        basePrice: newService.basePrice * 100, 
        type: 'Service', 
        category: 'Boarding' 
     });
     setIsModalOpen(false);
     refetch();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
       <SectionHeader 
         title="Reservation Types & Services" 
         description="Configure standard boarding, daycare, and grooming options."
         action={<Button className="gap-2" onClick={() => setIsModalOpen(true)}><Plus size={16}/> New Service</Button>}
       />

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
             <Card key={service.id} className="overflow-hidden border-t-4 border-t-blue-500">
                <div className="p-4">
                   <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800">{service.name}</h3>
                      <Switch checked={service.isActive} onCheckedChange={() => {}} />
                   </div>
                   <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-bold text-slate-900">${(service.basePrice / 100).toFixed(2)}</span>
                   </div>
                </div>
             </Card>
          ))}
       </div>

       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Service">
          <div className="space-y-4">
             <div><Label>Name</Label><Input value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} /></div>
             <div><Label>Base Price ($)</Label><Input type="number" value={newService.basePrice} onChange={e => setNewService({...newService, basePrice: parseFloat(e.target.value)})} /></div>
             <Button className="w-full mt-4" onClick={handleSave}>Create Service</Button>
          </div>
       </Modal>
    </div>
  );
};

const UserAccountsView = () => {
   const { data: users = [], refetch } = useApiQuery('users', api.listUsers);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'Staff' });

   const handleCreate = async () => {
      await api.createUser(newUser as any);
      setIsModalOpen(false);
      refetch();
   };

   return (
      <div className="space-y-6 animate-in fade-in duration-300">
         <SectionHeader 
            title="User Accounts" 
            description="Manage staff access and profiles."
            action={<Button className="gap-2" onClick={() => setIsModalOpen(true)}><Plus size={16}/> Create User</Button>}
         />

         <Card className="overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                     <th className="px-6 py-3">Name</th>
                     <th className="px-6 py-3">Role</th>
                     <th className="px-6 py-3">Email</th>
                     <th className="px-6 py-3">Created</th>
                     <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {users.map(user => (
                     <tr key={user.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                                 {user.name.split(' ').map(n=>n[0]).join('')}
                              </div>
                              <div className="font-medium text-slate-900">{user.name}</div>
                           </div>
                        </td>
                        <td className="px-6 py-4"><Badge variant="outline">{user.role}</Badge></td>
                        <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{new Date((user as any).createdAt || Date.now()).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                           <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Card>

         <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New User">
            <div className="space-y-4">
               <div><Label>Name</Label><Input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} /></div>
               <div><Label>Email</Label><Input value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} /></div>
               <div><Label>Role</Label><Select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option>Admin</option><option>Manager</option><option>Staff</option>
               </Select></div>
               <div><Label>Password</Label><Input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} /></div>
               <Button className="w-full mt-4" onClick={handleCreate}>Create User</Button>
            </div>
         </Modal>
      </div>
   );
};

const AuditLogView = () => {
   const { data: logs = [] } = useApiQuery('audit', () => api.listAuditLogs({ limit: 50 }));

   return (
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
                  {logs.map(log => (
                     <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 font-medium">{log.actorName}</td>
                        <td className="px-6 py-4"><Badge variant="outline">{log.action}</Badge></td>
                        <td className="px-6 py-4 text-slate-700">{log.resourceType}</td>
                        <td className="px-6 py-4 text-slate-500">{log.details || log.resourceId}</td>
                     </tr>
                  ))}
                  {logs.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-400">No logs found</td></tr>}
               </tbody>
            </table>
         </Card>
      </div>
   );
};

const ADMIN_CATEGORIES = [
   { 
      id: 'ops', 
      label: 'Operations', 
      icon: CalendarRange,
      items: [
         { id: 'services', label: 'Reservation Types', view: <ReservationTypesView /> },
         { id: 'lodging', label: 'Lodging & Units', view: <LodgingUnitsView /> },
         { id: 'addons', label: 'Add-ons & Retail', view: <EmptyState title="Coming Soon" message="Implement via Catalog API" /> },
      ]
   },
   { 
      id: 'staff', 
      label: 'Team', 
      icon: Users,
      items: [
         { id: 'users', label: 'User Accounts', view: <UserAccountsView /> },
         { id: 'audit', label: 'Audit Logs', view: <AuditLogView /> },
      ]
   },
   // Add other categories with EmptyState placeholders if needed
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
