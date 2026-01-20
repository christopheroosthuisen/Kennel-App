
import React, { useState } from 'react';
import { 
  Search, Phone, Mail, MapPin, Dog, Plus, AlertTriangle, FileText, Syringe, 
  History, User, CheckCircle, File, Download, MessageSquare, Edit2, Sparkles,
  Pill, Stethoscope, Paperclip, Calendar, Utensils, LayoutGrid, List as ListIcon, MoreHorizontal,
  MessageCircle, Building2, UploadCloud, Globe, Link as LinkIcon, Trash2
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Card, Button, Input, Tabs, Badge, cn, Modal, Label, Textarea, Select, BulkActionBar, SortableHeader } from './Common';
import { EditOwnerModal, EditPetModal } from './EditModals';
import { useCommunication } from './Messaging';
import { useTeamChat } from './TeamChatContext';
import { MOCK_VET_CLINICS } from '../constants'; // Keep vet clinics static for now
import { Pet, Vaccine, Owner } from '../types';
import { useData } from './DataContext';

export const Profiles = () => {
  const { owners, pets, invoices, reservations, addOwner, addPet } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('type') || 'owners';
  const viewMode = searchParams.get('view') || 'grid';
  const search = searchParams.get('search') || '';
  const selectedId = searchParams.get('id');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isNewOwnerOpen, setIsNewOwnerOpen] = useState(false);
  const [isNewPetOpen, setIsNewPetOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{key: string, dir: 'asc' | 'desc'}>({ key: 'name', dir: 'asc' });

  const { openCompose } = useCommunication();

  // Update URL helper
  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) newParams.delete(key);
      else newParams.set(key, value);
    });
    setSearchParams(newParams);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedData = (data: any[]) => {
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
      if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredOwners = owners.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || o.email.includes(search));
  const filteredPets = pets.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const sortedOwners = getSortedData(filteredOwners);
  const sortedPets = getSortedData(filteredPets);

  const selectAll = () => {
    if (activeTab === 'owners') setSelectedIds(filteredOwners.map(o => o.id));
    else setSelectedIds(filteredPets.map(p => p.id));
  };

  const handleCreateOwner = () => {
    // Logic to collect form data would be here. Using mock data for 'New' entry.
    const newOwner: Owner = {
      id: `o${Date.now()}`,
      name: 'New Client',
      phone: '555-0000',
      email: 'new@client.com',
      balance: 0,
      address: '123 New St',
      notes: '',
      tags: [],
      files: []
    };
    addOwner(newOwner);
    setIsNewOwnerOpen(false);
    alert("New Owner Created (Mock Data used for demo)");
  };

  const handleCreatePet = () => {
    // Logic to collect form data
    const newPet: Pet = {
      id: `p${Date.now()}`,
      ownerId: owners[0]?.id || 'o1',
      name: 'New Pet',
      breed: 'Mixed',
      weight: 10,
      dob: new Date().toISOString(),
      gender: 'M',
      fixed: false,
      vaccineStatus: 'Valid',
      photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop',
      vet: 'Unknown',
      feedingInstructions: 'Standard',
      alerts: []
    };
    addPet(newPet);
    setIsNewPetOpen(false);
    alert("New Pet Created (Mock Data used for demo)");
  };

  if (selectedId) {
    if (activeTab === 'owners') return <OwnerDetail id={selectedId} onBack={() => updateParams({ id: null })} />;
    return <PetDetail id={selectedId} onBack={() => updateParams({ id: null })} />;
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Directory</h1>
          <div className="flex gap-2">
             <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
                <Button 
                  size="icon" 
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                  className={cn("h-8 w-8", viewMode === 'grid' && "bg-white shadow-sm")}
                  onClick={() => updateParams({ view: 'grid' })}
                >
                   <LayoutGrid size={16}/>
                </Button>
                <Button 
                  size="icon" 
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  className={cn("h-8 w-8", viewMode === 'list' && "bg-white shadow-sm")}
                  onClick={() => updateParams({ view: 'list' })}
                >
                   <ListIcon size={16}/>
                </Button>
             </div>
             <Button 
               className="gap-2"
               onClick={() => activeTab === 'owners' ? setIsNewOwnerOpen(true) : setIsNewPetOpen(true)}
             >
               <Plus size={16}/> New {activeTab === 'owners' ? 'Owner' : 'Pet'}
             </Button>
          </div>
       </div>

       <Tabs 
         activeTab={activeTab} 
         onChange={(id) => { updateParams({ type: id }); setSelectedIds([]); }} 
         tabs={[
           { id: 'owners', label: 'Owners', count: owners.length },
           { id: 'pets', label: 'Pets', count: pets.length }
         ]} 
       />

       <div className="flex justify-between items-center gap-4">
          <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder={`Search ${activeTab}...`} 
                className="pl-9" 
                value={search} 
                onChange={(e) => updateParams({ search: e.target.value })} 
              />
          </div>
          <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
       </div>

       {viewMode === 'grid' ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTab === 'owners' ? (
               sortedOwners.map(owner => (
                 <div key={owner.id} className="relative group">
                   <input 
                     type="checkbox" 
                     className="absolute top-4 right-4 z-10 h-5 w-5 rounded border-slate-300 cursor-pointer"
                     checked={selectedIds.includes(owner.id)}
                     onChange={() => toggleSelect(owner.id)}
                   />
                   <Card 
                      className={cn("p-4 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 h-full border-2", selectedIds.includes(owner.id) ? "border-primary-500 bg-primary-50" : "border-transparent")}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).tagName !== 'INPUT') updateParams({ id: owner.id });
                      }}
                   >
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-lg text-slate-900 group-hover:text-primary-600 transition-colors">{owner.name}</div>
                        <Badge variant={owner.balance > 0 ? 'warning' : 'success'}>${owner.balance.toFixed(2)}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2"><Phone size={14}/> {owner.phone}</div>
                        <div className="flex items-center gap-2"><Mail size={14}/> {owner.email}</div>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex gap-2 flex-wrap mt-auto">
                        {pets.filter(p => p.ownerId === owner.id).map(p => (
                          <React.Fragment key={p.id}>
                            <Badge variant="outline" className="bg-slate-50">{p.name}</Badge>
                          </React.Fragment>
                        ))}
                      </div>
                   </Card>
                 </div>
               ))
            ) : (
               sortedPets.map(pet => (
                 <div key={pet.id} className="relative group">
                   <input 
                     type="checkbox" 
                     className="absolute top-4 right-4 z-10 h-5 w-5 rounded border-slate-300 cursor-pointer"
                     checked={selectedIds.includes(pet.id)}
                     onChange={() => toggleSelect(pet.id)}
                   />
                   <Card 
                      className={cn("p-4 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 h-full border-2", selectedIds.includes(pet.id) ? "border-primary-500 bg-primary-50" : "border-transparent")}
                      onClick={(e) => {
                         if ((e.target as HTMLElement).tagName !== 'INPUT') updateParams({ id: pet.id });
                      }}
                    >
                      <img src={pet.photoUrl} className="h-16 w-16 rounded-full object-cover border border-slate-200" alt={pet.name} />
                      <div>
                        <div className="font-bold text-lg text-slate-900 group-hover:text-primary-600 transition-colors">{pet.name}</div>
                        <div className="text-sm text-slate-500">{pet.breed}</div>
                        <div className="flex gap-1 mt-1">
                          {pet.alerts.map(a => <React.Fragment key={a}><Badge variant="danger" className="text-[10px] py-0">{a}</Badge></React.Fragment>)}
                        </div>
                      </div>
                   </Card>
                 </div>
               ))
            )}
         </div>
       ) : (
         <Card className="overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                     <th className="px-6 py-3 w-12"><input type="checkbox" onClick={selectAll} className="rounded border-slate-300"/></th>
                     <SortableHeader label="Name" sortKey="name" currentSort={sortConfig} onSort={handleSort} />
                     {activeTab === 'owners' ? (
                        <>
                           <SortableHeader label="Contact" sortKey="email" currentSort={sortConfig} onSort={handleSort} />
                           <SortableHeader label="Balance" sortKey="balance" currentSort={sortConfig} onSort={handleSort} />
                           <th className="px-6 py-3">Pets</th>
                        </>
                     ) : (
                        <>
                           <SortableHeader label="Breed" sortKey="breed" currentSort={sortConfig} onSort={handleSort} />
                           <SortableHeader label="Alerts" sortKey="alerts" currentSort={sortConfig} onSort={handleSort} />
                           <SortableHeader label="Vaccines" sortKey="vaccineStatus" currentSort={sortConfig} onSort={handleSort} />
                        </>
                     )}
                     <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 text-sm">
                  {activeTab === 'owners' ? sortedOwners.map(owner => (
                     <tr key={owner.id} className="hover:bg-slate-50 cursor-pointer" onClick={(e) => { if((e.target as HTMLElement).tagName !== 'INPUT') updateParams({ id: owner.id }) }}>
                        <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(owner.id)} onChange={() => toggleSelect(owner.id)} className="rounded border-slate-300"/></td>
                        <td className="px-6 py-4 font-medium text-slate-900">{owner.name}</td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col text-xs text-slate-600">
                              <span>{owner.email}</span>
                              <span>{owner.phone}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <span className={cn("font-bold", owner.balance > 0 ? "text-red-600" : "text-green-600")}>
                              ${owner.balance.toFixed(2)}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex gap-1">
                              {pets.filter(p => p.ownerId === owner.id).map(p => (
                                 <React.Fragment key={p.id}>
                                    <Badge variant="outline" className="text-[10px] bg-slate-50">{p.name}</Badge>
                                 </React.Fragment>
                              ))}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right"><Button variant="ghost" size="icon"><MoreHorizontal size={16}/></Button></td>
                     </tr>
                  )) : sortedPets.map(pet => (
                     <tr key={pet.id} className="hover:bg-slate-50 cursor-pointer" onClick={(e) => { if((e.target as HTMLElement).tagName !== 'INPUT') updateParams({ id: pet.id }) }}>
                        <td className="px-6 py-4"><input type="checkbox" checked={selectedIds.includes(pet.id)} onChange={() => toggleSelect(pet.id)} className="rounded border-slate-300"/></td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <img src={pet.photoUrl} className="h-8 w-8 rounded-full object-cover" alt=""/>
                              <span className="font-medium text-slate-900">{pet.name}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{pet.breed}</td>
                        <td className="px-6 py-4">
                           <div className="flex gap-1">
                              {pet.alerts.map(a => <React.Fragment key={a}><Badge variant="danger" className="text-[10px] py-0">{a}</Badge></React.Fragment>)}
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <Badge variant={pet.vaccineStatus === 'Valid' ? 'success' : pet.vaccineStatus === 'Expiring' ? 'warning' : 'danger'}>
                              {pet.vaccineStatus}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 text-right"><Button variant="ghost" size="icon"><MoreHorizontal size={16}/></Button></td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Card>
       )}

       <BulkActionBar 
          count={selectedIds.length} 
          onClear={() => setSelectedIds([])} 
          actions={
             <>
                <Button size="sm" variant="ghost" className="text-white hover:bg-slate-800 hover:text-white gap-2" onClick={() => openCompose({ type: 'Email' })}><Mail size={14}/> Email Selected</Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-slate-800 hover:text-white gap-2" onClick={() => openCompose({ type: 'SMS' })}><MessageSquare size={14}/> SMS Selected</Button>
             </>
          }
       />

       {/* New Owner Modal */}
       <Modal isOpen={isNewOwnerOpen} onClose={() => setIsNewOwnerOpen(false)} title="New Client Registration" size="lg">
         <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name</Label><Input placeholder="Jane"/></div>
              <div><Label>Last Name</Label><Input placeholder="Doe"/></div>
              <div><Label>Email</Label><Input placeholder="jane@example.com"/></div>
              <div><Label>Phone</Label><Input placeholder="(555) 123-4567"/></div>
              <div className="col-span-2"><Label>Address</Label><Input placeholder="123 Main St"/></div>
            </div>
            <div>
              <Label>Internal Notes</Label>
              <Textarea placeholder="Notes about this client..."/>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
              <Button variant="ghost" onClick={() => setIsNewOwnerOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateOwner}>Create Profile</Button>
            </div>
         </div>
       </Modal>

        {/* New Pet Modal */}
       <Modal isOpen={isNewPetOpen} onClose={() => setIsNewPetOpen(false)} title="New Pet Registration" size="lg">
         <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Owner</Label><Select><option>Alice Johnson</option><option>Bob Smith</option></Select></div>
              <div><Label>Pet Name</Label><Input placeholder="Buddy"/></div>
              <div><Label>Breed</Label><Input placeholder="Labrador"/></div>
              <div><Label>Gender</Label><Select><option>Male</option><option>Female</option></Select></div>
              <div><Label>Weight (lbs)</Label><Input type="number" placeholder="45"/></div>
              <div><Label>Birth Date</Label><Input type="date"/></div>
            </div>
            <div>
              <Label>Feeding Instructions</Label>
              <Textarea placeholder="1 cup AM/PM..."/>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
              <Button variant="ghost" onClick={() => setIsNewPetOpen(false)}>Cancel</Button>
              <Button onClick={handleCreatePet}>Create Pet</Button>
            </div>
         </div>
       </Modal>
    </div>
  );
};

// --- Medical Panel Component ---
const MedicalPanel = ({ pet }: { pet: Pet }) => {
   const clinic = MOCK_VET_CLINICS.find(c => c.id === pet.vetClinicId);
   const [vaccines, setVaccines] = useState<Vaccine[]>(pet.vaccines || []);
   const [isAddVaxOpen, setIsAddVaxOpen] = useState(false);

   const handleAddVaccine = (e: React.FormEvent) => {
      e.preventDefault();
      // Logic would go here to add new vaccine
      alert("Mock: Vaccine Added");
      setIsAddVaxOpen(false);
   };

   return (
      <div className="space-y-6">
         {/* Vet Clinic Info */}
         <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <Building2 size={20}/>
                     </div>
                     <div>
                        <h4 className="font-bold text-slate-800 text-sm">Primary Care Clinic</h4>
                        <div className="text-xs text-slate-500">{clinic ? clinic.name : 'No clinic linked'}</div>
                     </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8">Change</Button>
               </div>
               
               {clinic ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="space-y-1">
                        <div className="text-xs font-semibold text-slate-400 uppercase">Contact</div>
                        <div className="flex items-center gap-2 text-slate-700"><Phone size={14} className="text-slate-400"/> {clinic.phone}</div>
                        <div className="flex items-center gap-2 text-slate-700"><Mail size={14} className="text-slate-400"/> {clinic.email}</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-xs font-semibold text-slate-400 uppercase">Location</div>
                        <div className="flex items-start gap-2 text-slate-700">
                           <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0"/> 
                           <span className="leading-tight">{clinic.address}</span>
                        </div>
                     </div>
                     <div className="col-span-2 mt-2 pt-3 border-t border-slate-100 flex gap-2">
                        <Button variant="outline" size="sm" className="w-full gap-2"><LinkIcon size={14}/> Request Records</Button>
                        <Button variant="outline" size="sm" className="w-full gap-2"><Globe size={14}/> Website</Button>
                     </div>
                  </div>
               ) : (
                  <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-lg">
                     No veterinary clinic associated.<br/>
                     <span className="text-primary-600 cursor-pointer hover:underline">Link a Clinic</span>
                  </div>
               )}
            </div>

            {/* Quick Stats or Alerts */}
            <div className="w-full md:w-64 space-y-3">
               <Card className="p-4 bg-red-50 border-red-100">
                  <h4 className="font-bold text-red-800 text-sm flex items-center gap-2"><AlertTriangle size={16}/> Critical Alerts</h4>
                  <ul className="list-disc list-inside mt-2 text-xs text-red-700 space-y-1">
                     {pet.vaccineStatus !== 'Valid' && <li>Vaccinations {pet.vaccineStatus}</li>}
                     {pet.alerts.map(a => <li key={a}>{a}</li>)}
                     {pet.vaccineStatus === 'Valid' && pet.alerts.length === 0 && <li className="text-slate-400 italic list-none">No active alerts.</li>}
                  </ul>
               </Card>
               <Card className="p-4 bg-blue-50 border-blue-100">
                  <h4 className="font-bold text-blue-800 text-sm flex items-center gap-2"><Pill size={16}/> Active Meds</h4>
                  <div className="mt-2 text-xs text-blue-700">
                     {pet.medications?.length ? `${pet.medications.length} active prescriptions.` : "No medications tracked."}
                  </div>
               </Card>
            </div>
         </div>

         {/* Vaccination Table */}
         <Card className="overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
               <h3 className="font-bold text-slate-800 flex items-center gap-2"><Syringe size={18} className="text-slate-500"/> Vaccination History</h3>
               <Button size="sm" className="gap-2" onClick={() => setIsAddVaxOpen(true)}><Plus size={14}/> Add Vaccine</Button>
            </div>
            <table className="w-full text-left text-sm">
               <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                     <th className="px-6 py-3">Vaccine</th>
                     <th className="px-6 py-3">Date Administered</th>
                     <th className="px-6 py-3">Expiration Date</th>
                     <th className="px-6 py-3">Status</th>
                     <th className="px-6 py-3">Proof</th>
                     <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {vaccines.map(vax => (
                     <tr key={vax.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-800">{vax.name}</td>
                        <td className="px-6 py-4 text-slate-600">{new Date(vax.dateAdministered).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-mono text-slate-700">{new Date(vax.dateExpires).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                           <Badge variant={vax.status === 'Valid' ? 'success' : vax.status === 'Expiring' ? 'warning' : 'danger'}>
                              {vax.status}
                           </Badge>
                        </td>
                        <td className="px-6 py-4">
                           {vax.fileUrl ? (
                              <a href="#" className="flex items-center gap-1 text-primary-600 hover:underline text-xs">
                                 <Paperclip size={12}/> View
                              </a>
                           ) : <span className="text-slate-400 text-xs italic">Missing</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 size={14}/></Button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </Card>

         {/* File Upload Area */}
         <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer">
            <UploadCloud size={32} className="mb-2 opacity-50"/>
            <p className="text-sm font-medium text-slate-600">Upload Medical Records</p>
            <p className="text-xs">Drag and drop PDF or Images here, or click to browse.</p>
         </div>

         {/* Add Vaccine Modal */}
         <Modal isOpen={isAddVaxOpen} onClose={() => setIsAddVaxOpen(false)} title="Add Vaccination Record" size="sm">
            <form onSubmit={handleAddVaccine} className="space-y-4">
               <div>
                  <Label>Vaccine Type</Label>
                  <Select autoFocus>
                     <option>Rabies</option>
                     <option>Bordetella</option>
                     <option>DHPP</option>
                     <option>Influenza</option>
                     <option>Other</option>
                  </Select>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div><Label>Administered</Label><Input type="date"/></div>
                  <div><Label>Expires</Label><Input type="date"/></div>
               </div>
               <div>
                  <Label>Verified By</Label>
                  <Input placeholder="Staff Name"/>
               </div>
               <div>
                  <Label>Upload Proof (Optional)</Label>
                  <Input type="file"/>
               </div>
               <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
                  <Button type="button" variant="ghost" onClick={() => setIsAddVaxOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Record</Button>
               </div>
            </form>
         </Modal>
      </div>
   );
};

const OwnerDetail = ({ id, onBack }: { id: string, onBack: () => void }) => {
  const { owners, pets, reservations } = useData();
  const owner = owners.find(o => o.id === id);
  const ownerPets = pets.filter(p => p.ownerId === id);
  const ownerReservations = reservations.filter(r => r.ownerId === id);
  const { openDiscuss } = useTeamChat();
  const [tab, setTab] = useState('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!owner) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Button variant="ghost" onClick={onBack} className="pl-0 gap-1 text-slate-500"><Search size={16}/> Back to Directory</Button>
      
      {/* Header Profile Card */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
           <div className="flex gap-4">
              <div className="h-16 w-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold">
                 {owner.name.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                 <h1 className="text-3xl font-bold text-slate-900">{owner.name}</h1>
                 <div className="flex gap-4 text-slate-600 mt-2 text-sm">
                    <span className="flex items-center gap-1"><Phone size={14}/> {owner.phone}</span>
                    <span className="flex items-center gap-1"><Mail size={14}/> {owner.email}</span>
                    <span className="flex items-center gap-1"><MapPin size={14}/> {owner.address}</span>
                 </div>
                 <div className="flex gap-2 mt-3">
                    {owner.tags?.map(tag => <React.Fragment key={tag}><Badge variant="info">{tag}</Badge></React.Fragment>)}
                 </div>
              </div>
           </div>
           <div className="text-right space-y-2">
              <div className="text-sm text-slate-500">Account Balance</div>
              <div className={cn("text-3xl font-bold", owner.balance > 0 ? "text-red-600" : "text-green-600")}>
                 ${owner.balance.toFixed(2)}
              </div>
              <div className="flex gap-2 justify-end">
                 <Button size="sm" variant="ghost" className="bg-primary-50 text-primary-700 hover:bg-primary-100 border-none gap-2" onClick={() => openDiscuss({ type: 'owner', id: owner.id, title: owner.name, subtitle: 'Profile Flag' })}>
                    <MessageCircle size={14}/> Flag for Review
                 </Button>
                 <Button size="sm" variant="outline" onClick={() => setIsEditOpen(true)}>Edit Profile</Button>
                 <Button size="sm">Make Payment</Button>
              </div>
           </div>
        </div>
      </Card>

      <Tabs 
        activeTab={tab} 
        onChange={setTab} 
        tabs={[
          {id: 'overview', label: 'Overview'}, 
          {id: 'agreements', label: 'Agreements', count: owner.agreements?.length},
          {id: 'files', label: 'Files', count: owner.files?.length},
          {id: 'invoices', label: 'Financials'},
          {id: 'comm', label: 'Communications'}
        ]} 
      />

      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
             <Card className="p-4 space-y-3">
               <h3 className="font-bold text-slate-900 flex items-center gap-2"><Dog size={18}/> Household Pets</h3>
               {ownerPets.map(pet => (
                 <div key={pet.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer group transition-colors border border-transparent hover:border-slate-100">
                   <img src={pet.photoUrl} className="h-10 w-10 rounded-full object-cover" alt="" />
                   <div>
                      <div className="font-semibold text-slate-800 group-hover:text-primary-600">{pet.name}</div>
                      <div className="text-xs text-slate-500">{pet.breed}</div>
                   </div>
                 </div>
               ))}
               <Button variant="ghost" size="sm" className="w-full text-primary-600"><Plus size={14}/> Add Pet</Button>
             </Card>

             <Card className="p-4 space-y-3">
               <h3 className="font-bold text-slate-900 flex items-center gap-2"><User size={18}/> Emergency Contact</h3>
               {owner.emergencyContact ? (
                 <div className="text-sm">
                    <div className="font-semibold">{owner.emergencyContact.name} ({owner.emergencyContact.relation})</div>
                    <div className="text-slate-500">{owner.emergencyContact.phone}</div>
                 </div>
               ) : <div className="text-sm text-slate-400 italic">None listed</div>}
             </Card>
          </div>
          
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">
             <Card className="overflow-hidden">
               <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Recent & Upcoming Reservations</h3>
                  <Button variant="ghost" size="sm">View All</Button>
               </div>
               <table className="w-full text-sm text-left">
                 <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
                   <tr><th className="p-3">Date</th><th className="p-3">Pet</th><th className="p-3">Service</th><th className="p-3">Status</th></tr>
                 </thead>
                 <tbody>
                   {ownerReservations.map(r => (
                     <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                       <td className="p-3 font-medium text-slate-700">{new Date(r.checkIn).toLocaleDateString()}</td>
                       <td className="p-3">{ownerPets.find(p => p.id === r.petId)?.name}</td>
                       <td className="p-3">{r.type}</td>
                       <td className="p-3"><Badge>{r.status}</Badge></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </Card>
             
             <Card className="p-4 space-y-3">
                <h3 className="font-bold text-slate-800">Internal Notes</h3>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-100 text-sm text-yellow-900">
                  {owner.notes || "No notes available."}
                </div>
             </Card>
          </div>
        </div>
      )}

      {/* Placeholder Tabs */}
      {tab === 'agreements' && <div className="p-8 text-center text-slate-400">Agreements content</div>}
      {tab === 'files' && <div className="p-8 text-center text-slate-400">Files content</div>}
      {tab === 'invoices' && <div className="p-8 text-center text-slate-400">Invoices content</div>}
      {tab === 'comm' && <div className="p-8 text-center text-slate-400">Communications content</div>}

      {/* Edit Owner Modal */}
      {isEditOpen && <EditOwnerModal isOpen={true} onClose={() => setIsEditOpen(false)} id={owner.id} />}
    </div>
  );
};

const PetDetail = ({ id, onBack }: { id: string, onBack: () => void }) => {
  const { pets } = useData();
  const pet = pets.find(p => p.id === id);
  const { openDiscuss } = useTeamChat();
  const [tab, setTab] = useState('care');
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!pet) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Button variant="ghost" onClick={onBack} className="pl-0 gap-1 text-slate-500"><Search size={16}/> Back to Directory</Button>
      
      {/* Pet Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start">
         <img src={pet.photoUrl} className="h-32 w-32 rounded-lg object-cover shadow-sm bg-slate-100" alt={pet.name} />
         <div className="flex-1 w-full">
            <div className="flex justify-between items-start">
               <div>
                  <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    {pet.name} 
                    {pet.gender === 'M' ? <span className="text-blue-500 text-xl" title="Male">♂</span> : <span className="text-pink-500 text-xl" title="Female">♀</span>}
                  </h1>
                  <p className="text-slate-500 text-lg">{pet.breed} • {pet.weight} lbs • {new Date().getFullYear() - new Date(pet.dob).getFullYear()} yrs</p>
                  
                  <div className="flex gap-2 mt-2">
                     <Badge variant={pet.fixed ? 'success' : 'warning'}>{pet.fixed ? 'Fixed' : 'Intact'}</Badge>
                     {pet.color && <Badge variant="outline">Color: {pet.color}</Badge>}
                  </div>
               </div>
               <div className="flex gap-2">
                  <Button variant="ghost" className="bg-primary-50 text-primary-700 hover:bg-primary-100 border-none gap-2" onClick={() => openDiscuss({ type: 'pet', id: pet.id, title: pet.name, subtitle: 'Pet Profile Review' })}>
                     <MessageCircle size={14}/> Flag for Review
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditOpen(true)}>Edit Profile</Button>
                  <Button variant="primary">New Reservation</Button>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
               <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xs text-slate-400 uppercase font-bold">Vaccines</div>
                  <div className={cn("font-semibold mt-1 flex items-center gap-1", pet.vaccineStatus === 'Valid' ? "text-green-600" : "text-red-600")}>
                    <Syringe size={14}/> {pet.vaccineStatus}
                  </div>
               </div>
               <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xs text-slate-400 uppercase font-bold">Microchip</div>
                  <div className="font-semibold mt-1 text-slate-800 truncate">{pet.microchip || 'N/A'}</div>
               </div>
               <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xs text-slate-400 uppercase font-bold">Vet</div>
                  <div className="font-semibold mt-1 text-slate-800 truncate">{pet.vet}</div>
               </div>
               <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xs text-slate-400 uppercase font-bold">Alerts</div>
                  <div className="font-semibold mt-1 text-amber-600 flex items-center gap-1">
                     {pet.alerts.length > 0 ? <><AlertTriangle size={14}/> {pet.alerts.length} Active</> : "None"}
                  </div>
               </div>
            </div>
         </div>
      </div>

      <Tabs 
        activeTab={tab} 
        onChange={setTab} 
        tabs={[
           {id: 'care', label: 'Care Profile'}, 
           {id: 'medical', label: 'Medical & Vaccines', count: (pet.vaccines?.length || 0)}, 
           {id: 'behavior', label: 'Behavior'},
           {id: 'gallery', label: 'Gallery'}
        ]} 
      />

      {tab === 'care' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
               <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Utensils size={18} className="text-orange-500"/> Feeding Instructions</h3>
               <div className="bg-orange-50 p-4 rounded-md border border-orange-100 text-orange-900 leading-relaxed whitespace-pre-line">
                  {pet.feedingInstructions}
               </div>
            </Card>

             <Card className="p-4">
               <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Pill size={18} className="text-blue-500"/> Medications</h3>
               {pet.medications && pet.medications.length > 0 ? (
                  <div className="space-y-3">
                     {pet.medications.map(med => (
                        <div key={med.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50">
                           <div className="flex justify-between items-start">
                              <div className="font-bold text-slate-800">{med.name} <span className="text-slate-500 font-normal">({med.dosage})</span></div>
                              <Badge variant={med.active ? 'success' : 'default'}>{med.active ? 'Active' : 'Inactive'}</Badge>
                           </div>
                           <div className="text-sm text-slate-600 mt-1">{med.frequency} - {med.instructions}</div>
                        </div>
                     ))}
                  </div>
               ) : <div className="text-slate-400 italic">No active medications.</div>}
            </Card>
         </div>
      )}

      {/* Medical Tab Implementation */}
      {tab === 'medical' && <MedicalPanel pet={pet} />}

      {/* Placeholder tabs for Behavior, Gallery */}
      {tab === 'behavior' && <div className="p-8 text-center text-slate-400">Behavior content</div>}
      {tab === 'gallery' && <div className="p-8 text-center text-slate-400">Gallery content</div>}

      {/* Edit Pet Modal */}
      {isEditOpen && <EditPetModal isOpen={true} onClose={() => setIsEditOpen(false)} id={pet.id} />}
    </div>
  );
};
